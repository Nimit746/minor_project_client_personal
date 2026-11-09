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

// Helper to format labels cleanly
function formatLabel(str = "") {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Check if string looks like markdown or plain text with bullet points
function isFormattedText(str) {
  if (typeof str !== "string") return false;
  return str.includes("\n") || str.includes("- ") || str.includes("* ") || str.includes("#");
}

// Simple parser for markdown-like string content
function FormattedTextView({ content }) {
  if (typeof content !== "string") return null;

  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-sm text-slate-700 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }
        if (trimmed.startsWith("### ")) {
          return (
            <h5 key={idx} className="font-bold text-sm text-ink pt-2">
              {trimmed.replace(/^###\s+/, "")}
            </h5>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h4 key={idx} className="font-bold text-base text-ink pt-3 border-b border-border-light pb-1">
              {trimmed.replace(/^##\s+/, "")}
            </h4>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h3 key={idx} className="font-extrabold text-lg text-ink pt-3">
              {trimmed.replace(/^#\s+/, "")}
            </h3>
          );
        }
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
              <span>{trimmed.replace(/^[-*]\s+/, "")}</span>
            </div>
          );
        }
        if (/^\d+\.\s+/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2">
              <span className="w-5 h-5 rounded-full bg-surface-off border border-border-light text-[11px] font-bold text-ink flex items-center justify-center shrink-0 mt-0.5">
                {numMatch ? numMatch[1] : "•"}
              </span>
              <span>{numMatch ? numMatch[2] : trimmed}</span>
            </div>
          );
        }
        return <p key={idx}>{trimmed}</p>;
      })}
    </div>
  );
}

