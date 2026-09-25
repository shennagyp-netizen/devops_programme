import type { LessonContentBlock } from "../data/lessonContent";
import { getLessonIllustrationModel } from "../data/lessonIllustration";

export function LessonIllustration({
  block
}: {
  block: Extract<LessonContentBlock, { type: "illustration" }>;
}) {
  const model = getLessonIllustrationModel(block);

  return (
    <div className={"lesson-illustration lesson-illustration-" + model.variant}>
      <div className="lesson-illustration-stages">
        {model.stages.map((stage, index) => (
          <div className="lesson-illustration-stage-wrap" key={stage.id}>
            <div className="lesson-illustration-stage">
              <span className="lesson-illustration-stage-index">
                {index + 1}
              </span>
              <strong>{stage.label}</strong>
              <span>{stage.detail}</span>
            </div>
            {index < model.stages.length - 1 ? (
              <span className="lesson-illustration-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>

      {model.foundation ? (
        <div className="lesson-illustration-foundation">
          <strong>{model.foundation.label}</strong>
          <span>{model.foundation.detail}</span>
        </div>
      ) : null}

      {model.callouts.length ? (
        <div className="lesson-illustration-callouts">
          {model.callouts.map((callout) => (
            <div className="lesson-illustration-callout" key={callout.id}>
              <strong>{callout.label}</strong>
              <span>{callout.detail}</span>
            </div>
          ))}
        </div>
      ) : null}

      {model.failureChecks.length ? (
        <div className="lesson-illustration-failure">
          <div>
            <span className="eyebrow">WHEN THE SERVICE IS RUNNING BUT UNREACHABLE</span>
            <p>Check the smallest layer that can explain the failure before restarting anything.</p>
          </div>
          <div className="lesson-illustration-checks">
            {model.failureChecks.map((check) => (
              <div className="lesson-illustration-check" key={check.id}>
                <strong>{check.label}</strong>
                <span>{check.detail}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}