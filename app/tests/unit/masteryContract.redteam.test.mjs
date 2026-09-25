import { describe, expect, it } from "vitest";
import { parseMasteryAttemptInput } from "../../src/lib/mastery-contract.ts";

describe("mastery attempt contract", () => {
  const valid = {
    lessonId: "B1.4",
    assignmentId: "hands-on-B1.4",
    attemptNumber: 1,
    failureClass: "concept-gap",
    failedFields: ["observation"],
    remediationMethods: ["plain-language", "analogy"]
  };

  it("accepts a bounded valid attempt", () => {
    expect(parseMasteryAttemptInput(valid)).toEqual(valid);
  });

  it("rejects invalid failure classes and remediation methods", () => {
    expect(() =>
      parseMasteryAttemptInput({ ...valid, failureClass: "skip-all" })
    ).toThrow("failureClass is invalid.");

    expect(() =>
      parseMasteryAttemptInput({
        ...valid,
        remediationMethods: ["skip-the-work"]
      })
    ).toThrow("remediationMethods contains an invalid method.");
  });

  it("rejects impossible attempt numbers", () => {
    expect(() =>
      parseMasteryAttemptInput({ ...valid, attemptNumber: 0 })
    ).toThrow("attemptNumber must be a positive integer.");

    expect(() =>
      parseMasteryAttemptInput({ ...valid, attemptNumber: 1001 })
    ).toThrow("attemptNumber must be a positive integer.");
  });
});