// Specialized rendering for timeline/phases/milestones/weeks
function TimelineView({ items, title = "Milestones & Phased Learning" }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <h4 className="font-bold text-base text-ink">{title}</h4>
        </div>
      )}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border-light">
        {items.map((item, idx) => {
          const itemTitle =
            typeof item === "object"
              ? item.title || item.phase || item.week || item.milestone || item.name || `Phase ${idx + 1}`
              : `Milestone ${idx + 1}`;

          const duration =
            typeof item === "object"
              ? item.duration || item.time || item.timeline || item.estimated_time
              : null;

          const desc =
            typeof item === "object"
              ? item.description || item.summary || item.details || item.focus || item.overview
              : typeof item === "string"
              ? item
              : null;

          const subItems =
            typeof item === "object"
              ? item.tasks || item.topics || item.action_items || item.drills || item.skills || item.items
              : null;

          return (
            <div key={idx} className="relative group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-surface border-2 border-accent flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </div>

              <div className="bg-surface rounded-xl border border-border-light p-4 sm:p-5 shadow-xs space-y-3 hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-ink text-white">
                      Step {idx + 1}
                    </span>
                    <h5 className="font-bold text-sm sm:text-base text-ink">{itemTitle}</h5>
                  </div>
                  {duration && (
                    <Badge variant="accent" size="sm">
                      🕒 {duration}
                    </Badge>
                  )}
                </div>

                {desc && <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{desc}</p>}

                {Array.isArray(subItems) && subItems.length > 0 && (
                  <div className="pt-2 border-t border-border-light space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Target Objectives:
                    </span>
                    <ul className="space-y-1.5">
                      {subItems.map((sub, sIdx) => (
                        <li key={sIdx} className="text-xs text-slate-700 flex items-start gap-2">
                          <span className="text-accent font-bold">✓</span>
                          <span>
                            {typeof sub === "string"
                              ? sub
                              : sub.title || sub.name || JSON.stringify(sub)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Recursive generic card/field renderer for any custom JSON keys
function DynamicSectionRenderer({ title, data, level = 0 }) {
  if (data == null) return null;

  // Primitive strings or numbers
  if (typeof data !== "object") {
    if (isFormattedText(String(data))) {
      return (
        <div className="p-4 rounded-xl border border-border-light bg-surface space-y-2">
          {title && <h4 className="font-bold text-sm text-ink">{formatLabel(title)}</h4>}
          <FormattedTextView content={String(data)} />
        </div>
      );
    }
    return (
      <div className="p-3.5 rounded-xl border border-border-light bg-surface flex items-start justify-between gap-3">
        {title && <span className="text-xs font-semibold text-slate-500">{formatLabel(title)}:</span>}
        <span className="text-xs font-medium text-ink text-right">{String(data)}</span>
      </div>
    );
  }

  // Array handling
  if (Array.isArray(data)) {
    if (data.length === 0) return null;

    // Check if it's a list of milestones/phases/weeks
    const isTimelineLike =
      data.every((item) => typeof item === "object" && item !== null) &&
      data.some(
        (item) =>
          item.phase ||
          item.week ||
          item.milestone ||
          item.step ||
          item.duration ||
          (item.title && (item.tasks || item.topics || item.action_items))
      );

    if (isTimelineLike) {
      return <TimelineView items={data} title={title ? formatLabel(title) : undefined} />;
    }

    // List of primitives
    const isPrimitiveList = data.every((item) => typeof item !== "object");
    if (isPrimitiveList) {
      return (
        <div className="p-4 sm:p-5 rounded-xl border border-border-light bg-surface space-y-3">
          {title && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <h4 className="font-bold text-sm text-ink">{formatLabel(title)}</h4>
              <Badge variant="default" size="sm">
                {data.length}
              </Badge>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2.5 rounded-lg bg-surface-off border border-border-light text-xs text-slate-700"
              >
                <span className="text-accent font-bold shrink-0">✦</span>
                <span className="leading-relaxed">{String(item)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // List of objects
    return (
      <div className="space-y-3">
        {title && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ink" />
            <h4 className="font-bold text-sm sm:text-base text-ink">{formatLabel(title)}</h4>
            <Badge variant="default" size="sm">
              {data.length} items
            </Badge>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {data.map((item, idx) => {
            const itemHeading =
              item.title || item.name || item.topic || item.category || `Item ${idx + 1}`;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border-light bg-surface hover:border-slate-300 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2 border-b border-border-light pb-2">
                  <span className="font-bold text-xs sm:text-sm text-ink truncate">
                    {formatLabel(itemHeading)}
                  </span>
                  {item.difficulty && (
                    <Badge
                      variant={
                        item.difficulty === "hard"
                          ? "danger"
                          : item.difficulty === "medium"
                          ? "warning"
                          : "info"
                      }
                      size="sm"
                    >
                      {item.difficulty}
                    </Badge>
                  )}
                  {item.priority && (
                    <Badge
                      variant={item.priority === "high" ? "danger" : "accent"}
                      size="sm"
                    >
                      {item.priority}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                )}
                {/* Render remaining key-values of item */}
                <div className="space-y-1.5 pt-1">
                  {Object.entries(item)
                    .filter(
                      ([k]) =>
                        ![
                          "title",
                          "name",
                          "topic",
                          "category",
                          "difficulty",
                          "priority",
                          "description",
                        ].includes(k)
                    )
                    .map(([k, v]) => (
                      <div key={k} className="text-xs">
                        <span className="font-semibold text-slate-500 capitalize">
                          {formatLabel(k)}:{" "}
                        </span>
                        {typeof v === "object" ? (
                          <span className="text-slate-700">{JSON.stringify(v)}</span>
                        ) : (
                          <span className="text-slate-800 font-medium">{String(v)}</span>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Object / Dictionary handling
  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between pb-2 border-b border-border-light">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" />
            <h4 className="font-bold text-base text-ink">{formatLabel(title)}</h4>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {entries.map(([secKey, secVal]) => (
          <DynamicSectionRenderer
            key={secKey}
            title={secKey}
            data={secVal}
            level={level + 1}
          />
        ))}
      </div>
    </div>
  );
}

// Master Content Formatter
function RoadmapContentVisualizer({ content }) {
  if (!content) return null;

  // Case 1: Plain string (markdown or text)
  if (typeof content === "string") {
    return (
      <Card className="p-6 md:p-8 space-y-4">
        <FormattedTextView content={content} />
      </Card>
    );
  }

  // Case 2: Structured JSON Object
  if (typeof content === "object" && !Array.isArray(content)) {
    // Check for common top-level fields like overview, summary, strengths, weaknesses, timeline, recommendations
    const {
      title,
      summary,
      overview,
      readiness,
      score,
      phases,
      timeline,
      milestones,
      weeks,
      action_items,
      recommendations,
      resources,
      focus_areas,
      weaknesses,
      strengths,
      ...otherSections
    } = content;

    return (
      <div className="space-y-6">
        {/* Quick Highlights / Overview cards if present */}
        {(summary || overview || title || strengths || weaknesses) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(summary || overview) && (
              <Card className="p-5 space-y-2 md:col-span-2 bg-surface-off border-slate-200">
                <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
                  Strategic Overview
                </span>
                <p className="text-sm text-slate-800 leading-relaxed font-normal">
                  {summary || overview}
                </p>
              </Card>
            )}

            {strengths && (
              <Card className="p-5 space-y-2.5 border-emerald-200/60 bg-emerald-50/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm">💪</span>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-emerald-800">
                    Demonstrated Strengths
                  </h4>
                </div>
                {Array.isArray(strengths) ? (
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{typeof s === "string" ? s : JSON.stringify(s)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-700">{String(strengths)}</p>
                )}
              </Card>
            )}

            {weaknesses && (
              <Card className="p-5 space-y-2.5 border-amber-200/60 bg-amber-50/20">
                <div className="flex items-center gap-2">
                  <span className="text-sm">🎯</span>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-amber-800">
                    High-Priority Gap Areas
                  </h4>
                </div>
                {Array.isArray(weaknesses) ? (
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {weaknesses.map((w, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-amber-600 font-bold">!</span>
                        <span>{typeof w === "string" ? w : JSON.stringify(w)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-700">{String(weaknesses)}</p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* Structured Timeline if present */}
        {(phases || timeline || milestones || weeks) && (
          <Card className="p-6 md:p-8 space-y-6">
            <TimelineView
              items={phases || timeline || milestones || weeks}
              title="Step-by-Step Curriculum & Milestones"
            />
          </Card>
        )}

        {/* Focus Areas or Action Items if present */}
        {(focus_areas || action_items || recommendations) && (
          <Card className="p-6 md:p-8 space-y-6">
            {focus_areas && (
              <DynamicSectionRenderer title="Core Focus Areas" data={focus_areas} />
            )}
            {action_items && (
              <DynamicSectionRenderer title="Recommended Action Items" data={action_items} />
            )}
            {recommendations && (
              <DynamicSectionRenderer title="Targeted Recommendations" data={recommendations} />
            )}
          </Card>
        )}

        {/* Curated Resources if present */}
        {resources && (
          <Card className="p-6 md:p-8 space-y-4">
            <DynamicSectionRenderer title="Study Resources & Recommended Drills" data={resources} />
          </Card>
        )}

        {/* Remaining custom keys in the object */}
        {Object.keys(otherSections).length > 0 && (
          <Card className="p-6 md:p-8 space-y-6">
            {Object.entries(otherSections).map(([k, v]) => (
              <DynamicSectionRenderer key={k} title={k} data={v} />
            ))}
          </Card>
        )}
      </div>
    );
  }

  // Case 3: Top-level Array of items/phases
  if (Array.isArray(content)) {
    return (
      <Card className="p-6 md:p-8">
        <TimelineView items={content} title="Study Plan Steps" />
      </Card>
    );
  }

  return null;
}

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

      <main className="flex-1 p-4 sm:p-6 max-w-5xl w-full mx-auto space-y-6">
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
            {/* Header Hero Banner */}
            <div className="bg-ink text-white p-6 md:p-8 rounded-2xl border border-border-dark flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                  Targeted Study Plan
                </span>
                <h2 className="text-2xl font-extrabold mt-1">
                  Ready to Level Up
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Generated {new Date(roadmap.updated_at || roadmap.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="accent">Calibrated Blueprint</Badge>
              </div>
            </div>

            {/* Visualized Content */}
            <RoadmapContentVisualizer content={roadmap.content} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
