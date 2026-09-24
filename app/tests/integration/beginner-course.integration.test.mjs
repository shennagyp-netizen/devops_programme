import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { courseLessons } from "../../src/data/courseLessons.ts";
import { courses } from "../../src/data/programme.ts";
import { diagnosticDefinitions } from "../../src/data/diagnostics.ts";
import { projectsByCourse } from "../../src/data/projects.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../");
const beginner = courses.find((course) => course.id === "beginner");
const lessons = courseLessons.filter((lesson) => lesson.course === "beginner");

describe("Beginner course integration gate", () => {
  it("connects every section to lessons and a prerequisite diagnostic", () => {
    expect(beginner).toBeDefined();
    for (const section of beginner.sections) {
      expect(lessons.some((lesson) => lesson.sectionId === section.id)).toBe(true);
      expect(diagnosticDefinitions.some((d) => d.course === "beginner" && d.sectionId === section.id)).toBe(true);
    }
  });

  it("connects every project to Beginner lessons", () => {
    for (const projectId of beginner.projects) {
      expect(projectsByCourse.beginner.some((project) => project.id === projectId)).toBe(true);
      expect(lessons.some((lesson) => lesson.projectId === projectId)).toBe(true);
    }
  });

  it("loads and validates all seven assessment banks", async () => {
    for (const section of beginner.sections) {
      const bank = JSON.parse(await readFile(path.join(root, "exams/items/beginner", section.id + ".json"), "utf8"));
      expect(bank.schemaVersion).toBe(1);
      expect(bank.sectionId).toBe(section.id);
      expect(bank.items).toHaveLength(40);
      expect(new Set(bank.items.map((item) => item.id)).size).toBe(40);
      expect(bank.items.filter((item) => item.family === "conceptual")).toHaveLength(20);
      expect(bank.items.filter((item) => item.family === "diagnostic")).toHaveLength(12);
      expect(bank.items.filter((item) => item.family === "hands-on")).toHaveLength(8);

      const rules = {
        conceptual: { count: 20, minutes: 60, levels: ["mechanism", "application", "design"], suffix: "core", bands: { foundation: 3, applied: 7, difficult: 7, challenge: 3 } },
        diagnostic: { count: 12, minutes: 45, levels: ["application", "diagnosis"], suffix: "diagnostic", bands: { foundation: 2, applied: 4, difficult: 4, challenge: 2 } },
        "hands-on": { count: 8, minutes: 90, levels: ["application", "diagnosis", "design"], suffix: "hands-on", bands: { foundation: 1, applied: 3, difficult: 3, challenge: 1 } }
      };

      for (const [family, rule] of Object.entries(rules)) {
        const familyItems = bank.items.filter((item) => item.family === family);
        expect(familyItems).toHaveLength(rule.count);

        for (const level of rule.levels) {
          expect(familyItems.some((item) => item.cognitiveLevel === level)).toBe(true);
        }
        expect(familyItems.every((item) => item.competencyId === section.id + "." + rule.suffix)).toBe(true);

        const selected = [];
        for (const [band, count] of Object.entries(rule.bands)) {
          const bandItems = familyItems
            .filter((item) => item.difficulty === band)
            .sort((a, b) => b.expectedMinutes - a.expectedMinutes)
            .slice(0, count);
          expect(bandItems).toHaveLength(count);
          selected.push(...bandItems);
        }

        expect(selected.reduce((sum, item) => sum + item.expectedMinutes, 0)).toBeLessThanOrEqual(rule.minutes * 1.25);
      }
      for (const item of bank.items) {
        expect(item.competencyId.startsWith(section.id + ".")).toBe(true);
        expect(item.prompt.trim()).not.toBe("");
        expect(typeof item.itemType).toBe("string");
        expect(item.itemType.trim()).not.toBe("");
        if (!item.options && item.family !== "hands-on") {
          expect(item.expectedElements?.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("loads every Beginner podcast script", async () => {
    for (const lesson of lessons) {
      const source = await readFile(path.join(root, "podcasts/beginner", lesson.id + ".txt"), "utf8");
      expect(source.trim().length).toBeGreaterThan(100);
      expect(source).toMatch(new RegExp("^EPISODE " + lesson.id + " — "));
    }
  });
});