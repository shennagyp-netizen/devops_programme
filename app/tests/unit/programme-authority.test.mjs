import { describe, expect, it } from "vitest";
import { programmeLearningItems, findProgrammeLearningItem } from "../../src/lib/server/programmeAuthority.ts";

describe("authoritative programme completion policies", () => {
  it("has a non-empty evidence policy for every learning item", () => {
    expect(programmeLearningItems.length).toBeGreaterThan(60);

    const ids = new Set(programmeLearningItems.map((item) => item.id));
    expect(ids.size).toBe(programmeLearningItems.length);

    for (const item of programmeLearningItems) {
      expect(item.completion.mode, item.id).toBe("evidence");
      expect(item.completion.requiredEvidence.length, item.id).toBeGreaterThan(0);
    }
  });

  it("requires an exercise proof for lessons", () => {
    const lessons = programmeLearningItems.filter((item) => item.itemType === "lesson");
    expect(lessons.length).toBeGreaterThan(50);

    for (const item of lessons) {
      expect(item.completion.requiredEvidence, item.id).toContain("exercise");
    }
  });

  it("requires exercise, failure, and recovery proof for projects", () => {
    const projects = programmeLearningItems.filter((item) => item.itemType === "project");
    expect(projects).toHaveLength(9);

    for (const item of projects) {
      expect(item.completion.requiredEvidence, item.id).toEqual(
        expect.arrayContaining(["exercise", "failure", "recovery"])
      );
    }
  });

  it("keeps DevOps metadata authoritative", () => {
    expect(findProgrammeLearningItem("B1.2")).toMatchObject({
      itemType: "lesson",
      course: "beginner",
      projectId: "B1",
      programmeId: "devops"
    });
  });
});
