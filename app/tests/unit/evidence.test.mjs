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

const {
  addEvidence,
  clearEvidence,
  listEvidence,
  recordHandsOnEvidence,
  recordMachineVerification
} = await import("../../src/data/evidence.ts");
const { runtimeTaskForLesson } = await import("../../src/data/runtimeVerification.ts");

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

  it("records only a validated machine-verification envelope", () => {
    const task = runtimeTaskForLesson("B1.2");
    const validHash = "a".repeat(64);
    const invalid = recordMachineVerification({
      course: "beginner",
      projectId: "B1",
      task: task!,
      envelope: {
        schemaVersion: 1,
        taskId: task!.taskId,
        contractVersion: task!.contractVersion,
        lessonId: task!.lessonId,
        platform: "linux",
        verificationLevel: "machine-verified",
        verificationSource: "local-runner",
        executionMode: "local-machine",
        target: { kind: "local" },
        runnerVersion: "0.1.0",
        environmentFingerprint: "fingerprint",
        startedAt: "2026-09-24T10:00:00.000Z",
        completedAt: "2026-09-24T10:01:00.000Z",
        stepResults: [],
        resetPerformed: true
      },
      summary: "invalid machine evidence"
    });

    expect(invalid.recorded).toBe(false);
    expect(listEvidence("B1")).toHaveLength(0);

    const valid = recordMachineVerification({
      course: "beginner",
      projectId: "B1",
      task: task!,
      envelope: {
        schemaVersion: 1,
        taskId: task!.taskId,
        contractVersion: task!.contractVersion,
        lessonId: task!.lessonId,
        platform: "linux",
        verificationLevel: "machine-verified",
        verificationSource: "local-runner",
        executionMode: "local-machine",
        target: { kind: "local" },
        runnerVersion: "0.1.0",
        environmentFingerprint: "fingerprint",
        startedAt: "2026-09-24T10:00:00.000Z",
        completedAt: "2026-09-24T10:01:00.000Z",
        stepResults: task!.steps.map((step, index) => ({
          stepId: step.id,
          startedAt: `2026-09-24T10:00:0${index}.000Z`,
          completedAt: `2026-09-24T10:00:1${index}.000Z`,
          exitCode: 0,
          stdout: "",
          stderr: "",
          stdoutHash: validHash,
          stderrHash: validHash,
          result: "passed"
        })),
        resetPerformed: true
      },
      summary: "valid machine evidence"
    });

    expect(valid.recorded).toBe(true);
    const [entry] = listEvidence("B1");
    expect(entry.verificationLevel).toBe("machine-verified");
    expect(entry.verificationScope).toBe("probe");
    expect(entry.evidencePayload?.verificationSource).toBe("local-runner");
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
