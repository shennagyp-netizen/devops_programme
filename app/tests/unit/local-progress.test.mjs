import { beforeEach, describe, expect, it } from "vitest";
import { completeLocalLearningItem, readLocalCompletionHistory } from "../../src/data/localProgress.ts";

function installStorage() {
  const map = new Map();
  globalThis.localStorage = {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    clear: () => map.clear(),
    key: (index) => [...map.keys()][index] ?? null,
    get length() { return map.size; }
  };
}

describe("browser-local MVP progress", () => {
  beforeEach(() => installStorage());

  it("starts empty without an identity", () => {
    expect(readLocalCompletionHistory()).toEqual([]);
  });

  it("records structured completion without a learner identity", () => {
    const record = completeLocalLearningItem({
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1"
    });

    expect(record.verificationLevel).toBe("structured");
    expect(record.itemType).toBe("lesson");
    expect(record).not.toHaveProperty("userId");
    expect(record).not.toHaveProperty("learnerId");
    expect(readLocalCompletionHistory()).toHaveLength(1);
  });

  it("is idempotent for the same lesson", () => {
    const first = completeLocalLearningItem({ itemId: "B1.2" });
    const second = completeLocalLearningItem({ itemId: "B1.2" });

    expect(second).toEqual(first);
    expect(readLocalCompletionHistory()).toHaveLength(1);
  });
});
