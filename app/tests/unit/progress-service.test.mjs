import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, insertMock, selectMock, resolveLearningItemMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  resolveLearningItemMock: vi.fn()
}));

vi.mock("../../src/lib/server/db.ts", () => ({
  getDb: getDbMock
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn(() => "and"),
  asc: vi.fn(() => "asc"),
  eq: vi.fn(() => "eq")
}));

vi.mock("../../src/lib/server/learning-item-catalog.ts", () => ({
  resolveLearningItem: resolveLearningItemMock
}));

vi.mock("../../src/lib/server/schema.ts", () => ({
  learnerProgressHistory: {
    userId: "userId",
    itemType: "itemType",
    itemId: "itemId",
    course: "course",
    projectId: "projectId",
    verificationLevel: "verificationLevel",
    completedAt: "completedAt",
    id: "id"
  }
}));

const { completeLearningItemForUser } = await import(
  "../../src/lib/server/progress.ts"
);

describe("progress persistence service", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    resolveLearningItemMock.mockReturnValue({
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1"
    });

    const writeChain = {
      values: vi.fn().mockReturnThis(),
      onConflictDoNothing: vi.fn().mockResolvedValue([])
    };

    insertMock.mockReturnValue(writeChain);

    const row = {
      itemType: "lesson",
      itemId: "B1.2",
      completedAt: new Date("2026-09-24T10:00:00.000Z"),
      verificationLevel: "self-report",
      course: "beginner",
      projectId: "B1",
      id: "00000000-0000-0000-0000-000000000001"
    };

    const selectChain = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([row])
    };

    selectMock.mockReturnValue(selectChain);
    getDbMock.mockReturnValue({
      insert: insertMock,
      select: selectMock
    });
  });

  it("binds persistence to the authenticated user", async () => {
    await completeLearningItemForUser("user_123", {
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1",
      verificationLevel: "exercise-validated",
      stdout: "must not persist"
    });

    const values = insertMock.mock.results[0].value.values.mock.calls[0][0];

    expect(values.userId).toBe("user_123");
    expect(values.itemType).toBe("lesson");
    expect(values.itemId).toBe("B1.2");
    expect(values.course).toBe("beginner");
    expect(values.projectId).toBe("B1");
    expect(values.verificationLevel).toBe("self-report");
    expect(values.learnerId).toBeUndefined();
    expect(values.stdout).toBeUndefined();
    expect(values.stderr).toBeUndefined();
  });

  it("rejects a browser-supplied metadata mismatch instead of persisting it", async () => {
    resolveLearningItemMock.mockReturnValue({
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1"
    });

    await completeLearningItemForUser("user_123", {
      itemType: "lesson",
      itemId: "B1.2",
      course: "advanced",
      projectId: "A3",
      verificationLevel: "machine-verified"
    });

    const values = insertMock.mock.results[0].value.values.mock.calls[0][0];
    expect(values.course).toBe("beginner");
    expect(values.projectId).toBe("B1");
    expect(values.verificationLevel).toBe("self-report");
  });

  it("rejects an item the canonical server catalog cannot resolve", async () => {
    resolveLearningItemMock.mockImplementation(() => {
      throw new Error("Learning item does not exist.");
    });

    await expect(
      completeLearningItemForUser("user_123", {
        itemType: "lesson",
        itemId: "B1.999"
      })
    ).rejects.toThrow("Learning item does not exist.");

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("uses conflict-ignore semantics so completion is append-once", async () => {
    await completeLearningItemForUser("user_123", {
      itemType: "lesson",
      itemId: "B1.2"
    });

    const writeChain = insertMock.mock.results[0].value;
    expect(writeChain.onConflictDoNothing).toHaveBeenCalledTimes(1);

    const target = writeChain.onConflictDoNothing.mock.calls[0][0].target;
    expect(target).toEqual(["userId", "itemType", "itemId"]);
  });

  it("returns the stored server completion time", async () => {
    const result = await completeLearningItemForUser("user_123", {
      itemType: "lesson",
      itemId: "B1.2"
    });

    expect(result.completedAt).toBe("2026-09-24T10:00:00.000Z");
  });

  it("fails closed for a missing authenticated user", async () => {
    await expect(
      completeLearningItemForUser("", {
        itemType: "lesson",
        itemId: "B1.2"
      })
    ).rejects.toThrow("Authentication required.");

    expect(getDbMock).not.toHaveBeenCalled();
  });
});
