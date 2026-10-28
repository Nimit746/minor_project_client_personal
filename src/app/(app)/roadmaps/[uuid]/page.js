"use client";

import React, { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getRoadmap } from "@/services/roadmapService";
import { getErrorMessage } from "@/utils/errors";
import { ROUTES } from "@/configs/routes";

export default function RoadmapPage({ params }) {
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pollRoadmap = useCallback(async () => {
    try {
      const data = await getRoadmap(uuid);
      setRoadmap(data);
      return data;
    } catch (err) {
      setError(getErrorMessage(err));
      return null;
    } finally {
      setLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    async function initialAndPoll() {
      const initial = await pollRoadmap();
      if (!isMounted) return;

      if (initial && (initial.status === "pending" || initial.status === "processing")) {
        timerId = setInterval(async () => {
          const res = await pollRoadmap();
          if (res && (res.status === "ready" || res.status === "failed")) {
            clearInterval(timerId);
          }
        }, 3000);
      }
    }

    initialAndPoll();

    return () => {
      isMounted = false;
      if (timerId) clearInterval(timerId);
    };
  }, [pollRoadmap]);

  const isPending = roadmap?.status === "pending" || roadmap?.status === "processing";
  const isReady = roadmap?.status === "ready";
  const isFailed = roadmap?.status === "failed";

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title="AI Study Roadmap"
        action={
          <Link href={ROUTES.DASHBOARD}>
            <Button variant="secondary" size="sm">
              Dashboard
            </Button>
          </Link>
        }
      />

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-danger flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-danger p-1">
              ✕
            </button>
          </div>
        )}

        {loading || isPending ? (
          <Card className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-ink">
                Generating Personalized Roadmap...
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Analyzing your simulation answers, identifying gaps, and curating
                targeted drill topics for maximum interview impact.
              </p>
            </div>
            <Badge variant="warning" className="animate-pulse">
              Processing AI Synthesis
            </Badge>
          </Card>
        ) : isFailed ? (
          <Card className="p-8 text-center space-y-4">
            <Badge variant="danger" size="md">
              Generation Encountered an Error
            </Badge>
            <p className="text-sm text-slate-700">
              {roadmap?.error || "We could not generate your roadmap. Please try again."}
            </p>
            <Button variant="primary" size="sm" onClick={() => pollRoadmap()}>
              Retry
            </Button>
          </Card>
        ) : isReady && roadmap?.content ? (
          <div className="space-y-6">
            <div className="bg-ink text-white p-6 md:p-8 rounded-2xl border border-border-dark flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Targeted Study Plan
                </span>
                <h2 className="text-2xl font-extrabold mt-1">
                  Ready to Level Up
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Generated {new Date(roadmap.updated_at || roadmap.created_at).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="accent">Calibrated Blueprint</Badge>
            </div>

            <Card className="p-6 md:p-8 space-y-6">
              <h3 className="font-bold text-lg text-ink pb-3 border-b border-border-light">
                Actionable Drills & Milestones
              </h3>

              <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
                {typeof roadmap.content === "string" ? (
                  <div className="whitespace-pre-wrap font-sans">
                    {roadmap.content}
                  </div>
                ) : typeof roadmap.content === "object" ? (
                  <div className="space-y-4">
                    {Object.entries(roadmap.content).map(([section, items]) => (
                      <div
                        key={section}
                        className="p-4 rounded-xl border border-border-light bg-surface-off space-y-2"
                      >
                        <h4 className="font-bold text-sm text-ink capitalize">
                          {section.replace(/_/g, " ")}
                        </h4>
                        <div className="text-xs text-slate-700">
                          {Array.isArray(items) ? (
                            <ul className="list-disc pl-5 space-y-1">
                              {items.map((item, idx) => (
                                <li key={idx}>
                                  {typeof item === "string" ? item : JSON.stringify(item)}
                                </li>
                              ))}
                            </ul>
                          ) : typeof items === "object" ? (
                            <pre className="p-2 bg-surface rounded text-[11px] overflow-x-auto">
                              {JSON.stringify(items, null, 2)}
                            </pre>
                          ) : (
                            <p>{String(items)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
}
