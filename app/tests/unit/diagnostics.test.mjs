import { describe, expect, it } from "vitest";
import {
  diagnosticBySection,
  diagnosticDefinitions
} from "../../src/data/diagnostics.ts";

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
    const ids = new Set(["B1.1","B1.2","B1.3","B1.4","B1.5","B2.1","B2.2","B2.3","B3.1","B3.2","D1.1","D1.2","D1.3","D1.4","D1.5","D1.6","D2.1","D2.2","D2.3","D2.4","D2.5","D2.6","D2.7","D3.1","D3.2","D3.3","D3.4","D3.5","D4.1","D4.2","D4.3","D4.4","D4.5","D4.6","D5.1","D5.2","D5.3","D5.4","D5.5","D5.6","D5.7","D5.8","A1.1","A1.2","A1.3","A1.4","A1.5","A1.6","A2.1","A2.2","A2.3","A3.1","A3.2"]);

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
