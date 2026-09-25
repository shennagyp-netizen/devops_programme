import { describe, expect, it } from "vitest";
import {
  buildRemediationPlan,
  classifyHandsOnFailure,
  methodsForAttempt
} from "../../src/data/masteryRemediation.ts";
import { getHandsOnTask } from "../../src/data/handsOn.ts";
import { lessonsByCourse } from "../../src/data/courseLessons.ts";

describe("mastery remediation engine", () => {
  const lesson = lessonsByCourse.beginner.find((item) => item.id === "B1.4");
  if (!lesson) throw new Error("B1.4 lesson is required for remediation tests.");
  const task = getHandsOnTask(lesson);

  it("classifies an invalid evidence submission without pretending the assignment succeeded", () => {
    const failure = classifyHandsOnFailure(
      ['Missing required evidence: What failure signal did the system produce?'],
      task
    );

    expect(failure.failureClass).toBe("diagnosis-error");
    expect(failure.failedFields).toContain("failure");
    expect(failure.messages).toHaveLength(1);
  });

  it("provides multiple genuinely different remediation methods", () => {
    const failure = classifyHandsOnFailure(
      ['Missing required evidence: What did you observe before changing anything?'],
      task
    );
    const plan = buildRemediationPlan(lesson, task, failure);

    expect(plan.steps).toHaveLength(6);
    expect(new Set(plan.steps.map((step) => step.method)).size).toBe(6);
    expect(plan.reattemptRule).toContain("retry the original assignment");
  });

  it("changes the remediation approach after repeated failure", () => {
    expect(methodsForAttempt(1)).toEqual(["plain-language", "analogy"]);
    expect(methodsForAttempt(2)).toEqual(["mechanism", "worked-example"]);
    expect(methodsForAttempt(3)).toEqual(["counterexample", "visual"]);
  });

  it("never reduces a failed assignment to 'try again'", () => {
    const failure = classifyHandsOnFailure(
      ['Missing required evidence: How did you restore the known-good state, and what proved recovery?'],
      task
    );
    const plan = buildRemediationPlan(lesson, task, failure);
    const combined = plan.steps.map((step) => step.explanation + " " + step.microTask).join(" ");

    expect(combined).toContain("recovery");
    expect(combined).toContain("alternative");
    expect(combined).toContain("mechanism");
  });
});
