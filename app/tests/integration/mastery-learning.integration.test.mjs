import { describe, expect, it } from "vitest";
import { courseLessons } from "../../src/data/courseLessons.ts";
import { getHandsOnTask } from "../../src/data/handsOn.ts";
import { getMasteryPlan } from "../../src/data/mastery.ts";

describe("programme mastery integration", () => {
  it("gives every authored lesson a three-way first-pass teaching loop", () => {
    for (const lesson of courseLessons) {
      const plan = getMasteryPlan(
        lesson,
        getHandsOnTask(lesson),
        [],
        0
      );

      expect(plan.stage, lesson.id).toBe("foundation-reteach");
      expect(plan.passes.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(
        new Set(plan.passes.map((pass) => pass.representation)).size,
        lesson.id
      ).toBeGreaterThanOrEqual(3);
      expect(plan.checkpoint || lesson.sectionId, lesson.id).toBeTruthy();
      expect(Array.isArray(plan.failureSummary), lesson.id).toBe(true);
    }
  });

  it("never reuses the exact same full-assignment flow as the first remediation step", () => {
    for (const lesson of courseLessons) {
      const task = getHandsOnTask(lesson);
      const plan = getMasteryPlan(
        lesson,
        task,
        ["failed evidence"],
        2
      );

      expect(plan.stage, lesson.id).toBe("guided-practice");
      expect(plan.retryTask.title).toContain("Micro-assignment");
      expect(plan.retryTask.steps).not.toEqual(task.steps);
    }
  });
});
