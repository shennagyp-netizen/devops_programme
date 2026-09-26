"use client";

import { useState } from "react";
import {
  difficultyLabel,
  getSectionAssessments,
  type AssessmentFamily
} from "../data/assessment";
import type { CourseLevel } from "../data/programme";
import {
  issueAssessmentAction,
  submitAssessmentAction
} from "../app/actions/assessment";

type SafeQuestion = {
  id: string;
  family: AssessmentFamily;
  difficulty: "foundation" | "applied" | "difficult" | "challenge";
  cognitiveLevel: "mechanism" | "application" | "diagnosis" | "design";
  itemType: string | string[];
  expectedMinutes: number;
  competencyId: string;
  prompt: string;
  options?: string[];
};

type ActiveAssessment = {
  id: string;
  family: AssessmentFamily;
  expiresAt: string;
  questions: SafeQuestion[];
};

type AttemptResult = {
  autoScore: number;
  autoScorableCount: number;
  outcome: "scored" | "pending-review";
};

const labels: Record<AssessmentFamily, string> = {
  conceptual: "Conceptual",
  diagnostic: "Diagnostic",
  "hands-on": "Hands-on"
};

const emptyAnswers = (): Record<string, string | number | boolean> => ({});

export function AssessmentPanel({
  courseId,
  sectionId
}: {
  courseId: CourseLevel;
  sectionId: string;
}) {
  const assessments = getSectionAssessments(courseId, sectionId);
  const [selectedFamily, setSelectedFamily] =
    useState<AssessmentFamily>("conceptual");
  const [activeAssessment, setActiveAssessment] =
    useState<ActiveAssessment | null>(null);
  const [answers, setAnswers] =
    useState<Record<string, string | number | boolean>>(emptyAnswers);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [busy, setBusy] = useState<"issue" | "submit" | null>(null);
  const [message, setMessage] = useState("");

  const selectedBlueprint =
    assessments.find((item) => item.family === selectedFamily) ?? assessments[0];

  async function startAssessment() {
    if (!selectedBlueprint) return;

    setBusy("issue");
    setMessage("");
    setAttemptResult(null);
    setAnswers(emptyAnswers());

    try {
      const instance = await issueAssessmentAction({
        courseId,
        sectionId,
        family: selectedBlueprint.family
      });

      setActiveAssessment(instance);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The assessment could not be issued."
      );
    } finally {
      setBusy(null);
    }
  }

  async function submitAssessment() {
    if (!activeAssessment) return;

    setBusy("submit");
    setMessage("");

    try {
      const result = await submitAssessmentAction({
        instanceId: activeAssessment.id,
        answers
      });

      setAttemptResult(result);
      setActiveAssessment(null);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "The assessment could not be submitted."
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="assessment-stack">
      <div className="content-card">
        <span className="eyebrow">SERVER-ISSUED ASSESSMENT</span>
        <h3>Three exam forms</h3>
        <p>
          The learning gateway issues a specific form from the server-owned
          pilot bank. Answer keys and rubrics stay on the server.
        </p>
      </div>

      {!activeAssessment ? (
        <>
          <div className="difficulty-grid">
            {assessments.map((assessment) => (
              <button
                key={assessment.family}
                className={
                  selectedFamily === assessment.family
                    ? "lesson-link selected"
                    : "lesson-link"
                }
                type="button"
                onClick={() => setSelectedFamily(assessment.family)}
              >
                <strong>{labels[assessment.family]}</strong>
                <span>
                  {assessment.targetItemCount} items ·{" "}
                  {assessment.expectedMinutes} min
                </span>
                <span>
                  Foundation{" "}
                  {difficultyLabel(assessment.targetDifficultyMix.foundation)} ·
                  Applied{" "}
                  {difficultyLabel(assessment.targetDifficultyMix.applied)} ·
                  Difficult{" "}
                  {difficultyLabel(assessment.targetDifficultyMix.difficult)} ·
                  Challenge{" "}
                  {difficultyLabel(assessment.targetDifficultyMix.challenge)}
                </span>
              </button>
            ))}
          </div>

          <div className="content-card">
            <p>
              {selectedBlueprint?.status === "pilot"
                ? "This is a pilot assessment. A submission can be auto-scored for selected-response items; constructed and hands-on responses remain pending manual review."
                : "This assessment is available through the current authored item bank."}
            </p>
            <button
              className="primary"
              type="button"
              disabled={!selectedBlueprint || busy === "issue"}
              onClick={() => void startAssessment()}
            >
              {busy === "issue" ? "Issuing assessment..." : "Start assessment"}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="content-card">
            <span className="eyebrow">
              {labels[activeAssessment.family]} · {activeAssessment.formId}
            </span>
            <p>
              Issued form expires at{" "}
              {new Date(activeAssessment.expiresAt).toLocaleString()}.
            </p>
          </div>

          {activeAssessment.questions.map((question, index) => (
            <div className="content-card" key={question.id}>
              <span className="eyebrow">
                Question {index + 1} · {question.difficulty} ·{" "}
                {question.cognitiveLevel}
              </span>
              <h4>{question.prompt}</h4>

              {question.options ? (
                <div className="difficulty-grid">
                  {question.options.map((option, optionIndex) => (
                    <label key={optionIndex} className="evidence-field">
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === optionIndex}
                        onChange={() =>
                          setAnswers((current) => ({
                            ...current,
                            [question.id]: optionIndex
                          }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <label className="evidence-field">
                  <span>Response</span>
                  <textarea
                    value={String(answers[question.id] ?? "")}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: event.target.value
                      }))
                    }
                    rows={5}
                    maxLength={4000}
                  />
                </label>
              )}
            </div>
          ))}

          <div className="content-card">
            {message ? <p className="range">{message}</p> : null}
            <button
              className="primary"
              type="button"
              disabled={busy === "submit"}
              onClick={() => void submitAssessment()}
            >
              {busy === "submit" ? "Submitting..." : "Submit assessment"}
            </button>
          </div>
        </>
      )}

      {attemptResult ? (
        <div className="content-card">
          <span className="eyebrow">SUBMISSION RECORDED</span>
          {attemptResult.outcome === "pending-review" ? (
            <>
              <h4>Pending manual review</h4>
              <p>
                Auto-scored items: {attemptResult.autoScore} /{" "}
                {attemptResult.autoScorableCount}. The remaining response types
                require rubric-based review.
              </p>
              <p className="range">
                No universal pass percentage is inferred from this score.
              </p>
            </>
          ) : (
            <>
              <h4>Automatically scored</h4>
              <p>
                Score: {attemptResult.autoScore} /{" "}
                {attemptResult.autoScorableCount}
              </p>
              <p className="range">
                The score is recorded as assessment evidence. Certification or
                competency decisions use the assessment's configured standard,
                not a hard-coded universal percentage.
              </p>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
