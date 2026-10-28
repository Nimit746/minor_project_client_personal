"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScoreLineChart } from "@/components/dashboard/ScoreLineChart";
import { TopicRadarChart } from "@/components/dashboard/TopicRadarChart";
import { listInterviews } from "@/services/interviewService";
import { listResumes } from "@/services/resumeService";
import { ROUTES } from "@/configs/routes";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const [interviewsData, resumesData] = await Promise.all([
        listInterviews().catch(() => []),
        listResumes().catch(() => []),
      ]);
      setInterviews(Array.isArray(interviewsData) ? interviewsData : []);
      setResumes(Array.isArray(resumesData) ? resumesData : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Derived metrics
  const completedInterviews = interviews.filter((i) => i.status === "completed");
  const avgScore =
    completedInterviews.length > 0
      ? Math.round(
          completedInterviews.reduce(
            (acc, curr) => acc + (curr.summary?.score || 0),
            0
          ) / completedInterviews.length
        )
      : null;

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="Candidate Overview"
        action={
          <Link href={ROUTES.RESUMES}>
            <Button variant="primary" size="sm">
              + New Mock Simulation
            </Button>
          </Link>
        }
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Welcome Banner */}
        <div className="bg-ink text-white rounded-2xl p-6 sm:p-8 border border-border-dark flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs uppercase tracking-wider text-accent font-bold">
              Interview Readiness
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.full_name?.split(" ")[0] || "Candidate"}!
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Targeting top tech companies? Keep your calibrated simulation streak
              active to hit 90%+ readiness benchmark before actual on-sites.
            </p>
          </div>

          <div className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/10 shrink-0">
            <div className="text-center px-2">
              <p className="text-xs text-slate-500">Readiness Score</p>
              <p className="text-3xl font-extrabold text-accent mt-0.5">
                {avgScore != null ? `${avgScore}%` : "—"}
              </p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center px-2">
              <p className="text-xs text-slate-500">Simulations</p>
              <p className="text-3xl font-extrabold text-white mt-0.5">
                {interviews.length}
              </p>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 flex flex-col justify-between">
            <p className="text-xs uppercase font-semibold text-slate-500">
              Avg. Mock Benchmark
            </p>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-3xl font-extrabold text-ink">
                {avgScore != null ? `${avgScore}/100` : "N/A"}
              </span>
              {avgScore != null && <Badge variant="accent">Latest</Badge>}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Across {completedInterviews.length} completed sessions
            </p>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <p className="text-xs uppercase font-semibold text-slate-500">
              Active Resumes
            </p>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-3xl font-extrabold text-ink">
                {resumes.length}
              </span>
              <Badge variant="default">Track</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {resumes.filter((r) => r.status === "ready").length} parsed & ready
            </p>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <p className="text-xs uppercase font-semibold text-slate-500">
              Practice Streak
            </p>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-3xl font-extrabold text-ink">
                {interviews.length > 0 ? `${interviews.length}` : "—"}
              </span>
              <Badge variant={interviews.length > 0 ? "success" : "default"}>
                {interviews.length > 0 ? "Active" : "Start"}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {interviews.length > 0 ? "Total simulations run" : "No sessions yet"}
            </p>
          </Card>

          <Card className="p-5 flex flex-col justify-between">
            <p className="text-xs uppercase font-semibold text-slate-500">
              Focus Domain
            </p>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-xl font-bold text-ink truncate">
                {completedInterviews.length > 0
                  ? completedInterviews[completedInterviews.length - 1].role
                  : "—"}
              </span>
              {completedInterviews.length > 0 && (
                <Badge variant="warning">Recent</Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {completedInterviews.length > 0
                ? "Most recent mock role"
                : "Complete a mock to track"}
            </p>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-ink">
                  Performance Progression
                </h3>
                <p className="text-xs text-slate-500">
                  Calibrated scoring trajectory over recent simulations
                </p>
              </div>
              <Badge variant="accent">Trend</Badge>
            </div>
            <ScoreLineChart interviews={interviews} />
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base text-ink">
                  Competency Radar
                </h3>
                <p className="text-xs text-slate-500">
                  Score distribution across core evaluation topics
                </p>
              </div>
              <Badge variant="default">All Topics</Badge>
            </div>
            <TopicRadarChart />
          </Card>
        </div>

        {/* Recent Mock Interviews List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base text-ink">Recent Mock Simulations</h3>
            <Link href={ROUTES.RESUMES}>
              <span className="text-xs font-semibold text-ink hover:text-accent underline transition-colors cursor-pointer">
                Start new simulation →
              </span>
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Loading recent sessions...
            </div>
          ) : interviews.length === 0 ? (
            <div className="py-10 text-center flex flex-col items-center justify-center">
              <p className="text-sm font-semibold text-slate-700">
                No mock interviews taken yet.
              </p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Upload your resume to kick off a tailored simulation with calibrated
                real-time questions and feedback.
              </p>
              <Link href={ROUTES.RESUMES} className="mt-4">
                <Button variant="primary" size="sm">
                  Upload Resume & Begin
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border-light">
              {interviews.slice(0, 5).map((interview) => (
                <div
                  key={interview.uuid}
                  className="py-3.5 flex items-center justify-between flex-wrap gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {interview.role}
                      </span>
                      {interview.target_company && (
                        <Badge variant="default" size="sm">
                          @{interview.target_company}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          interview.difficulty === "hard"
                            ? "danger"
                            : interview.difficulty === "medium"
                            ? "warning"
                            : "info"
                        }
                        size="sm"
                      >
                        {interview.difficulty}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      {new Date(interview.created_at).toLocaleDateString()} · Status:{" "}
                      <span className="font-medium text-slate-700 capitalize">
                        {interview.status}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {interview.summary?.score != null && (
                      <span className="text-sm font-extrabold text-accent">
                        {Math.round(interview.summary.score)}/100
                      </span>
                    )}
                    <Link
                      href={
                        interview.status === "completed"
                          ? ROUTES.INTERVIEW_SUMMARY(interview.uuid)
                          : ROUTES.INTERVIEW(interview.uuid)
                      }
                    >
                      <Button variant="outline" size="sm">
                        {interview.status === "completed" ? "View Summary" : "Resume"}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
