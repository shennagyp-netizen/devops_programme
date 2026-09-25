import { describe, expect, it } from "vitest";
import {
  assessmentExplanation,
  findAlternateAssessmentItem,
  getGradableAssessmentItems,
  getPracticeForm
} from "../../src/data/assessmentItems.ts";

describe("assessment practice engine", () => {
  it("exposes automatically gradable pilot questions for each authored family", () => {
    const items = getGradableAssessmentItems("B-F1", "conceptual");

    expect(items.length).toBeGreaterThan(5);
    expect(items.every((item) => Array.isArray(item.options))).toBe(true);
    expect(items.every((item) => Number.isInteger(item.correctOption))).toBe(true);
  });

  it("builds a small deterministic practice form instead of dumping the full bank", () => {
    const first = getPracticeForm("B-F1", "conceptual");
    const second = getPracticeForm("B-F1", "conceptual");

    expect(first.length).toBeGreaterThan(0);
    expect(first.length).toBeLessThanOrEqual(6);
    expect(first.map((item) => item.id)).toEqual(second.map((item) => item.id));
  });

  it("finds a different question for the same competency after failure", () => {
    const form = getPracticeForm("B-F1", "conceptual");
    const current = form[0];
    const alternate = findAlternateAssessmentItem(current, new Set([current.id]));

    expect(alternate).toBeDefined();
    expect(alternate?.id).not.toBe(current.id);
    expect(alternate?.competencyId).toBe(current.competencyId);
  });

  it("always provides a learner-facing explanation for a wrong answer", () => {
    const form = getPracticeForm("B-F1", "conceptual");
    for (const item of form) {
      expect(assessmentExplanation(item).trim().length).toBeGreaterThan(0);
    }
  });
});
