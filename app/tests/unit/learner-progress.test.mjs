import { beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  clear() {
    this.values.clear();
  }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage as Storage;

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as typeof fetch;

const {
  completeLearningItem,
  getLearnerId,
  listCompletedItems,
  uncompleteLearningItem
} = await import("../../src/data/learnerProgress.ts");

describe("learner progress client", () => {
  beforeEach(() => {
    storage.clear();
    fetchMock.mockReset();
  });

  it("creates one stable anonymous learner id", () => {
    const first = getLearnerId();
    const second = getLearnerId();

    expect(first).toBeTruthy();
    expect(second).toBe(first);
  });

  it("loads only completion state from the server", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          items: [
            {
              itemType: "lesson",
              itemId: "B1.2",
              completedAt: "2026-09-24T10:00:00.000Z"
            }
          ]
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await listCompletedItems();

    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe("B1.2");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("/api/progress?learnerId=");
  });

  it("marks an item complete without sending terminal output", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          completed: true,
          item: {
            itemType: "assignment",
            itemId: "B1-project",
            completedAt: "2026-09-24T10:00:00.000Z"
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await completeLearningItem({
      itemType: "assignment",
      itemId: "B1-project",
      course: "beginner",
      projectId: "B1",
      verificationLevel: "machine-verified"
    });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(String(init.body));
    expect(body.itemType).toBe("assignment");
    expect(body.itemId).toBe("B1-project");
    expect(body.verificationLevel).toBe("machine-verified");
    expect(body.stdout).toBeUndefined();
    expect(body.stderr).toBeUndefined();
  });

  it("can mark a question incomplete", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ completed: false }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );

    await uncompleteLearningItem({
      itemType: "question",
      itemId: "IF1-C-006"
    });

    const url = String(fetchMock.mock.calls[0][0]);
    expect(url).toContain("itemType=question");
    expect(url).toContain("itemId=IF1-C-006");
  });

  it("fails closed when the progress API rejects a write", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({ error: "Database unavailable." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      )
    );

    await expect(
      completeLearningItem({
        itemType: "lesson",
        itemId: "B1.2"
      })
    ).rejects.toThrow("Database unavailable.");
  });
});
