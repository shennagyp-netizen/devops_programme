import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { courses } from "../../src/data/programme.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../exams/items");

const difficultyTarget = {
  foundation: 0.15,
  applied: 0.35,
  difficult: 0.35,
  challenge: 0.15
};

describe("assessment bank integration", () => {
  const cases = courses.flatMap((course) =>
    course.sections.map((section) => ({
      course: course.id,
      section: section.id
    }))
  );

  it("has one 40-item bank for every authored section", async () => {
    for (const { course, section } of cases) {
      const source = await readFile(
        path.join(root, course, section + ".json"),
        "utf8"
      );
      const bank = JSON.parse(source);

      expect(bank.sectionId).toBe(section);
      expect(bank.items).toHaveLength(40);
    }
  });

  it("has no duplicate item IDs across the whole programme", async () => {
    const ids = new Set();

    for (const { course, section } of cases) {
      const bank = JSON.parse(
        await readFile(path.join(root, course, section + ".json"), "utf8")
      );

      for (const item of bank.items) {
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);
      }
    }

    expect(ids.size).toBe(840);
  });

  it("preserves the family-level 15/35/35/15 blueprint", async () => {
    for (const { course, section } of cases) {
      const bank = JSON.parse(
        await readFile(path.join(root, course, section + ".json"), "utf8")
      );

      for (const family of ["conceptual", "diagnostic", "hands-on"]) {
        const items = bank.items.filter((item) => item.family === family);
        expect(
          Object.values(difficultyTarget).reduce((sum, target) => sum + target, 0)
        ).toBe(1);

        for (const [band, target] of Object.entries(difficultyTarget)) {
          expect(items.filter((item) => item.difficulty === band)).toHaveLength(
            Math.round(items.length * target)
          );
        }
      }
    }
  });

  it("matches family quotas and validates item-level response contracts", async () => {
    const familyCounts = {
      conceptual: 20,
      diagnostic: 12,
      "hands-on": 8
    };

    const allowedCognitiveLevels = new Set([
      "mechanism",
      "application",
      "diagnosis",
      "design"
    ]);

    for (const { course, section } of cases) {
      const bank = JSON.parse(
        await readFile(path.join(root, course, section + ".json"), "utf8")
      );

      for (const [family, expectedCount] of Object.entries(familyCounts)) {
        const items = bank.items.filter((item) => item.family === family);
        expect(items).toHaveLength(expectedCount);

        for (const item of items) {
          expect(allowedCognitiveLevels.has(item.cognitiveLevel)).toBe(true);
          expect(item.competencyId.startsWith(section + ".")).toBe(true);
          expect(item.prompt.trim()).not.toBe("");
          expect(item.itemType.trim()).not.toBe("");
          expect(item.expectedMinutes).toBeGreaterThan(0);
          expect(typeof item.itemType).toBe("string");
          expect(item.itemType.trim()).not.toBe("");

          if (item.options) {
            expect(item.options.length).toBeGreaterThan(1);
            expect(Number.isInteger(item.correctOption)).toBe(true);
            expect(item.correctOption).toBeGreaterThanOrEqual(0);
            expect(item.correctOption).toBeLessThan(item.options.length);
          } else if (family === "hands-on") {
            expect(item.environment?.length).toBeGreaterThan(0);
            expect(item.initialState).toBeTruthy();
            expect(item.allowedOperations?.length).toBeGreaterThan(0);
          } else {
            expect(
              item.expectedElements?.length ||
              item.scoring?.full?.length ||
              item.scoringNote
            ).toBeTruthy();
          }
        }
      }
    }
  });

  it("contains executable evidence contracts for hands-on items", async () => {
    for (const { course, section } of cases) {
      const bank = JSON.parse(
        await readFile(path.join(root, course, section + ".json"), "utf8")
      );

      for (const item of bank.items.filter((candidate) => candidate.family === "hands-on")) {
        expect(item.environment).toBeDefined();
        expect(item.initialState).toBeDefined();
        expect(item.allowedOperations?.length).toBeGreaterThan(0);
        expect(item.success?.length).toBeGreaterThan(0);
        expect(item.evidence?.length).toBeGreaterThan(0);
        expect(item.recoveryRequirements?.length).toBeGreaterThan(0);
        expect(item.resetStrategy).toBeTruthy();
      }
    }
  });
});
