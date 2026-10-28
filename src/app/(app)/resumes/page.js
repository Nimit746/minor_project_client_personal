"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { ResumeUploader } from "@/components/resume/ResumeUploader";
import { ResumeCard } from "@/components/resume/ResumeCard";
import {
  listResumes,
  uploadResume,
  deleteResume,
  getResume,
} from "@/services/resumeService";
import { startInterview } from "@/services/interviewService";
import { getErrorMessage } from "@/utils/errors";
import { ROUTES } from "@/configs/routes";
import { APP_CONFIG } from "@/configs/constants";

export default function ResumesPage() {
  const router = useRouter();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Resume deletion state
  const [deletingResume, setDeletingResume] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Start interview config state
  const [selectedResume, setSelectedResume] = useState(null);
  const [role, setRole] = useState(APP_CONFIG.INTERVIEW.DEFAULT_ROLE);
  const [company, setCompany] = useState("");
  const [difficulty, setDifficulty] = useState(APP_CONFIG.INTERVIEW.DEFAULT_DIFFICULTY);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadResumes() {
      try {
        const data = await listResumes();
        if (!isMounted) return;
        let list = Array.isArray(data) ? data : [];

        // If list endpoint doesn't populate status, enrich with detail for each resume
        if (list.length > 0 && list.some((r) => r.status == null && r.uuid)) {
          const detailed = await Promise.all(
            list.map((r) =>
              r.status == null && r.uuid
                ? getResume(r.uuid).catch(() => r)
                : Promise.resolve(r)
            )
          );
          if (!isMounted) return;
          list = detailed.map((d, i) => ({ ...list[i], ...d }));
        }

        setResumes(list);

        if (list.length > 0) {
          // Auto-select ready resume or first available
          const readyResume = list.find(
            (r) => r.status?.toLowerCase() === "ready"
          );
          const fallbackResume = list.find(
            (r) => r.status?.toLowerCase() !== "failed" && r.uuid
          );
          if (readyResume) {
            setSelectedResume(readyResume);
          } else if (fallbackResume) {
            setSelectedResume(fallbackResume);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadResumes();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle background polling for any resumes that are processing
  useEffect(() => {
    const processingResumes = resumes.filter((r) => {
      const s = r.status?.toLowerCase() ?? "";
      return s === "pending" || s === "processing";
    });
    if (processingResumes.length === 0) return;

    const timer = setInterval(async () => {
      try {
        const updated = await Promise.all(
          processingResumes.map((r) => getResume(r.uuid).catch(() => r))
        );
        setResumes((prev) => {
          const next = prev.map((r) => {
            const found = updated.find((u) => u && u.uuid === r.uuid);
            return found || r;
          });
          return next;
        });
        // Sync selectedResume if it became selectable
        setSelectedResume((current) => {
          if (!current) {
            // Auto-select first newly-selectable resume
            const newlySelectable = updated.find((u) => {
              if (!u) return false;
              const s = u.status?.toLowerCase() ?? "";
              return s !== "pending" && s !== "processing" && s !== "failed" && u.uuid;
            });
            return newlySelectable || null;
          }
          const freshVersion = updated.find((u) => u && u.uuid === current.uuid);
          return freshVersion || current;
        });
      } catch {
        // Continue polling safely
      }
    }, 2500);

    return () => clearInterval(timer);
  }, [resumes]);


  const handleUpload = async (file) => {
    setIsUploading(true);
    setError("");
    try {
      const newResume = await uploadResume(file);
      setResumes((prev) => [newResume, ...prev]);
      // Always track the newly uploaded resume (button stays disabled until status === "ready")
      setSelectedResume(newResume);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingResume) return;
    setIsDeleting(true);
    try {
      await deleteResume(deletingResume.uuid);
      setResumes((prev) => prev.filter((r) => r.uuid !== deletingResume.uuid));
      if (selectedResume?.uuid === deletingResume.uuid) {
        setSelectedResume(null);
      }
      setDeletingResume(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLaunchMock = async (e) => {
    e.preventDefault();
    if (!selectedResume) {
      setError("Please select a calibrated resume to use for this interview.");
      return;
    }
    if (!role) {
      setError("Please enter the target role.");
      return;
    }

    setIsStartingInterview(true);
    setError("");

    try {
      // Check current resume status from server
      let currentResume = selectedResume;
      try {
        const fresh = await getResume(selectedResume.uuid);
        if (fresh) {
          currentResume = { ...selectedResume, ...fresh };
          setResumes((prev) =>
            prev.map((r) => (r.uuid === fresh.uuid ? { ...r, ...fresh } : r))
          );
          setSelectedResume(currentResume);
        }
      } catch {
        // Fall back to local object if detail fetch fails
      }

      const s = currentResume.status?.toLowerCase() ?? "";
      if (s === "pending" || s === "processing") {
        setError(
          "Your resume is still being parsed and indexed by the AI backend. Please wait a moment until it finishes."
        );
        setIsStartingInterview(false);
        return;
      }

      if (s === "failed") {
        setError(
          `Resume parsing failed: ${currentResume.error || "Please upload a new resume."}`
        );
        setIsStartingInterview(false);
        return;
      }

      const interviewSession = await startInterview({
        resume_uuid: selectedResume.uuid,
        role: role,
        target_company: company || undefined,
        difficulty: difficulty,
      });

      router.push(ROUTES.INTERVIEW(interviewSession.session_uuid));
    } catch (err) {
      setError(getErrorMessage(err));
      setIsStartingInterview(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Resumes & Mock Calibration" />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-danger flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-danger hover:opacity-80 p-1"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Upload and List of Resumes */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6">
              <h3 className="font-bold text-base text-ink mb-1">
                Upload New Resume
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Our parser extracts key skills, technologies, and projects to
                calibrate interview questions directly to your actual experience.
              </p>
              <ResumeUploader onUpload={handleUpload} isUploading={isUploading} />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-base text-ink">
                  Your Resumes ({resumes.length})
                </h3>
                <span className="text-xs text-slate-500">
                  Select one to configure mock simulation
                </span>
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Loading resumes...
                </div>
              ) : resumes.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No resumes uploaded yet. Upload your PDF or DOCX above.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {resumes.map((resume) => (
                    <ResumeCard
                      key={resume.uuid}
                      resume={resume}
                      isSelected={selectedResume?.uuid === resume.uuid}
                      onSelect={(r) =>
                        setSelectedResume((prev) =>
                          prev?.uuid === r.uuid ? null : r
                        )
                      }
                      onDelete={(r) => setDeletingResume(r)}
                    />
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Right: Mock Calibration Launcher */}
          <div className="lg:col-span-5">
            <Card className="p-6 sticky top-6">
              <div className="space-y-1 mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Session Setup
                </span>
                <h3 className="font-bold text-lg text-ink">
                  Configure Calibrated Mock
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tailor the simulated interview to the specific company, seniority,
                  and role you are targeting.
                </p>
              </div>

              <form onSubmit={handleLaunchMock} className="space-y-4">
                {/* Selected Resume Banner */}
                <div className="p-3 rounded-lg border border-border-light bg-surface-off">
                  <span className="text-xs font-semibold text-slate-500 block mb-1">
                    Selected Resume
                  </span>
                  {selectedResume ? (
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-ink truncate">
                        {selectedResume.filename}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          (() => {
                            const s = selectedResume.status?.toLowerCase() ?? "";
                            return s === "pending" || s === "processing"
                              ? "text-amber-500"
                              : s === "failed"
                              ? "text-danger"
                              : "text-accent";
                          })()
                        }`}
                      >
                        {(() => {
                          const s = selectedResume.status?.toLowerCase() ?? "";
                          if (s === "pending" || s === "processing") return "Processing…";
                          if (s === "failed") return "Failed";
                          return "Ready";
                        })()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Please select a resume from the list
                    </span>
                  )}
                </div>

                <Input
                  label="Target Role"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />

                <Input
                  label="Target Company (Optional)"
                  placeholder="e.g. Google, Stripe, Datadog"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  helperText="Shapes question style, behavioral standards & system complexity"
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {APP_CONFIG.INTERVIEW.DIFFICULTIES.map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`py-2 px-3 rounded-md text-xs font-semibold capitalize border transition-all ${
                          difficulty === level
                            ? "bg-ink text-white border-ink shadow-xs"
                            : "bg-surface text-slate-700 border-border-light hover:bg-surface-off"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-4"
                  disabled={(() => {
                    if (!selectedResume) return true;
                    const s = selectedResume.status?.toLowerCase() ?? "";
                    // Disable only if explicitly processing or failed
                    return s === "pending" || s === "processing" || s === "failed";
                  })()}
                  loading={isStartingInterview}
                >
                  Start Calibrated Mock →
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingResume)}
        onClose={() => setDeletingResume(null)}
        title="Delete Resume"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setDeletingResume(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              loading={isDeleting}
            >
              Confirm Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700 leading-relaxed">
          Are you sure you want to delete{" "}
          <strong className="text-ink">{deletingResume?.filename}</strong>? This
          will permanently remove this resume and its parsed context from your
          account.
        </p>
      </Modal>
    </div>
  );
}
