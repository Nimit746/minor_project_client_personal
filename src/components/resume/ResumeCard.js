"use client";

import React from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

function formatBytes(bytes, decimals = 1) {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function ResumeCard({ resume, onSelect, onDelete, isSelected = false }) {
  const statusLower = resume.status?.toLowerCase() ?? "";
  // Backend may omit the status field entirely — treat that as ready/selectable
  const isProcessing = statusLower === "pending" || statusLower === "processing";
  const isFailed = statusLower === "failed";
  const isReady = !isProcessing && !isFailed; // ready = not processing and not failed
  // A resume is selectable if it isn't actively parsing or failed
  const isSelectable = !isProcessing && !isFailed && !!resume.uuid;

  return (
    <div
      className={`p-4 rounded-xl border transition-all bg-surface flex flex-col justify-between gap-3 ${
        isSelected
          ? "border-accent ring-2 ring-accent/20 bg-accent/[0.02]"
          : "border-border-light hover:border-slate-500"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-surface-off border border-border-light flex items-center justify-center shrink-0 text-slate-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-ink truncate" title={resume.filename}>
              {resume.filename}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatBytes(resume.size_bytes)} · {new Date(resume.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div>
          {isReady && <Badge variant="accent">Ready</Badge>}
          {isProcessing && (
            <Badge variant="warning" className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Parsing
            </Badge>
          )}
          {isFailed && <Badge variant="danger">Failed</Badge>}
        </div>
      </div>

      {resume.error && (
        <p className="text-xs text-danger bg-red-50 p-2 rounded-md border border-red-200">
          {resume.error}
        </p>
      )}

      <div className="pt-2 border-t border-border-light flex items-center justify-between gap-2">
        {onSelect && (
          <Button
            variant={isSelected ? "primary" : "secondary"}
            size="sm"
            disabled={!isSelectable}
            onClick={() => isSelectable && onSelect(resume)}
            title={
              isProcessing
                ? "Resume is still being parsed…"
                : isFailed
                ? "This resume failed to parse"
                : isSelected
                ? "Click to deselect"
                : "Use this resume for the mock"
            }
          >
            {isSelected
              ? "✓ Selected for Mock"
              : isProcessing
              ? "Parsing…"
              : "Use for Mock"}
          </Button>
        )}

        {onDelete && (
          <button
            onClick={() => onDelete(resume)}
            className="p-1.5 text-slate-500 hover:text-danger rounded-md transition-colors ml-auto"
            title="Delete resume"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

