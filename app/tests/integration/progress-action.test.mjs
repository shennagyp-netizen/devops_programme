import { beforeEach, describe, expect, it, vi } from "vitest";

const currentUserMock = vi.fn();
const completeForUserMock = vi.fn();

vi.mock("../../src/lib/server/auth.ts", () => ({
  requireCurrentUser: currentUserMock
}));

vi.mock("../../src/lib/server/progress.ts", () => ({
  completeLearningItemForUser: completeForUserMock
}));

const { completeLearningItemAction } = await import(
  "../../src/app/actions/progress.ts"
);

describe("completeLearningItemAction", () => {
  beforeEach(() => {
    currentUserMock.mockReset();
    completeForUserMock.mockReset();
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

  it("derives programme metadata server-side instead of trusting browser metadata", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_123",
      email: "alice@example.com"
    });
    completeForUserMock.mockResolvedValue({
      itemType: "lesson",
      itemId: "B1.2",
      completedAt: "2026-09-24T10:00:00.000Z"
    });

    await completeLearningItemAction({
      itemId: "B1.2",
      itemType: "project",
      course: "advanced",
      projectId: "A3",
      verificationLevel: "machine-verified",
      learnerId: "attacker-chosen-id"
    });

    expect(completeForUserMock).toHaveBeenCalledWith("user_123", {
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1"
    });
  });

  it("rejects an unknown item before persistence", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_456",
      email: "bob@example.com"
    });

    await expect(
      completeLearningItemAction({ itemId: "attacker-controlled-id" })
    ).rejects.toThrow(/unknown learning item/i);

    expect(completeForUserMock).not.toHaveBeenCalled();
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

  it("forwards only authoritative metadata to the persistence service", async () => {
    currentUserMock.mockResolvedValue({
      id: "user_456",
      email: "bob@example.com"
    });
    completeForUserMock.mockResolvedValue({
      itemType: "assignment",
      itemId: "I1",
      completedAt: "2026-09-24T10:00:00.000Z"
    });

    await completeLearningItemAction({
      itemId: "I1",
      verificationLevel: "exercise-validated",
      stdout: "secret terminal output"
    });

    expect(completeForUserMock).toHaveBeenCalledWith("user_456", {
      itemType: "project",
      itemId: "I1",
      course: "intermediate",
      projectId: "I1"
    });
  });
});
