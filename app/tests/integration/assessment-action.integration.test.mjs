import { beforeEach, describe, expect, it, vi } from "vitest";

const currentUserMock = vi.fn();
const issueAssessmentMock = vi.fn();
const submitAssessmentMock = vi.fn();

vi.mock("../../src/lib/server/auth.ts", () => ({
  requireCurrentUser: currentUserMock
}));

vi.mock("../../src/lib/server/assessmentAuthority.ts", () => ({
  issueAssessmentForUser: issueAssessmentMock,
  submitAssessmentForUser: submitAssessmentMock
}));

const {
  issueAssessmentAction,
  submitAssessmentAction
} = await import("../../src/app/actions/assessment.ts");

describe("assessment server actions", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    issueAssessmentMock.mockReset();
    submitAssessmentMock.mockReset();
  });

  it("binds assessment issuance to the authenticated learner", async () => {
    currentUserMock.mockResolvedValue({ id: "user_1" });
    issueAssessmentMock.mockResolvedValue({ id: "instance-1" });

    await issueAssessmentAction({
      courseId: "beginner",
      sectionId: "B-F1",
      family: "conceptual"
    });

    expect(issueAssessmentMock).toHaveBeenCalledWith("user_1", {
      courseId: "beginner",
      sectionId: "B-F1",
      family: "conceptual"
    });
  });

  it("rejects browser-selected seed and scoring fields", async () => {
    currentUserMock.mockResolvedValue({ id: "user_1" });

    await expect(
      issueAssessmentAction({
        courseId: "beginner",
        sectionId: "B-F1",
        family: "conceptual",
        seed: "attacker-seed"
      })
    ).rejects.toThrow(/unsupported field/i);

    expect(issueAssessmentMock).not.toHaveBeenCalled();
  });

  it("rejects browser-supplied score and outcome on submission", async () => {
    currentUserMock.mockResolvedValue({ id: "user_1" });

    await expect(
      submitAssessmentAction({
        instanceId: "instance-1",
        answers: {},
        score: 999,
        outcome: "passed"
      })
    ).rejects.toThrow(/unsupported field/i);

    expect(submitAssessmentMock).not.toHaveBeenCalled();
  });

  it("passes only the parsed submission to the trusted server service", async () => {
    currentUserMock.mockResolvedValue({ id: "user_1" });
    submitAssessmentMock.mockResolvedValue({
      id: "attempt-1",
      instanceId: "instance-1",
      autoScore: 1,
      autoScorableCount: 1,
      outcome: "scored",
      submittedAt: "2026-09-26T12:00:00.000Z"
    });

    await submitAssessmentAction({
      instanceId: "instance-1",
      answers: { "BF1-C-001": 1 }
    });

    expect(submitAssessmentMock).toHaveBeenCalledWith("user_1", {
      instanceId: "instance-1",
      answers: { "BF1-C-001": 1 }
    });
  });
});
