import { describe, expect, it } from "vitest";
import { parseMasteryCommand } from "../../src/framework/masteryRequest.ts";

describe("authoritative mastery command boundary", () => {
  it("accepts only learner intent and evidence references", () => {
    expect(
      parseMasteryCommand({
        itemId: "B1.2",
        stage: "foundation-reteach",
        summary: "The retry showed the expected boundary.",
        evidenceRefs: ["evidence-1", "evidence-1"]
      })
    ).toEqual({
      itemId: "B1.2",
      stage: "foundation-reteach",
      summary: "The retry showed the expected boundary.",
      evidenceRefs: ["evidence-1"]
    });
  });

  it("rejects browser-declared mastery outcomes and identity metadata", () => {
    for (const payload of [
      { itemId: "B1.2", outcome: "mastered" },
      { itemId: "B1.2", lessonId: "B1.2" },
      { itemId: "B1.2", taskId: "hands-on-B1.2" },
      { itemId: "B1.2", learnerId: "attacker" }
    ]) {
      expect(() => parseMasteryCommand(payload)).toThrow(/unsupported field/i);
    }
  });

  it("bounds learner-controlled note and evidence-reference size", () => {
    expect(() =>
      parseMasteryCommand({
        itemId: "B1.2",
        stage: "foundation-reteach",
        summary: "x".repeat(4001)
      })
    ).toThrow(/summary/i);

    expect(() =>
      parseMasteryCommand({
        itemId: "B1.2",
        stage: "foundation-reteach",
        summary: "ok",
        evidenceRefs: Array.from({ length: 33 }, (_, i) => `evidence-${i}`)
      })
    ).toThrow(/evidenceRefs/i);
  });
});
