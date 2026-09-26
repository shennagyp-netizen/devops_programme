import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, selectMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  selectMock: vi.fn()
}));

vi.mock("../../src/lib/server/db.ts", () => ({
  getDb: getDbMock
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn(() => "and"),
  asc: vi.fn(() => "asc"),
  desc: vi.fn(() => "desc"),
  eq: vi.fn(() => "eq")
}));

vi.mock("../../src/lib/server/schema.ts", () => ({
  learnerProgressHistory: {
    userId: "userId",
    verificationLevel: "verificationLevel",
    completedAt: "completedAt",
    itemType: "itemType",
    itemId: "itemId",
    id: "id"
  },
  learnerMasteryAttempts: {
    userId: "userId",
    taskId: "taskId",
    attemptNumber: "attemptNumber",
    lessonId: "lessonId",
    createdAt: "createdAt",
    id: "id"
  }
}));

const {
  listCompletionHistoryForUser,
  listMasteryHistoryForUser
} = await import("../../src/lib/server/progress.ts");

describe("authoritative progress reads", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([
        {
          id: "completion-1",
          itemType: "lesson",
          itemId: "B1.2",
          completedAt: new Date("2026-09-26T10:00:00.000Z"),
          verificationLevel: "authoritative-evidence",
          course: "beginner",
          projectId: "B1"
        }
      ])
    };

    selectMock.mockReturnValue(selectChain);
    getDbMock.mockReturnValue({
      select: selectMock
    });
  });

  it("returns only the server-authoritative completion projection", async () => {
    const result = await listCompletionHistoryForUser("user_123");

    expect(result).toEqual([
      {
        itemType: "lesson",
        itemId: "B1.2",
        completedAt: "2026-09-26T10:00:00.000Z",
        verificationLevel: "authoritative-evidence",
        course: "beginner",
        projectId: "B1"
      }
    ]);

    const whereCall = selectMock.mock.results[0].value.where.mock.calls[0][0];
    expect(whereCall).toBe("and");
  });

  it("fails closed for a missing authenticated user", async () => {
    await expect(listCompletionHistoryForUser("")).rejects.toThrow(
      "Authentication required."
    );

    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("retains mastery history as a separate server-owned projection", async () => {
    const masteryRows = [
      {
        id: "mastery-1",
        lessonId: "B1.2",
        taskId: "task-1",
        attemptNumber: 1,
        outcome: "failure",
        stage: "foundation-reteach",
        summary: "needs another explanation",
        createdAt: new Date("2026-09-26T10:01:00.000Z")
      }
    ];

    selectMock.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(masteryRows)
    });

    const result = await listMasteryHistoryForUser("user_123");

    expect(result[0]).toMatchObject({
      id: "mastery-1",
      attemptNumber: 1,
      outcome: "failure"
    });
  });
});
