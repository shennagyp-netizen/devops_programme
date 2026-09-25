"use client";

import type { CourseLesson } from "../data/courseLessons";
import type { HandsOnTask } from "../data/handsOn";
import { getMasteryPlan } from "../data/mastery";

export function MasteryPreview({
  lesson,
  task
}: {
  lesson: CourseLesson;
  task: HandsOnTask;
}) {
  const plan = getMasteryPlan(lesson, task, [], 0);

  return (
    <div className="content-card">
      <span className="eyebrow">UNDERSTAND IT THREE WAYS</span>
      <h3>Do not rely on one explanation</h3>
      <p>
        Before the assignment, connect the same mechanism in plain language,
        through an example, and through the system visual.
      </p>

      <div className="difficulty-grid">
        {plan.passes.map((pass) => (
          <div className="content-card" key={pass.id}>
            <span className="eyebrow">{pass.representation}</span>
            <h4>{pass.title}</h4>
            <p>{pass.explanation}</p>
            <p className="range">
              <strong>Use it:</strong> {pass.action}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
