import { beforeEach, describe, expect, it } from "vitest";

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }
  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
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

const { addEvidence, clearEvidence, listEvidence, recordHandsOnEvidence } =
  await import("../../src/data/evidence.ts");

describe("evidence ledger", () => {
  beforeEach(() => {
    storage.clear();
  });

  it("stores evidence and lists it by project", () => {
    const entry = addEvidence({
      course: "beginner",
      projectId: "B1",
      lessonId: "B1.2",
      kind: "exercise",
      summary: "request path evidence"
    });

    expect(listEvidence("B1")).toHaveLength(1);
    expect(listEvidence("B2")).toHaveLength(0);
    expect(entry.projectId).toBe("B1");
  });

  it("is idempotent for identical evidence", () => {
    const input = {
      course: "beginner",
      projectId: "B1",
      lessonId: "B1.2",
      kind: "exercise",
      summary: "same evidence"
    };

    const first = addEvidence(input);
    const second = addEvidence(input);

    expect(second.id).toBe(first.id);
    expect(listEvidence("B1")).toHaveLength(1);
  });

  it("preserves machine verification metadata", () => {
    recordHandsOnEvidence({
      course: "beginner",
      projectId: "B1",
      lessonId: "B1.2",
      taskId: "hands-on-B1.2",
      summary: "machine evidence",
      verificationLevel: "machine-verified",
      evidencePayload: {
        observation: "resolved",
        change: "none",
        failure: "none",
        recovery: "verified"
      }
    });

    const [entry] = listEvidence("B1");
    expect(entry.taskId).toBe("hands-on-B1.2");
    expect(entry.verificationLevel).toBe("machine-verified");
    expect(entry.evidencePayload.recovery).toBe("verified");
  });

  it("clears the ledger", () => {
    addEvidence({
      course: "advanced",
      projectId: "A1",
      kind: "design",
      summary: "capacity model"
    });

    clearEvidence();

    expect(listEvidence()).toEqual([]);
  });
});
