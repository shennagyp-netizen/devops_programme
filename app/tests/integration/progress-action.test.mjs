import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const completeForUserMock = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({
  auth: authMock
}));

vi.mock("../../src/lib/server/progress.ts", () => ({
  completeLearningItemForUser: completeForUserMock
}));

const { completeLearningItemAction } = await import(
  "../../src/app/actions/progress.ts"
);

describe("completeLearningItemAction", () => {
  beforeEach(() => {
    authMock.mockReset();
    completeForUserMock.mockReset();
  });

  it("fails closed when the request is unauthenticated", async () => {
    authMock.mockResolvedValue({ userId: null });

    await expect(
      completeLearningItemAction({
        itemType: "lesson",
        itemId: "B1.2"
      })
    ).rejects.toThrow("Authentication required.");

    expect(completeForUserMock).not.toHaveBeenCalled();
  });

  it("uses the authenticated Clerk user and never accepts a browser learner id", async () => {
    authMock.mockResolvedValue({ userId: "user_123" });
    completeForUserMock.mockResolvedValue({
      itemType: "lesson",
      itemId: "B1.2",
      completedAt: "2026-09-24T10:00:00.000Z"
    });

    await completeLearningItemAction({
      itemType: "lesson",
      itemId: "B1.2",
      learnerId: "attacker-chosen-id"
    });

    expect(completeForUserMock).toHaveBeenCalledWith("user_123", {
      itemType: "lesson",
      itemId: "B1.2"
    });
  });

  it("forwards only the completion contract to the authenticated service", async () => {
    authMock.mockResolvedValue({ userId: "user_456" });
    completeForUserMock.mockResolvedValue({
      itemType: "assignment",
      itemId: "I1",
      completedAt: "2026-09-24T10:00:00.000Z"
    });

    await completeLearningItemAction({
      itemType: "assignment",
      itemId: "I1",
      course: "intermediate",
      projectId: "I1",
      verificationLevel: "exercise-validated",
      stdout: "secret terminal output"
    });

    expect(completeForUserMock).toHaveBeenCalledWith("user_456", {
      itemType: "assignment",
      itemId: "I1",
      course: "intermediate",
      projectId: "I1",
      verificationLevel: "exercise-validated"
    });
  });
});
