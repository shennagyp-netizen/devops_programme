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
      for (const item of bank.items) {
        expect(item.competencyId.startsWith(section.id + ".")).toBe(true);
        expect(item.prompt.trim()).not.toBe("");
      }
    }
  });

  it("loads every Beginner podcast script", async () => {
    for (const lesson of lessons) {
      const source = await readFile(path.join(root, "podcasts/beginner", lesson.id + ".txt"), "utf8");
      expect(source.trim().length).toBeGreaterThan(100);
    }
  });
});