"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/configs/routes";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-surface-off text-ink">
      {/* Navigation Header */}
      <header className="h-18 border-b border-border-light bg-surface px-6 md:px-12 flex items-center justify-between sticky top-0 z-40">
        <Link href={ROUTES.HOME} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-extrabold text-ink text-base shadow-xs">
            P
          </div>
          <span className="font-extrabold text-xl tracking-tight text-ink">
            Nexora
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link href={ROUTES.DASHBOARD}>
              <Button variant="primary" size="md">
                Go to Dashboard →
              </Button>
            </Link>
          ) : (
            <>
              <Link href={ROUTES.LOGIN}>
                <Button variant="ghost" size="md">
                  Sign In
                </Button>
              </Link>
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="md">
                  Start Free Assessment
                </Button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-ink text-white py-20 px-6 md:px-12 border-b border-border-dark flex flex-col items-center text-center relative overflow-hidden">
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            AI-Calibrated Mock Interviews
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none">
            Realistic Tech Mocks Tailored to{" "}
            <span className="text-accent underline decoration-accent/40 decoration-4">
              Your Real Resume
            </span>
            .
          </h1>

          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Stop answering generic algorithm puzzles. Nexora calibrates
            adaptive questions directly against your uploaded resume, target
            company hiring standards, and seniority level.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.REGISTER}>
              <Button variant="primary" size="lg" className="px-8 shadow-lg shadow-accent/20">
                Start Free Mock Drill →
              </Button>
            </Link>
            <Link href={ROUTES.LOGIN}>
              <Button variant="secondary" size="lg" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Social Proof Logos Strip */}
        <div className="mt-16 pt-10 border-t border-border-dark max-w-4xl w-full">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-6">
            Calibrated against hiring expectations at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400 font-bold text-sm tracking-wide opacity-70">
            <span>GOOGLE</span>
            <span>STRIPE</span>
            <span>DATADOG</span>
            <span>FIGMA</span>
            <span>AIRBNB</span>
            <span>UBER</span>
            <span>NETFLIX</span>
          </div>
        </div>
      </section>

      {/* 3-Step Walkthrough */}
      <section className="py-20 px-6 md:px-12 max-w-6xl w-full mx-auto space-y-12">
        <div className="text-center space-y-2">
          <Badge variant="accent">How It Works</Badge>
          <h2 className="text-3xl font-extrabold text-ink tracking-tight">
            Three steps from resume to interview readiness
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center font-extrabold text-ink text-base">
              1
            </div>
            <h3 className="text-lg font-bold text-ink">Upload Your Resume</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Drop your PDF or DOCX. Our parser extracts your project stack,
              production architecture, and technical competencies.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center font-extrabold text-ink text-base">
              2
            </div>
            <h3 className="text-lg font-bold text-ink">Choose Track & Level</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Targeting L5 Senior at Stripe or L4 at Google? Choose role,
              difficulty, and company to calibrate question depth.
            </p>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/40 flex items-center justify-center font-extrabold text-ink text-base">
              3
            </div>
            <h3 className="text-lg font-bold text-ink">Interactive Simulation & Roadmap</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Take the sequential turn-by-turn interview, receive instant
              evaluator scores, and generate an AI study roadmap.
            </p>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border-light bg-surface text-center text-xs text-slate-500">
        <p>© 2026 Nexora Platform. Built for high-bar engineering mock preparation.</p>
      </footer>
    </div>
  );
}
