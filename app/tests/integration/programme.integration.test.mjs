import { describe, expect, it } from "vitest";
import { courses } from "../../src/data/programme.ts";
import { courseLessons } from "../../src/data/courseLessons.ts";
import { projectsByCourse } from "../../src/data/projects.ts";
import { diagnosticBySection } from "../../src/data/diagnostics.ts";
import { assessmentBlueprints } from "../../src/data/assessment.ts";

describe("programme architecture integration", () => {
  it("contains the complete 21-section programme", () => {
    expect(courses).toHaveLength(3);

    const allSections = courses.flatMap((course) => course.sections);
    expect(allSections).toHaveLength(21);
    expect(new Set(allSections.map((section) => section.id)).size).toBe(21);
  });

  it("maps every authored lesson to a real section and project", () => {
    const sectionIds = new Set(
      courses.flatMap((course) => course.sections.map((section) => section.id))
    );
    const projectIds = new Set(
      courses.flatMap((course) => course.projects)
    );

    expect(courseLessons).toHaveLength(53);

    for (const lesson of courseLessons) {
      expect(sectionIds.has(lesson.sectionId)).toBe(true);
      expect(projectIds.has(lesson.projectId)).toBe(true);
      expect(lesson.podcastStatus).toBe("script-ready");
    }
  });

  it("keeps projects aligned with their course", () => {
    for (const course of courses) {
      const projects = projectsByCourse[course.id];
      expect(projects).toHaveLength(3);
      for (const project of projects) {
        expect(project.course).toBe(course.id);
        expect(course.projects).toContain(project.id);
        expect(project.milestones.length).toBeGreaterThan(0);
        expect(project.completionCriteria.length).toBeGreaterThan(0);
      }
    }
  });

  it("keeps every project competency gate tied to a real section of its course", () => {
    for (const course of courses) {
      const sectionIds = new Set(course.sections.map((section) => section.id));
      for (const project of projectsByCourse[course.id]) {
        for (const gate of project.competencyGates) {
          expect(gate).toMatch(/^[A-Z]-[A-Z0-9-]+\.core$/);
          expect(sectionIds.has(gate.replace(".core", ""))).toBe(true);
        }
      }
    }
  });

  it("provides diagnostics and three assessment families for every section", () => {
    for (const course of courses) {
      for (const section of course.sections) {
        expect(diagnosticBySection[section.id]).toBeDefined();

        const blueprints = assessmentBlueprints.filter(
          (blueprint) =>
            blueprint.courseId === course.id &&
            blueprint.sectionId === section.id
        );

        expect(blueprints).toHaveLength(3);
        expect(new Set(blueprints.map((item) => item.family))).toEqual(
          new Set(["conceptual", "diagnostic", "hands-on"])
        );
        expect(blueprints.every((item) => item.status === "pilot")).toBe(true);
      }
    }
  });

  it("keeps the corrected Docker section mapping intact", () => {
    const dockerLessons = courseLessons.filter((lesson) =>
      ["D2.5", "D2.6", "D2.7"].includes(lesson.id)
    );

    expect(dockerLessons).toHaveLength(3);
    expect(dockerLessons.every((lesson) => lesson.sectionId === "I-A1")).toBe(true);
    expect(dockerLessons.every((lesson) => lesson.projectId === "I1")).toBe(true);
  });
});
