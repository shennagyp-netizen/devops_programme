import { describe, expect, it } from "vitest";
import { courseLessons } from "../../src/data/courseLessons.ts";
import { courses } from "../../src/data/programme.ts";
import { projectsByCourse } from "../../src/data/projects.ts";
import { diagnosticDefinitions } from "../../src/data/diagnostics.ts";
import { getHandsOnTask, validateHandsOnEvidence } from "../../src/data/handsOn.ts";

const lessons = courseLessons.filter((lesson) => lesson.course === "beginner");

describe("Beginner course unit gate", () => {
  it("has the exact 10 authored lessons", () => {
    expect(lessons.map((lesson) => lesson.id)).toEqual(["B1.1","B1.2","B1.3","B1.4","B1.5","B2.1","B2.2","B2.3","B3.1","B3.2"]);
  });

  it("has the exact section and project graph", () => {
    expect(courses.find((course) => course.id === "beginner")?.sections.map((s) => s.id)).toEqual(["B-F1","B-F2","B-A1","B-A2","B-A3","B-A4","B-A5"]);
    expect(projectsByCourse.beginner.map((p) => p.id)).toEqual(["B1","B2","B3"]);
    expect(diagnosticDefinitions.filter((d) => d.course === "beginner")).toHaveLength(7);
  });

  it("requires complete learning and platform contracts", () => {
    for (const lesson of lessons) {
      expect(lesson.objective.trim()).not.toBe("");
      expect(lesson.lab.command.trim()).not.toBe("");
      expect(lesson.lab.challenge.trim()).not.toBe("");
      expect(lesson.recall).toHaveLength(5);
      expect(lesson.platformCommands.macos).toBeTruthy();
      expect(lesson.platformCommands.linux).toBeTruthy();
      expect(lesson.platformCommands.windows).toBeTruthy();
    }
  });

  it("builds valid structured hands-on evidence for every Beginner lesson", () => {
    for (const lesson of lessons) {
      const task = getHandsOnTask(lesson);
      expect(task.lessonId).toBe(lesson.id);
      expect(task.steps.length).toBeGreaterThanOrEqual(4);
      expect(task.evidenceFields).toHaveLength(4);
      expect(task.verificationLevel).toBe("structured");
      const evidence = Object.fromEntries(task.evidenceFields.map((field) => [field.id, "This evidence statement is long enough for the required Beginner evidence contract."]));
      expect(validateHandsOnEvidence(task, evidence)).toEqual({ valid: true, failures: [] });
    }
  });

  it("fails closed on incomplete hands-on evidence", () => {
    for (const lesson of lessons) expect(validateHandsOnEvidence(getHandsOnTask(lesson), { observation: "partial" }).valid).toBe(false);
  });
});