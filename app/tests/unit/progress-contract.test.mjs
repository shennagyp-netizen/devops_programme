import { describe, expect, it } from "vitest";
import {
  parseCompletionInput,
  type CompletionInput
} from "../../src/lib/progress-contract.ts";

describe("completion input contract", () => {
  it("accepts only the four supported learning item types", () => {
    for (const itemType of ["lesson", "assignment", "question", "project"] as const) {
      expect(parseCompletionInput({ itemType, itemId: "X-1" })).toEqual({
        itemType,
        itemId: "X-1"
      });
    }
  });

  it("rejects missing or unsupported item identity", () => {
    expect(() => parseCompletionInput({})).toThrow("itemType is required.");
    expect(() => parseCompletionInput({ itemType: "video", itemId: "X-1" })).toThrow(
      "itemType must be lesson, assignment, question, or project."
    );
    expect(() => parseCompletionInput({ itemType: "lesson" })).toThrow(
      "itemId is required."
    );
  });

  it("does not accept learner identity from the browser", () => {
    const input = {
      itemType: "lesson",
      itemId: "B1.2",
      learnerId: "attacker-chosen-id"
    };

    expect(parseCompletionInput(input)).toEqual({
      itemType: "lesson",
      itemId: "B1.2"
    });
  });

  it("keeps optional metadata bounded and ignores unknown fields", () => {
    const input: CompletionInput & Record<string, unknown> = {
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1",
      verificationLevel: "exercise-validated",
      stdout: "must never be stored",
      stderr: "must never be stored",
      attempt: 3
    };

    expect(parseCompletionInput(input)).toEqual({
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1",
      verificationLevel: "exercise-validated"
    });
  });

  it("rejects oversized values", () => {
    expect(() =>
      parseCompletionInput({
        itemType: "lesson",
        itemId: "x".repeat(201)
      })
    ).toThrow("itemId must be a non-empty string up to 200 characters.");
  });
});
