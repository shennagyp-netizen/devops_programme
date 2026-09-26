import { describe, expect, it } from "vitest";
import {
  publicAssessmentItem,
  scoreAssessment,
  validateAssessmentAnswers
} from "../../src/assessment/operational.ts";

const objectiveItem = {
  id: "objective-1",
  sectionId: "B-F1",
  family: "conceptual",
  difficulty: "foundation",
  cognitiveLevel: "mechanism",
  itemType: "selected-response",
  expectedMinutes: 1,
  competencyId: "B-F1.core",
  prompt: "Placeholder assessment item",
  options: ["A", "B", "C", "D"],
  correctOption: 2
};

const openItem = {
  id: "open-1",
  sectionId: "B-F1",
  family: "diagnostic",
  difficulty: "applied",
  cognitiveLevel: "diagnosis",
  itemType: "scenario",
  expectedMinutes: 3,
  competencyId: "B-F1.diagnostic",
  prompt: "Placeholder assessment item",
  expectedElements: ["evidence"]
};

describe("operational assessment red-team", () => {
  it("never exposes the selected-response answer key in the public item", () => {
    expect(publicAssessmentItem(objectiveItem)).not.toHaveProperty("correctOption");
  });

  it("rejects an answer for an item that is not in the server-generated form", () => {
    expect(() =>
      validateAssessmentAnswers([objectiveItem], [
        { itemId: "attacker-injected-item", value: 0 }
      ])
    ).toThrow("Unknown assessment item.");
  });

  it("rejects duplicate answers for the same item", () => {
    expect(() =>
      validateAssessmentAnswers([objectiveItem, openItem], [
        { itemId: "objective-1", value: 2 },
        { itemId: "objective-1", value: 1 }
      ])
    ).toThrow("Duplicate assessment answer.");
  });

  it("rejects selected-response values outside the form options", () => {
    expect(() =>
      validateAssessmentAnswers([objectiveItem], [
        { itemId: "objective-1", value: 99 }
      ])
    ).toThrow("Invalid selected-response answer.");
  });

  it("does not manufacture a score for an open response", () => {
    const result = scoreAssessment([openItem], [
      { itemId: "open-1", value: "Learner evidence." }
    ]);

    expect(result.autoScoredCount).toBe(0);
    expect(result.autoScorePercent).toBeNull();
    expect(result.reviewRequiredCount).toBe(1);
  });
});
