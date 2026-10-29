"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { getErrorMessage } from "@/utils/errors";
import { ROUTES } from "@/configs/routes";
import { APP_CONFIG } from "@/configs/constants";

export default function RegisterPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < APP_CONFIG.LIMITS.PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${APP_CONFIG.LIMITS.PASSWORD_MIN_LENGTH} characters long.`);
      return;
    }

    setLoading(true);
    try {
      // 1. Call register
      await register({
        full_name: fullName,
        email: email,
        password: password,
      });

      // 2. Automatically log the candidate in
      await login(email, password);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* Brand Hero Panel */}
      <div className="md:w-5/12 bg-ink text-white p-6 sm:p-8 md:p-12 flex flex-col justify-between border-r border-border-dark">
        <div>
          <Link href={ROUTES.HOME} className="flex items-center gap-2 mb-8 md:mb-12">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-ink text-lg">
              P
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              Nexora
            </span>
          </Link>

          <div className="space-y-4 max-w-sm">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent border border-accent/30">
              Personalized Growth
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight leading-snug">
              Begin your calibrated interview preparation.
            </h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload your resume once, select your desired seniority level and company,
              and receive instant calibrated assessment drills.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 md:mt-8 md:pt-8 border-t border-border-dark">
          <p className="text-xs text-slate-500">
            Free forever for candidate prep drills & foundational simulations.
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-surface-off">
        <div className="w-full max-w-md bg-surface p-6 sm:p-8 rounded-2xl border border-border-light shadow-sm">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-ink">Create an account</h2>
            <p className="text-sm text-slate-500 mt-1">
              Join to practice realistic mock interviews.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-danger font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Smith"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Min. 8 characters, max 72 characters"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="font-semibold text-ink hover:text-accent transition-colors underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
