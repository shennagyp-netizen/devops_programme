import { describe, expect, it } from "vitest";
import {
  assessmentBlueprints,
  defaultDifficultyMix,
  getSectionAssessments
} from "../../src/data/assessment.ts";

describe("assessment blueprint unit contract", () => {
  it("has 63 family blueprints across 21 sections", () => {
    expect(assessmentBlueprints).toHaveLength(63);
    expect(assessmentBlueprints.every((blueprint) => blueprint.status === "pilot")).toBe(true);
  });

  it("uses one shared difficulty mix", () => {
    for (const blueprint of assessmentBlueprints) {
      expect(blueprint.targetDifficultyMix).toEqual(defaultDifficultyMix);
      expect(
        blueprint.targetDifficultyMix.foundation +
          blueprint.targetDifficultyMix.applied +
          blueprint.targetDifficultyMix.difficult +
          blueprint.targetDifficultyMix.challenge
      ).toBe(1);
    }
  });

  it("keeps family item counts and time budgets explicit", () => {
    expect(
      assessmentBlueprints
        .filter((blueprint) => blueprint.family === "conceptual")
        .every((blueprint) => blueprint.targetItemCount === 20 && blueprint.expectedMinutes === 60)
    ).toBe(true);

    expect(
      assessmentBlueprints
        .filter((blueprint) => blueprint.family === "diagnostic")
        .every((blueprint) => blueprint.targetItemCount === 12 && blueprint.expectedMinutes === 45)
    ).toBe(true);

    expect(
      assessmentBlueprints
        .filter((blueprint) => blueprint.family === "hands-on")
        .every((blueprint) => blueprint.targetItemCount === 8 && blueprint.expectedMinutes === 90)
    ).toBe(true);
  });

  it("returns exactly three assessment families for a section", () => {
    const blueprints = getSectionAssessments("advanced", "A-A3");
    expect(blueprints).toHaveLength(3);
    expect(blueprints.map((item) => item.family)).toEqual([
      "conceptual",
      "diagnostic",
      "hands-on"
    ]);
  });
});
