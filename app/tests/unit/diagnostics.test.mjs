import { describe, expect, it } from "vitest";
import {
  diagnosticBySection,
  diagnosticDefinitions,
  recommendationForScore
} from "../../src/data/diagnostics.ts";
import { courseLessons } from "../../src/data/courseLessons.ts";

describe("diagnostic engine definitions", () => {
  it("has exactly one definition for every authored section", () => {
    expect(diagnosticDefinitions).toHaveLength(21);
    expect(new Set(diagnosticDefinitions.map((item) => item.sectionId)).size).toBe(21);
    expect(Object.keys(diagnosticBySection)).toHaveLength(21);
  });

  it("gives every question four options and an in-range answer", () => {
    for (const definition of diagnosticDefinitions) {
      expect(definition.questions).toHaveLength(4);
      const ids = new Set(definition.questions.map((question) => question.id));
      expect(ids.size).toBe(4);

      for (const question of definition.questions) {
        expect(question.options).toHaveLength(4);
        expect(question.correctOption).toBeGreaterThanOrEqual(0);
        expect(question.correctOption).toBeLessThan(question.options.length);
      }
    }
  });

  it("points remediation and prerequisite lesson IDs at real course lessons", () => {
    const ids = new Set(courseLessons.map((lesson) => lesson.id));

    for (const definition of diagnosticDefinitions) {
      for (const lessonId of [
        ...definition.prerequisiteLessonIds,
        ...definition.remediationLessonIds
      ]) {
        expect(ids.has(lessonId)).toBe(true);
      }
    }
  });
});

describe("diagnostic recommendation thresholds", () => {
  it("skip theory at 90% or above", () => {
    expect(recommendationForScore(9, 10)).toBe("skip-theory");
    expect(recommendationForScore(10, 10)).toBe("skip-theory");
  });

  it("condenses theory from 70% through 89%", () => {
    expect(recommendationForScore(7, 10)).toBe("condense-theory");
    expect(recommendationForScore(8, 10)).toBe("condense-theory");
    expect(recommendationForScore(8.9, 10)).toBe("condense-theory");
  });

  it("remediates below 70% and on empty diagnostics", () => {
    expect(recommendationForScore(6, 10)).toBe("remediate");
    expect(recommendationForScore(0, 0)).toBe("remediate");
  });
});
