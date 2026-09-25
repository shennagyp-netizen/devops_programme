import { describe, expect, it } from "vitest";
import { authoredRemediation } from "../../src/data/authoredRemediation.ts";
import { lessonsByCourse } from "../../src/data/courseLessons.ts";
import {
  buildRemediationPlan,
  classifyHandsOnFailure
} from "../../src/data/masteryRemediation.ts";
import { getHandsOnTask } from "../../src/data/handsOn.ts";

describe("authored Beginner remediation coverage", () => {
  const beginnerIds = lessonsByCourse.beginner.map((lesson) => lesson.id);

  it("covers every Beginner lesson with six authored explanation methods", () => {
    expect(Object.keys(authoredRemediation).sort()).toEqual(beginnerIds.slice().sort());

    for (const lesson of lessonsByCourse.beginner) {
      const authored = authoredRemediation[lesson.id];
      expect(authored, lesson.id).toBeDefined();
      expect(Object.keys(authored.steps).sort()).toEqual([
        "analogy",
        "counterexample",
        "mechanism",
        "plain-language",
        "visual",
        "worked-example"
      ]);
      for (const method of Object.values(authored.steps)) {
        expect(method.explanation.length).toBeGreaterThan(40);
        expect(method.microTask.length).toBeGreaterThan(20);
        expect(method.successCheck.length).toBeGreaterThan(20);
      }
    }
  });

  it("returns the authored lesson-specific plan instead of the generic fallback", () => {
    const lesson = lessonsByCourse.beginner.find((item) => item.id === "B2.3");
    if (!lesson) throw new Error("B2.3 is required for remediation coverage.");

    const task = getHandsOnTask(lesson);
    const failure = classifyHandsOnFailure(
      ["Missing required evidence: recovery"],
      task
    );
    const plan = buildRemediationPlan(lesson, task, failure);

    expect(plan.steps[0]?.title).toBe("Separate backup from recovery");
    expect(plan.steps.map((step) => step.method)).toEqual([
      "plain-language",
      "analogy",
      "mechanism",
      "worked-example",
      "counterexample",
      "visual"
    ]);
  });
});
