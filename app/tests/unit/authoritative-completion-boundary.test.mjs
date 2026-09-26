import { describe, expect, it } from "vitest";
import {
  parseCompleteLearningItemCommand
} from "../../src/framework/authorityRequest.ts";
import { findProgrammeLearningItem } from "../../src/lib/server/programmeAuthority.ts";

describe("v3 authoritative completion boundary", () => {
  it("accepts only the minimal client command", () => {
    expect(
      parseCompleteLearningItemCommand({
        itemId: "B1.2",
        evidenceRefs: ["evidence-1", "evidence-1", "evidence-2"]
      })
    ).toEqual({
      itemId: "B1.2",
      evidenceRefs: ["evidence-1", "evidence-2"]
    });
  });

  it("rejects browser-supplied identity and trust assertions", () => {
    expect(() =>
      parseCompleteLearningItemCommand({
        itemId: "B1.2",
        learnerId: "attacker",
        itemType: "lesson",
        course: "beginner",
        verificationLevel: "machine-verified",
        clientAssertions: { verified: true }
      })
    ).toThrow(/unsupported field/i);
  });

  it("bounds evidence references to prevent oversized authority requests", () => {
    expect(() =>
      parseCompleteLearningItemCommand({
        itemId: "B1.2",
        evidenceRefs: Array.from({ length: 33 }, (_, index) => `evidence-${index}`)
      })
    ).toThrow(/evidenceRefs/i);

    expect(() =>
      parseCompleteLearningItemCommand({
        itemId: "B1.2",
        evidenceRefs: ["x".repeat(201)]
      })
    ).toThrow(/evidence reference/i);
  });

  it("rejects unknown learning items before persistence", () => {
    expect(findProgrammeLearningItem("does-not-exist")).toBeUndefined();
    expect(findProgrammeLearningItem("B1.2")?.itemType).toBe("lesson");
  });

  it("does not let the browser redefine authoritative programme metadata", () => {
    const item = findProgrammeLearningItem("B1.2");
    expect(item.course).toBe("beginner");
    expect(item.projectId).toBe("B1");
  });
});
