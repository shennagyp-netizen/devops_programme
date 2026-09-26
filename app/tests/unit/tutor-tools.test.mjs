import { describe, expect, it } from "vitest";
import {
  assertTutorToolDefinitionsAreReadOnly,
  executeTutorTool,
  tutorToolDefinitions
} from "../../src/lib/server/tutorTools.ts";

const context = {
  lesson: {
    id: "B1.4",
    title: "Why Containers Exist",
    objective: "Explain the container boundary.",
    course: "beginner",
    projectId: "B1",
    sectionId: "B-F2",
    humanExample: "A service boundary can be isolated and repeated."
  },
  project: {
    id: "B1",
    title: "Containerized Application",
    objective: "Operate a repeatable local service.",
    environment: "Local container runtime",
    estimatedHours: 18,
    phases: [
      {
        id: "B1-P1",
        title: "Baseline",
        objective: "Build the known-good baseline.",
        hours: 4,
        exitEvidence: ["baseline evidence"]
      }
    ],
    failureScenarios: ["wrong port"],
    competencyGates: ["B-F2.core"],
    evidenceRequirements: ["request evidence"],
    completionCriteria: ["recovery is verified"],
    reviewGates: ["baseline approved"]
  },
  learner: {
    completionCount: 2,
    recentCompletedItems: ["lesson:B1.1"],
    masteryAttemptsForLesson: []
  }
};

describe("read-only tutor tools", () => {
  it("publishes only read-only get_* tools", () => {
    expect(assertTutorToolDefinitionsAreReadOnly()).toBe(true);
    expect(tutorToolDefinitions.every((tool) => tool.name.startsWith("get_"))).toBe(true);
  });

  it("returns the current lesson hands-on contract", () => {
    const raw = executeTutorTool(
      "get_hands_on_contract",
      { lessonId: "B1.4" },
      context,
      "macos"
    );
    const result = JSON.parse(raw);
    expect(result.lessonId).toBe("B1.4");
    expect(result.taskId).toBe("hands-on-B1.4");
    expect(result.successCriteria.length).toBeGreaterThan(0);
  });

  it("fails closed when a model asks for another lesson", () => {
    expect(() =>
      executeTutorTool(
        "get_hands_on_contract",
        { lessonId: "B1.5" },
        context,
        "macos"
      )
    ).toThrow("current lesson");
  });

  it("returns the selected project phase but cannot mutate it", () => {
    const raw = executeTutorTool(
      "get_project_phase",
      { phaseId: "B1-P1" },
      context,
      "macos"
    );
    const result = JSON.parse(raw);
    expect(result.phase.id).toBe("B1-P1");
    expect(result).not.toHaveProperty("update");
  });

  it("never exposes a tool that executes a runtime command", () => {
    const raw = executeTutorTool(
      "get_runtime_contract",
      { lessonId: "B1.4" },
      context,
      "macos"
    );
    const result = JSON.parse(raw);
    expect(result.available).toBe(false);
  });

  it("rejects unknown or write-like tool names", () => {
    expect(() =>
      executeTutorTool(
        "run_command",
        { command: "rm -rf /" },
        context,
        "macos"
      )
    ).toThrow("Unsupported tutor tool");
  });
});
