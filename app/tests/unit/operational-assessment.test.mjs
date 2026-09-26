import { describe, expect, it } from "vitest";
import { scoreAssessment, validateAssessmentAnswers, attemptExpiresAt } from "../../src/assessment/operational.ts";

const items = [
  {
    id: "mcq-1",
    sectionId: "B-F1",
    family: "conceptual",
    difficulty: "foundation",
    cognitiveLevel: "mechanism",
    itemType: "selected-response",
    expectedMinutes: 1,
    competencyId: "B-F1.core",
    prompt: "Placeholder bank item",
    options: ["A", "B", "C", "D"],
    correctOption: 2
  },
  {
    id: "open-1",
    sectionId: "B-F1",
    family: "diagnostic",
    difficulty: "applied",
    cognitiveLevel: "diagnosis",
    itemType: "scenario",
    expectedMinutes: 3,
    competencyId: "B-F1.diagnostic",
    prompt: "Placeholder bank item",
    expectedElements: ["evidence"]
  }
];

describe("operational assessment runner", () => {
  it("validates selected-response indexes and rejects duplicates", () => {
    expect(() =>
      validateAssessmentAnswers(items, [{ itemId: "mcq-1", value: 4 }])
    ).toThrow();

    expect(() =>
      validateAssessmentAnswers(items, [
        { itemId: "mcq-1", value: 1 },
        { itemId: "mcq-1", value: 1 }
      ])
    ).toThrow();
  });

  it("scores objective responses without inventing a score for open responses", () => {
    const result = scoreAssessment(items, [
      { itemId: "mcq-1", value: 2 },
      { itemId: "open-1", value: "Evidence-based response." }
    ]);

    expect(result.itemCount).toBe(2);
    expect(result.answeredCount).toBe(2);
    expect(result.autoScoredCount).toBe(1);
    expect(result.correctCount).toBe(1);
    expect(result.autoScorePercent).toBe(100);
    expect(result.reviewRequiredCount).toBe(1);
    expect(result.status).toBe("submitted-review-required");
  });

  it("uses an explicit assessment clock instead of client-provided duration", () => {
    const start = new Date("2026-09-26T10:00:00.000Z");
    expect(attemptExpiresAt(start, 60).toISOString()).toBe(
      "2026-09-26T11:00:00.000Z"
    );
  });
});
