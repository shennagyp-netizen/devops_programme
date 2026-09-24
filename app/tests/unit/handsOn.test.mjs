import { describe, expect, it } from "vitest";
import { getHandsOnTask, validateHandsOnEvidence } from "../../src/data/handsOn.ts";

describe("hands-on task contracts", () => {
  it("returns an authored override when one exists", () => {
    const task = getHandsOnTask({
      id: "B1.2",
      title: "test",
      domain: "test",
      objective: "test",
      podcast: "",
      lab: { objective: "test", command: "test", challenge: "test" },
      recall: []
    });

    expect(task.id).toBe("hands-on-B1.2");
    expect(task.lessonId).toBe("B1.2");
    expect(task.verificationLevel).toBe("structured");
    expect(task.steps.length).toBeGreaterThanOrEqual(4);
  });

  it("builds a default contract for an unoverridden lesson", () => {
    const task = getHandsOnTask({
      id: "D5.4",
      title: "Failure lesson",
      domain: "test",
      objective: "Test recovery",
      podcast: "",
      lab: {
        objective: "Test recovery",
        command: "echo test",
        challenge: "Change one thing and recover it."
      },
      recall: []
    });

    expect(task.verificationLevel).toBe("structured");
    expect(task.steps[0]).toContain("Change one thing");
    expect(task.evidenceFields).toHaveLength(4);
  });

  it("rejects incomplete evidence", () => {
    const task = getHandsOnTask({
      id: "B1.2",
      title: "test",
      domain: "test",
      objective: "test",
      podcast: "",
      lab: { objective: "test", command: "test", challenge: "test" },
      recall: []
    });

    const result = validateHandsOnEvidence(task, {
      observation: "short"
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toHaveLength(4);
  });

  it("accepts complete evidence and preserves the field contract", () => {
    const task = getHandsOnTask({
      id: "B1.2",
      title: "test",
      domain: "test",
      objective: "test",
      podcast: "",
      lab: { objective: "test", command: "test", challenge: "test" },
      recall: []
    });

    const evidence = Object.fromEntries(
      task.evidenceFields.map((field) => [
        field.id,
        "This is a sufficiently detailed evidence statement for the required field."
      ])
    );

    expect(validateHandsOnEvidence(task, evidence)).toEqual({
      valid: true,
      failures: []
    });
  });
});
