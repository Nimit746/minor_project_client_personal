"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { APP_CONFIG } from "@/configs/constants";

export function AnswerForm({ onSubmit, isSubmitting = false }) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError("Please provide an answer before submitting.");
      return;
    }
    setError("");
    onSubmit(answer.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        label="Your Response"
        placeholder="Structure your thoughts clearly. Address edge cases, trade-offs, and design rationale..."
        rows={7}
        maxLength={APP_CONFIG.LIMITS.ANSWER_MAX_LENGTH}
        value={answer}
        onChange={(e) => {
          setAnswer(e.target.value);
          if (error) setError("");
        }}
        disabled={isSubmitting}
        error={error}
        helperText="Enforce structured reasoning: Problem framing → Solution approach → Trade-offs."
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <span className="text-xs text-slate-500 sm:pr-4">
          Answers are calibrated directly by the AI interviewer against top tier hiring bars.
        </span>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isSubmitting}
          disabled={!answer.trim() || isSubmitting}
          className="w-full sm:w-auto shrink-0"
        >
          Submit Answer →
        </Button>
      </div>
    </form>
  );
}
