"use client";

import React, { useState } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";
import { updateMe } from "@/services/userService";
import { getErrorMessage } from "@/utils/errors";

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setIsUpdating(true);
    setMessage("");
    setError("");

    try {
      await updateMe({ full_name: fullName.trim() });
      await refreshUser();
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Topbar title="Account & Preferences" />

      <main className="flex-1 p-4 sm:p-6 max-w-3xl w-full mx-auto space-y-6">
        {message && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            {message}
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-danger">
            {error}
          </div>
        )}

        <Card className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="font-bold text-base text-ink">Candidate Profile</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your display name and review account details.
            </p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
              required
            />

            <Input
              label="Email Address"
              value={user?.email || ""}
              disabled
              helperText="Email cannot be changed directly."
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isUpdating}
                disabled={!fullName.trim() || isUpdating}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        <Card className="p-6 md:p-8 bg-surface-off">
          <h4 className="font-bold text-sm text-ink mb-1">
            Calibration Privacy & Security
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Your uploaded resumes and interview turn transcripts are evaluated securely
            and strictly retained for your personal preparation history.
          </p>
        </Card>
      </main>
    </div>
  );
}
