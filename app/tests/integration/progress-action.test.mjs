import { beforeEach, describe, expect, it, vi } from "vitest";

const currentUserMock = vi.fn();
const completeForUserMock = vi.fn();
const masteryForUserMock = vi.fn();

vi.mock("../../src/lib/server/auth.ts", () => ({
  requireCurrentUser: currentUserMock
}));

vi.mock("../../src/lib/server/learningAuthority.ts", () => ({
  completeLearningItemForUser: completeForUserMock
}));

vi.mock("../../src/lib/server/progress.ts", () => ({
  recordMasteryAttemptForUser: vi.fn()
}));

vi.mock("../../src/lib/server/masteryAuthority.ts", () => ({
  recordAuthoritativeMasteryAttemptForUser: masteryForUserMock
}));

const {
  completeLearningItemAction,
  recordMasteryAttemptAction
} = await import("../../src/app/actions/progress.ts");

describe("completeLearningItemAction", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    completeForUserMock.mockReset();
    masteryForUserMock.mockReset();
  });

  it("fails closed when the request is unauthenticated", async () => {
    currentUserMock.mockRejectedValue(new Error("Authentication required."));

    await expect(
      completeLearningItemAction({
        itemType: "lesson",
        itemId: "B1.2"
      })
    ).rejects.toThrow("Authentication required.");

    expect(completeForUserMock).not.toHaveBeenCalled();
  });

  it("rejects browser-selected metadata before persistence", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_123",
      email: "alice@example.com"
    });

    await expect(
      completeLearningItemAction({
        itemId: "B1.2",
        itemType: "project",
        course: "advanced",
        projectId: "A3",
        learnerId: "attacker-chosen-id"
      })
    ).rejects.toThrow(/unsupported field/i);

    expect(completeForUserMock).not.toHaveBeenCalled();
  });

  it("propagates authority rejection without bypassing the authority service", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_456",
      email: "bob@example.com"
    });
    completeForUserMock.mockRejectedValue(new Error("Unknown learning item."));

    await expect(
      completeLearningItemAction({
        itemId: "attacker-controlled-id",
        evidenceRefs: ["evidence-1"]
      })
    ).rejects.toThrow(/unknown learning item/i);

    expect(completeForUserMock).toHaveBeenCalledWith("user_456", {
      itemId: "attacker-controlled-id",
      evidenceRefs: ["evidence-1"]
    });
  });

  it("rejects browser trust assertions rather than persisting them", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_789",
      email: "carol@example.com"
    });

    await expect(
      completeLearningItemAction({
        itemId: "B1.2",
        clientAssertions: { completed: true }
      })
    ).rejects.toThrow(/unsupported field/i);

    expect(completeForUserMock).not.toHaveBeenCalled();
  });

  it("accepts a minimal command and derives authoritative metadata", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_456",
      email: "bob@example.com"
    });
    completeForUserMock.mockResolvedValue({
      itemType: "lesson",
      itemId: "B1.2",
      completedAt: "2026-09-24T10:00:00.000Z",
      course: "beginner",
      projectId: "B1"
    });

    await completeLearningItemAction({
      itemId: "B1.2",
      evidenceRefs: ["evidence-1"]
    });

    expect(completeForUserMock).toHaveBeenCalledWith("user_456", {
      itemId: "B1.2",
      evidenceRefs: ["evidence-1"]
    });
  });

  it("rejects a browser-supplied verification level", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_789",
      email: "carol@example.com"
    });

    await expect(
      completeLearningItemAction({
        itemId: "B1.2",
        verificationLevel: "machine-verified"
      })
    ).rejects.toThrow(/unsupported field/i);

    expect(completeForUserMock).not.toHaveBeenCalled();
  });


  it("does not trust a browser mastery outcome or task identity", async () => {
    currentUserMock.mockResolvedValue({ id: "user_999" });

    await expect(
      recordMasteryAttemptAction({
        itemId: "B1.2",
        taskId: "attacker-task",
        outcome: "mastered",
        stage: "foundation-reteach",
        summary: "forged"
      })
    ).rejects.toThrow(/unsupported field/i);

    expect(masteryForUserMock).not.toHaveBeenCalled();
  });

  it("binds mastery recording to the authenticated learner and parsed command", async () => {
    currentUserMock.mockResolvedValue({ id: "user_999" });
    masteryForUserMock.mockResolvedValue({
      id: "mastery-1",
      lessonId: "B1.2",
      taskId: "hands-on-B1.2",
      attemptNumber: 1,
      outcome: "failure",
      stage: "foundation-reteach",
      summary: "retry",
      createdAt: "2026-09-26T12:00:00.000Z"
    });

    await recordMasteryAttemptAction({
      itemId: "B1.2",
      stage: "foundation-reteach",
      summary: "retry",
      evidenceRefs: []
    });

    expect(masteryForUserMock).toHaveBeenCalledWith("user_999", {
      itemId: "B1.2",
      stage: "foundation-reteach",
      summary: "retry",
      evidenceRefs: []
    });
  });


});
