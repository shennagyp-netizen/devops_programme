"use client";

import { useEffect, useMemo, useState } from "react";
import type { CourseLevel } from "../data/programme";
import {
  assessmentExplanation,
  findAlternateAssessmentItem,
  getPracticeForm
} from "../data/assessmentItems";
import { recordMasteryAttemptAction } from "../app/actions/progress";
import type { AssessmentItem } from "../data/assessment";

type Feedback = {
  correct: boolean;
  message: string;
  explanation?: string;
  correctAnswer?: string;
};

export function AssessmentPracticePanel({
  courseId,
  sectionId,
  family
}: {
  courseId: CourseLevel;
  sectionId: string;
  family: string;
}) {
  const form = useMemo(
    () => getPracticeForm(sectionId, family),
    [sectionId, family]
  );
  const [queue, setQueue] = useState<AssessmentItem[]>(form);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setQueue(form);
    setIndex(0);
    setSelected(null);
    setFeedback(null);
    setUsedIds(new Set());
  }, [form]);

  const item = queue[index];

  if (!item) {
    return (
      <div className="content-card">
        <span className="eyebrow">MASTERY PRACTICE</span>
        <h4>Practice form completed</h4>
        <p>
          You completed the automatically gradable pilot questions for this
          family. The next step is the lesson assignment or the human-scored
          constructed-response work.
        </p>
      </div>
    );
  }

  async function submit() {
    if (selected === null || !Array.isArray(item.options)) return;

    const correct = selected === item.correctOption;
    const nextUsed = new Set(usedIds).add(item.id);
    setUsedIds(nextUsed);

    if (correct) {
      setFeedback({
        correct: true,
        message: "Correct. You proved this competency on this form."
      });

      void recordMasteryAttemptAction({
        lessonId: item.sectionId,
        taskId: item.id,
        outcome: "mastered",
        stage: "assessment-mastery",
        summary: "Selected-response practice item answered correctly."
      }).catch(() => {
        // Assessment practice remains usable if telemetry is temporarily unavailable.
      });

      return;
    }

    const alternate = findAlternateAssessmentItem(item, nextUsed);

    setFeedback({
      correct: false,
      message: "Not yet. We will teach the distinction, then give you a different question.",
      explanation: assessmentExplanation(item),
      correctAnswer:
        item.options[item.correctOption ?? 0]
    });

    void recordMasteryAttemptAction({
      lessonId: item.sectionId,
      taskId: item.id,
      outcome: "failure",
      stage: "assessment-reteach",
      summary: assessmentExplanation(item)
    }).catch(() => {
      // Assessment practice remains usable if telemetry is temporarily unavailable.
    });

    if (alternate) {
      setTimeout(() => {
        setQueue((current) => [...current.slice(0, index + 1), alternate, ...current.slice(index + 1)]);
        setIndex((current) => current + 1);
        setSelected(null);
        setFeedback(null);
      }, 100);
    }
  }

  function nextAfterCorrect() {
    setIndex((current) => current + 1);
    setSelected(null);
    setFeedback(null);
  }

  return (
    <div className="content-card assessment-practice">
      <div className="assessment-header">
        <div>
          <span className="eyebrow">MASTERY PRACTICE</span>
          <h4>
            Question {index + 1} of {queue.length}
          </h4>
        </div>
        <span className="coach-phase">
          {item.difficulty} · {item.cognitiveLevel}
        </span>
      </div>

      <p>{item.prompt}</p>

      {item.options?.map((option, optionIndex) => (
        <button
          key={option}
          className={selected === optionIndex ? "active" : ""}
          onClick={() => setSelected(optionIndex)}
          disabled={Boolean(feedback)}
        >
          {option}
        </button>
      ))}

      {!feedback ? (
        <button
          className="primary"
          disabled={selected === null}
          onClick={() => void submit()}
        >
          Check my reasoning
        </button>
      ) : (
        <div className="content-card">
          <span className="eyebrow">
            {feedback.correct ? "MASTERY" : "RETEACH"}
          </span>
          <h4>{feedback.message}</h4>
          {feedback.explanation ? <p>{feedback.explanation}</p> : null}
          {feedback.correctAnswer ? (
            <p>
              <strong>Expected answer:</strong> {feedback.correctAnswer}
            </p>
          ) : null}

          {feedback.correct ? (
            <button className="primary" onClick={nextAfterCorrect}>
              Continue
            </button>
          ) : (
            <p className="range">
              A different question is now queued for the same competency.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
