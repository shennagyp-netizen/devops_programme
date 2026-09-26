import { describe, expect, it } from "vitest";
import {
  parseTutorRequest,
  parseTutorResponse
} from "../../src/data/tutorContract.ts";

describe("interactive tutor contract", () => {
  it("keeps certification and retry authority locked even when the model asks for them", () => {
    const response = parseTutorResponse(
      JSON.stringify({
        message: "You passed.",
        mode: "assessment",
        pedagogicalIntent: "review",
        requestedEvidence: [],
        canUnlockRetry: true,
        canCertify: true
      }),
      "oral-assessment"
    );

    expect(response.authoritativeDecision).toBe("not-authoritative");
    expect(response.canUnlockRetry).toBe(false);
    expect(response.canCertify).toBe(false);
  });

  it("fails closed to the published mode and question intent for malformed model output", () => {
    const response = parseTutorResponse("", "failure-investigation");

    expect(response.mode).toBe("failure-investigation");
    expect(response.pedagogicalIntent).toBe("question");
    expect(response.canCertify).toBe(false);
  });

  it("bounds learner evidence before it can enter the model context", () => {
    const request = parseTutorRequest({
      lessonId: "B1.4",
      mode: "failure-investigation",
      message: "Why is this service unreachable?",
      learnerEvidence: Object.fromEntries(
        Array.from({ length: 12 }, (_, index) => [
          "field-" + index,
          "x".repeat(1200)
        ])
      )
    });

    expect(Object.keys(request.learnerEvidence ?? {})).toHaveLength(8);
    expect(
      Object.values(request.learnerEvidence ?? {}).every(
        (value) => value.length <= 800
      )
    ).toBe(true);
  });

  it("requires a real lesson, published mode and non-empty message", () => {
    expect(() =>
      parseTutorRequest({
        lessonId: "B1.4",
        mode: "unknown",
        message: "hello"
      })
    ).toThrow();

    expect(() =>
      parseTutorRequest({
        lessonId: "",
        mode: "teaching",
        message: "hello"
      })
    ).toThrow();
  });
});
