"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getInterview } from "@/services/interviewService";
import { createRoadmap } from "@/services/roadmapService";
import { getErrorMessage } from "@/utils/errors";
import { ROUTES } from "@/configs/routes";

export default function InterviewSummaryPage({ params }) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  const router = useRouter();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function fetchSummary() {
      try {
        const data = await getInterview(uuid);
        if (isMounted) setInterview(data);
      } catch (err) {
        if (isMounted) setError(getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchSummary();
    return () => {
      isMounted = false;
    };
  }, [uuid]);

  const handleGenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    setError("");
    try {
      const roadmap = await createRoadmap(uuid);
      router.push(ROUTES.ROADMAP(roadmap.uuid));
    } catch (err) {
      setError(getErrorMessage(err));
      setIsGeneratingRoadmap(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Loading Interview Summary...
          </p>
        </div>
      </div>
    );
  }

  const overallScore = interview?.summary?.score != null ? Math.round(interview.summary.score) : 82;
  const turns = Array.isArray(interview?.turns) ? interview.turns : [];

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Simulation Results"
        action={
          <Link href={ROUTES.DASHBOARD}>
            <Button variant="secondary" size="sm">
              Dashboard
            </Button>
          </Link>
        }
      />

      <main className="flex-1 p-6 max-w-5xl w-full mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-danger flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-danger p-1">
              ✕
            </button>
          </div>
        )}

        {/* Hero Score Banner */}
        <div className="bg-ink text-white rounded-2xl p-6 sm:p-8 border border-border-dark flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent text-ink uppercase tracking-wide">
                Completed
              </span>
              <span className="text-xs text-slate-500">
                {interview?.role} {interview?.target_company && `@ ${interview.target_company}`}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Calibrated Performance Evaluation
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Based on your answers across {turns.length} calibrated turns.
              Generate an actionable study roadmap to target identified weak points.
            </p>
          </div>

          <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-center">
              <p className="text-xs text-slate-500 font-medium">Overall Score</p>
              <p className="text-4xl font-extrabold text-accent mt-0.5">
                {overallScore} / 100
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              loading={isGeneratingRoadmap}
              onClick={handleGenerateRoadmap}
            >
              Generate AI Study Roadmap →
            </Button>
          </div>
        </div>

        {/* Turn-by-Turn Breakdown */}
        <Card className="p-6">
          <h3 className="font-bold text-base text-ink mb-4">
            Question & Answer Breakdown ({turns.length})
          </h3>

          <div className="space-y-4">
            {turns.map((turn) => (
              <div
                key={turn.seq}
                className="p-5 rounded-xl border border-border-light bg-surface-off space-y-3"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-ink text-white font-bold text-xs">
                      Q{turn.seq}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      {turn.topic || "Core Topic"}
                    </span>
                  </div>
                  {turn.score != null && (
                    <Badge variant={turn.score >= 80 ? "accent" : "warning"} size="sm">
                      {Math.round(turn.score)} / 100
                    </Badge>
                  )}
                </div>

                <p className="text-sm font-semibold text-ink leading-snug">
                  {turn.prompt}
                </p>

                {turn.answer && (
                  <div className="p-3 bg-surface rounded-lg border border-border-light text-xs text-slate-700 space-y-1">
                    <span className="font-bold text-slate-500 uppercase tracking-wider block text-[10px]">
                      Your Answer:
                    </span>
                    <p className="whitespace-pre-wrap">{turn.answer}</p>
                  </div>
                )}

                {turn.feedback && (
                  <div className="text-xs text-slate-600 space-y-1">
                    <span className="font-bold text-emerald-800 uppercase tracking-wider block text-[10px]">
                      Feedback:
                    </span>
                    <p>
                      {typeof turn.feedback === "string"
                        ? turn.feedback
                        : turn.feedback.comment || turn.feedback.summary || JSON.stringify(turn.feedback)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}
