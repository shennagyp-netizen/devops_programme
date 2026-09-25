"use client";

import { useMemo, useState } from "react";
import type { MasteryPlan } from "../data/mastery";

export function MasteryRemediation({
  plan,
  onReadyForRetry
}: {
  plan: MasteryPlan;
  onReadyForRetry: () => void;
}) {
  const [answer, setAnswer] = useState<number | null>(null);
  const [checkpointMessage, setCheckpointMessage] = useState("");

  const checkpointPassed = useMemo(() => {
    if (!plan.checkpoint) return true;
    return answer === plan.checkpoint.correctOption;
  }, [answer, plan.checkpoint]);

  function unlockRetry() {
    if (!checkpointPassed) {
      setCheckpointMessage(
        "Complete the checkpoint correctly before returning to the assignment."
      );
      return;
    }

    setCheckpointMessage("");
    onReadyForRetry();
  }

  return (
    <div className="content-card mastery-remediation">
      <span className="eyebrow">
        MASTERY REMEDIATION · PASS {plan.attemptNumber}
      </span>
      <h4>{plan.title}</h4>
      <p>{plan.why}</p>

      <div className="lesson-content-feed">
        {plan.passes.map((pass, index) => (
          <article className="lesson-content-item" key={pass.id}>
            <div className="lesson-visual-head">
              <span className="coach-phase">{index + 1}</span>
              <div>
                <span className="eyebrow">{pass.representation}</span>
                <h4>{pass.title}</h4>
              </div>
            </div>
            <p className="lesson-content-copy">{pass.explanation}</p>
            <p className="range">
              <strong>Do:</strong> {pass.action}
            </p>
          </article>
        ))}
      </div>

      {plan.checkpoint ? (
        <div className="content-card">
          <span className="eyebrow">MICRO-CHECK</span>
          <h4>Prove you can predict before retrying</h4>
          <p>{plan.checkpoint.prompt}</p>
          <div className="difficulty-grid">
            {plan.checkpoint.options.map((option, index) => (
              <button
                key={option}
                className={answer === index ? "active" : ""}
                onClick={() => {
                  setAnswer(index);
                  setCheckpointMessage("");
                }}
              >
                {String.fromCharCode(65 + index)}. {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="content-card">
        <span className="eyebrow">GUIDED RETRY</span>
        <h4>{plan.retryTask.title}</h4>
        <ol>
          {plan.retryTask.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>

        <h4>Success looks like</h4>
        <ul>
          {plan.retryTask.successCriteria.map((criterion) => (
            <li key={criterion}>{criterion}</li>
          ))}
        </ul>
      </div>

      <button
        className="primary"
        onClick={unlockRetry}
        disabled={!checkpointPassed}
      >
        I completed the remediation — unlock the retry
      </button>

      {checkpointMessage ? (
        <p className="range">{checkpointMessage}</p>
      ) : null}

      <p className="range">{plan.nextFailureMessage}</p>
    </div>
  );
}
