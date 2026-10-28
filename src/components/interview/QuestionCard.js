"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { APP_CONFIG } from "@/configs/constants";

export function QuestionCard({ turn, totalTurns = APP_CONFIG.INTERVIEW.DEFAULT_TOTAL_TURNS }) {
  if (!turn) return null;

  const difficultyVariant =
    turn.difficulty === "hard"
      ? "danger"
      : turn.difficulty === "medium"
      ? "warning"
      : "info";

  return (
    <div className="bg-surface rounded-2xl border border-border-light p-6 md:p-8 space-y-5 shadow-xs">
      {/* Meta tags header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-md bg-ink text-white text-xs font-bold tracking-wide">
            Turn {turn.seq}
          </span>
          {turn.topic && (
            <span className="text-xs font-semibold text-slate-700 bg-surface-off px-2.5 py-1 rounded-md border border-border-light">
              {turn.topic}
            </span>
          )}
          {turn.difficulty && (
            <Badge variant={difficultyVariant} size="sm">
              {turn.difficulty}
            </Badge>
          )}
        </div>

        <span className="text-xs font-medium text-slate-500">
          Interview Flow: Question {turn.seq} of {totalTurns}
        </span>
      </div>

      {/* Question Prompt */}
      <div className="pt-2">
        <h2 className="text-lg md:text-xl font-bold text-ink leading-relaxed">
          {turn.prompt}
        </h2>
      </div>

      {/* Multiple-choice options if present in question schema */}
      {Array.isArray(turn.options) && turn.options.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
            Available Options:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {turn.options.map((option, index) => (
              <div
                key={index}
                className="p-3 bg-surface-off rounded-lg border border-border-light text-xs font-medium text-slate-700 flex items-center gap-2.5"
              >
                <span className="w-5 h-5 rounded-full bg-border-light text-ink flex items-center justify-center font-bold text-[10px] shrink-0">
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
