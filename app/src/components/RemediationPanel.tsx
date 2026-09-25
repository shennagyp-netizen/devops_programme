import { useMemo, useState } from "react";
import { completeMasteryRemediationAction } from "../app/actions/mastery";
import {
  methodsForAttempt,
  type RemediationPlan
} from "../data/masteryRemediation";

export function RemediationPanel({
  plan,
  attemptNumber,
  attemptId,
  onRetry
}: {
  plan: RemediationPlan;
  attemptNumber: number;
  attemptId: string | null;
  onRetry: () => void;
}) {
  const methods = useMemo(() => methodsForAttempt(attemptNumber), [attemptNumber]);
  const [response, setResponse] = useState("");
  const [completed, setCompleted] = useState(false);
  const [showMore, setShowMore] = useState(false);

  const steps = plan.steps.filter((step) => methods.includes(step.method));
  const extra = plan.steps.filter((step) => !methods.includes(step.method));
  const visible = showMore ? [...steps, extra[0]].filter(Boolean) : steps;

  return (
    <div className="content-card">
      <span className="eyebrow">MASTERY REMEDIATION · ATTEMPT {attemptNumber}</span>
      <h4>Do not repeat the same explanation</h4>
      <p>
        This assignment was not accepted. The system is changing the teaching
        method before you retry it.
      </p>

      <div className="difficulty-grid">
        {visible.map((step) => (
          <article key={step.id} className="content-card">
            <span className="eyebrow">{step.method}</span>
            <h4>{step.title}</h4>
            <p>{step.explanation}</p>
            <strong>Micro-task</strong>
            <p>{step.microTask}</p>
            <p className="range">Success check: {step.successCheck}</p>
          </article>
        ))}
      </div>

      {!showMore && extra.length ? (
        <button className="secondary" onClick={() => setShowMore(true)}>
          Show another explanation
        </button>
      ) : null}

      <label className="evidence-field">
        <strong>Write your micro-task answer</strong>
        <textarea
          value={response}
          onChange={(event) => {
            setResponse(event.target.value);
            setCompleted(false);
          }}
          placeholder="Explain the mechanism in your own words."
        />
      </label>

      <button
        className="secondary"
        disabled={response.trim().length < 20}
        onClick={() => {
          setCompleted(true);
          if (attemptId) {
            void completeMasteryRemediationAction(attemptId).catch(() => {
              // Local remediation remains usable if persistence is temporarily unavailable.
            });
          }
        }}
      >
        I completed the remediation step
      </button>

      {completed ? (
        <>
          <p className="range">
            Remediation step recorded for this attempt. Now retry the original
            assignment; the original evidence contract still decides whether
            you pass.
          </p>
          <button className="primary" onClick={onRetry}>
            Retry the original assignment
          </button>
        </>
      ) : (
        <p className="range">{plan.reattemptRule}</p>
      )}
    </div>
  );
}
