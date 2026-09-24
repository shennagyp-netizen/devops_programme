import { beforeEach, describe, expect, it, vi } from "vitest";

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

const storage = new MemoryStorage();
globalThis.localStorage = storage;

const fetchMock = vi.fn();
globalThis.fetch = fetchMock;

const {
  completeLearningItem,
  getLearnerId,
  listCompletionHistory
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

  it("migrates legacy local lesson completion into the database", async () => {
    storage.setItem("devops-programme-mastered", JSON.stringify(["B1.2"]));

    fetchMock
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        })
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            completed: true,
            item: {
              itemType: "lesson",
              itemId: "B1.2",
              completedAt: "2026-09-24T10:00:00.000Z"
            }
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      )
      .mockResolvedValueOnce(
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

    const result = await listCompletionHistory();

    expect(result[0].itemId).toBe("B1.2");
    expect(storage.getItem("devops-programme-mastered")).toBeNull();
  });

  it("returns completion history in the order supplied by the server", async () => {
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

    const init = fetchMock.mock.calls[0][1];
    const body = JSON.parse(String(init.body));
    expect(body.itemType).toBe("assignment");
    expect(body.itemId).toBe("B1-project");
    expect(body.verificationLevel).toBe("machine-verified");
    expect(body.stdout).toBeUndefined();
    expect(body.stderr).toBeUndefined();
  });

  it("records an item without storing attempt details", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          completed: true,
          item: {
            itemType: "question",
            itemId: "IF1-C-006",
            completedAt: "2026-09-24T10:00:00.000Z"
          }
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await completeLearningItem({
      itemType: "question",
      itemId: "IF1-C-006",
      course: "intermediate"
    });

    const body = JSON.parse(String(fetchMock.mock.calls[0][1].body));
    expect(body.itemType).toBe("question");
    expect(body.itemId).toBe("IF1-C-006");
    expect(body.completedAt).toBeUndefined();
    expect(body.stdout).toBeUndefined();
    expect(body.stderr).toBeUndefined();
    expect(body.attempt).toBeUndefined();
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
