import { describe, expect, it } from "vitest";
import {
  resolveLearningItem,
  learningItemCompletionMetadata
} from "../../src/lib/server/learning-item-catalog.ts";

describe("server learning-item authority", () => {
  it("resolves a real lesson from canonical curriculum data", () => {
    expect(resolveLearningItem("lesson", "B1.2")).toEqual({
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1"
    });
  });

  it("resolves assignment identity only when it maps to a real hands-on lesson", () => {
    expect(resolveLearningItem("assignment", "hands-on-B1.2")).toEqual({
      itemType: "assignment",
      itemId: "hands-on-B1.2",
      course: "beginner",
      projectId: "B1"
    });
  });

  it("resolves projects from canonical project definitions", () => {
    expect(resolveLearningItem("project", "I2")).toEqual({
      itemType: "project",
      itemId: "I2",
      course: "intermediate",
      projectId: "I2"
    });
  });

  it("resolves real assessment questions without trusting browser metadata", () => {
    expect(resolveLearningItem("question", "BF1-C-001")).toEqual({
      itemType: "question",
      itemId: "BF1-C-001",
      course: "beginner",
      projectId: "B1"
    });
  });

  it("rejects made-up lesson, assignment, project and question IDs", () => {
    expect(() => resolveLearningItem("lesson", "B1.999")).toThrow(
      "Learning item does not exist."
    );
    expect(() => resolveLearningItem("assignment", "hands-on-B1.999")).toThrow(
      "Learning item does not exist."
    );
    expect(() => resolveLearningItem("project", "B999")).toThrow(
      "Learning item does not exist."
    );
    expect(() => resolveLearningItem("question", "BF1-C-999")).toThrow(
      "Learning item does not exist."
    );
  });

  it("derives trusted completion metadata instead of accepting a learner-selected verification level", () => {
    expect(learningItemCompletionMetadata("lesson", "B1.2")).toEqual({
      course: "beginner",
      projectId: "B1",
      verificationLevel: "self-report"
    });
  });
});
