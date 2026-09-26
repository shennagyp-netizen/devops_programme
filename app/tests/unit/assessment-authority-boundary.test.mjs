import { describe, expect, it } from "vitest";
import {
  parseIssueAssessmentCommand,
  parseSubmitAssessmentCommand
} from "../../src/framework/assessmentRequest.ts";

describe("assessment authority request boundary", () => {
  it("accepts a minimal issue command", () => {
    expect(
      parseIssueAssessmentCommand({
        courseId: "beginner",
        sectionId: "B-F1",
        family: "conceptual"
      })
    ).toEqual({
      courseId: "beginner",
      sectionId: "B-F1",
      family: "conceptual"
    });
  });

  it("rejects client-selected seed and answer/scoring metadata when issuing an instance", () => {
    expect(() =>
      parseIssueAssessmentCommand({
        courseId: "beginner",
        sectionId: "B-F1",
        family: "conceptual",
        seed: "attacker-seed"
      })
    ).toThrow(/unsupported field/i);
  });

  it("accepts bounded answer submissions", () => {
    expect(
      parseSubmitAssessmentCommand({
        instanceId: "instance-1",
        answers: {
          "BF1-C-001": 1,
          "BF1-C-002": "selected"
        }
      })
    ).toEqual({
      instanceId: "instance-1",
      answers: {
        "BF1-C-001": 1,
        "BF1-C-002": "selected"
      }
    });
  });

  it("rejects browser-supplied scores and outcomes", () => {
    expect(() =>
      parseSubmitAssessmentCommand({
        instanceId: "instance-1",
        answers: {},
        score: 100,
        outcome: "passed"
      })
    ).toThrow(/unsupported field/i);
  });

  it("bounds answer count and answer size", () => {
    expect(() =>
      parseSubmitAssessmentCommand({
        instanceId: "instance-1",
        answers: Object.fromEntries(
          Array.from({ length: 41 }, (_, index) => [`Q-${index}`, index])
        )
      })
    ).toThrow(/answers/i);

    expect(() =>
      parseSubmitAssessmentCommand({
        instanceId: "instance-1",
        answers: { "Q-1": "x".repeat(4001) }
      })
    ).toThrow(/invalid or too large/i);
  });
});
