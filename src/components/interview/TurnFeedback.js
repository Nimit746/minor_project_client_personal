"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function TurnFeedback({ feedback, score, onNext, isLastTurn = false }) {
  if (!feedback && score == null) return null;

  const scoreBadgeVariant =
    score >= 80 ? "accent" : score >= 60 ? "warning" : "danger";

  return (
    <div className="bg-surface rounded-2xl border border-border-light p-6 md:p-8 space-y-5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between pb-3 border-b border-border-light">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center font-bold text-emerald-800 text-xs">
            ✓
          </span>
          <div>
            <h3 className="font-bold text-base text-ink">Evaluator Feedback</h3>
            <p className="text-xs text-slate-500">
              Calibrated review for this turn
            </p>
          </div>
        </div>

        {score != null && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Turn Score:</span>
            <Badge variant={scoreBadgeVariant} size="md">
              {Math.round(score)} / 100
            </Badge>
          </div>
        )}
      </div>

      {/* Structured or string feedback */}
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        {typeof feedback === "string" ? (
          <p className="whitespace-pre-wrap">{feedback}</p>
        ) : typeof feedback === "object" && feedback !== null ? (
          <div className="space-y-3">
            {feedback.summary && (
              <p className="font-medium text-ink">{feedback.summary}</p>
            )}
            {feedback.strengths && (
              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Strengths:
                </span>
                <p className="text-xs text-slate-700">
                  {typeof feedback.strengths === "string"
                    ? feedback.strengths
                    : JSON.stringify(feedback.strengths)}
                </p>
              </div>
            )}
            {feedback.improvements && (
              <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 space-y-1">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                  Areas for Improvement:
                </span>
                <p className="text-xs text-slate-700">
                  {typeof feedback.improvements === "string"
                    ? feedback.improvements
                    : JSON.stringify(feedback.improvements)}
                </p>
              </div>
            )}
            {feedback.comment && (
              <p className="text-slate-600 italic">&ldquo;{feedback.comment}&rdquo;</p>
            )}
          </div>
        ) : (
          <p className="text-slate-500 italic">No detailed comment provided.</p>
        )}
      </div>

      <div className="pt-3 border-t border-border-light flex justify-end">
        <Button variant="primary" size="md" onClick={onNext}>
          {isLastTurn ? "Finish & View Full Summary →" : "Next Question →"}
        </Button>
      </div>
    </div>
  );
}
