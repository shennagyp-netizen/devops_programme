import { describe, expect, it } from "vitest";
import { courseLessons } from "../../src/data/courseLessons.ts";
import { getHandsOnTask } from "../../src/data/handsOn.ts";
import { getMasteryPlan } from "../../src/data/mastery.ts";
import { buildRecoveryVoiceOptions, recoveryVoiceSummary } from "../../src/data/remediationVoice.ts";

describe("recovery podcast teaching paths", () => {
  it("creates more than one authored explanation method after a failed assignment", () => {
    for (const lesson of courseLessons) {
      const plan = getMasteryPlan(lesson, getHandsOnTask(lesson), ["Missing failure evidence"], 0);
      const options = buildRecoveryVoiceOptions(lesson, plan);

      expect(options.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(new Set(options.map((option) => option.method)).size, lesson.id).toBeGreaterThanOrEqual(3);
      expect(options.every((option) => option.turns.length >= 4), lesson.id).toBe(true);
      expect(options.every((option) => option.turns.some((turn) => turn.text.includes("failed"))), lesson.id).toBe(true);
    }
  });

  it("changes the spoken coaching path as remediation stages deepen", () => {
    const lesson = courseLessons.find((item) => item.id === "B1.4");
    if (!lesson) throw new Error("B1.4 fixture missing");

    const task = getHandsOnTask(lesson);
    const foundation = getMasteryPlan(lesson, task, ["Wrong failure signal"], 0);
    const mechanism = getMasteryPlan(lesson, task, ["Wrong failure signal"], 1);

    expect(buildRecoveryVoiceOptions(lesson, foundation).map((option) => option.method)).toEqual([
      "plain-language",
      "analogy",
      "visual"
    ]);
    expect(buildRecoveryVoiceOptions(lesson, mechanism).map((option) => option.method)).toContain("mechanism");
    expect(recoveryVoiceSummary(lesson, mechanism).episodeId).toBe("B1.4.recovery.2");
  });

  it("does not pretend guided recovery has aligned audio", () => {
    const lesson = courseLessons[0];
    const plan = getMasteryPlan(lesson, getHandsOnTask(lesson), ["failure"], 2);
    const options = buildRecoveryVoiceOptions(lesson, plan);
    expect(options[0].turns.map((turn) => turn.id)).toEqual(
      expect.arrayContaining([expect.stringContaining(".T001"), expect.stringContaining(".T004")])
    );
  });
});
