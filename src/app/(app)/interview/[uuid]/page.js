"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { QuestionCard } from "@/components/interview/QuestionCard";
import { AnswerForm } from "@/components/interview/AnswerForm";
import { TurnFeedback } from "@/components/interview/TurnFeedback";
import {
  getInterview,
  submitAnswer,
  abandonInterview,
} from "@/services/interviewService";
import { getErrorMessage } from "@/utils/errors";
import { ROUTES } from "@/configs/routes";

export default function InterviewRoomPage({ params }) {
  // Next.js 16 requires awaiting/unwrapping params Promise
  const resolvedParams = use(params);
  const uuid = resolvedParams.uuid;
  const router = useRouter();

  const [interview, setInterview] = useState(null);
  const [currentTurn, setCurrentTurn] = useState(null);
  const [lastTurnFeedback, setLastTurnFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Abandon confirm modal
  const [showAbandonModal, setShowAbandonModal] = useState(false);
  const [isAbandoning, setIsAbandoning] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const data = await getInterview(uuid);
        if (!isMounted) return;
        setInterview(data);

        if (data.status === "completed") {
          router.push(ROUTES.INTERVIEW_SUMMARY(uuid));
          return;
        }

        // Active turn: the latest turn from turns[] that hasn't been answered,
        // or the last turn in progress
        if (Array.isArray(data.turns) && data.turns.length > 0) {
          const unanswered = data.turns.find((t) => !t.answer);
          if (unanswered) {
            setCurrentTurn(unanswered);
          } else {
            // All answered so far, show latest feedback or wait for completion
            const latest = data.turns[data.turns.length - 1];
            setCurrentTurn(latest);
            if (latest.feedback) {
              setLastTurnFeedback({
                feedback: latest.feedback,
                score: latest.score,
              });
            }
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [uuid, router]);

  const handleSubmitAnswer = async (answerText) => {
    if (!currentTurn) return;
    setIsSubmitting(true);
    setError("");

    try {
      // seq must come directly from currentTurn.seq as mandated by API contract
      const response = await submitAnswer(uuid, {
        seq: currentTurn.seq,
        answer: answerText,
      });

      if (response.status === "completed") {
        router.push(ROUTES.INTERVIEW_SUMMARY(uuid));
        return;
      }

      // Check if feedback is returned for this turn
      if (response.turn?.feedback) {
        setLastTurnFeedback({
          feedback: response.turn.feedback,
          score: response.turn.score,
          nextTurn: response.turn,
        });
      } else if (response.turn) {
        setCurrentTurn(response.turn);
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextTurn = () => {
    if (lastTurnFeedback?.nextTurn) {
      setCurrentTurn(lastTurnFeedback.nextTurn);
      setLastTurnFeedback(null);
    } else {
      // Reload interview state to get next prompt
      getInterview(uuid).then((data) => {
        setInterview(data);
        if (data.status === "completed") {
          router.push(ROUTES.INTERVIEW_SUMMARY(uuid));
          return;
        }
        const unanswered = data.turns?.find((t) => !t.answer);
        if (unanswered) {
          setCurrentTurn(unanswered);
        }
        setLastTurnFeedback(null);
      });
    }
  };

  const handleAbandon = async () => {
    setIsAbandoning(true);
    try {
      await abandonInterview(uuid);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError(getErrorMessage(err));
      setIsAbandoning(false);
      setShowAbandonModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Preparing Interview Room...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Topbar
        title={interview ? `${interview.role} Simulation` : "Mock Interview"}
        action={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAbandonModal(true)}
            className="text-danger hover:bg-red-50 hover:text-danger"
          >
            Abandon Session
          </Button>
        }
      />

      <main className="flex-1 p-6 max-w-4xl w-full mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-danger flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="text-danger hover:opacity-80 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Session details banner */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-border-light">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Target Role:</span>
            <span className="text-xs font-semibold text-ink">
              {interview?.role}
            </span>
            {interview?.target_company && (
              <Badge variant="default" size="sm">
                @{interview.target_company}
              </Badge>
            )}
            <Badge
              variant={
                interview?.difficulty === "hard"
                  ? "danger"
                  : interview?.difficulty === "medium"
                  ? "warning"
                  : "info"
              }
              size="sm"
            >
              {interview?.difficulty}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
            <span className="text-xs font-semibold text-slate-700">
              Session Live
            </span>
          </div>
        </div>

        {/* Interview Q&A Workflow */}
        {lastTurnFeedback ? (
          <TurnFeedback
            feedback={lastTurnFeedback.feedback}
            score={lastTurnFeedback.score}
            onNext={handleNextTurn}
            isLastTurn={interview?.status === "completed"}
          />
        ) : currentTurn ? (
          <div className="space-y-6">
            <QuestionCard turn={currentTurn} />
            <Card className="p-6 md:p-8">
              <AnswerForm
                onSubmit={handleSubmitAnswer}
                isSubmitting={isSubmitting}
              />
            </Card>
          </div>
        ) : (
          <div className="p-12 text-center bg-surface rounded-2xl border border-border-light space-y-3">
            <p className="text-sm font-semibold text-ink">
              No active questions in this session.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => router.push(ROUTES.INTERVIEW_SUMMARY(uuid))}
            >
              View Interview Summary →
            </Button>
          </div>
        )}
      </main>

      {/* Abandon Confirm Modal */}
      <Modal
        isOpen={showAbandonModal}
        onClose={() => setShowAbandonModal(false)}
        title="Abandon Interview Simulation?"
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAbandonModal(false)}
              disabled={isAbandoning}
            >
              Resume Interview
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleAbandon}
              loading={isAbandoning}
            >
              Abandon Session
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-700 leading-relaxed">
          Are you sure you want to exit this mock simulation? The session will be
          marked as abandoned and you will be returned to your dashboard.
        </p>
      </Modal>
    </div>
  );
}
