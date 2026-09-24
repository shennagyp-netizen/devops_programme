import { generateKeyPairSync, sign } from "node:crypto";
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
const {
  buildMachineAttestationPayload,
  runtimeTaskForLesson
} = await import("../../src/data/runtimeVerification.ts");

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

  it("forces manual evidence to structured verification", () => {
    recordHandsOnEvidence({
      course: "beginner",
      projectId: "B1",
      lessonId: "B1.2",
      summary: "machine evidence",
      evidencePayload: {
        observation: "resolved",
        change: "none",
        failure: "none",
        recovery: "verified"
      }
    });

    const [entry] = listEvidence("B1");
    expect(entry.taskId).toBe("hands-on-B1.2");
    expect(entry.verificationLevel).toBe("structured");
    expect(entry.evidencePayload.recovery).toBe("verified");
  });

  it("rejects a forged runtime task even when its envelope looks valid", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const forgedTask = {
      ...task!,
      taskId: "runtime-probe-forged",
      steps: task!.steps.map((step) => ({ ...step }))
    };

    const result = await recordMachineVerification({
      task: forgedTask,
      envelope: {
        schemaVersion: 1,
        taskId: forgedTask.taskId,
        contractVersion: forgedTask.contractVersion,
        lessonId: forgedTask.lessonId,
        platform: "linux",
        verificationLevel: "machine-verified",
        verificationSource: "local-runner",
        executionMode: "local-machine",
        target: { kind: "local" },
        runnerVersion: "0.2.0",
        environmentFingerprint: "fingerprint",
        startedAt: "2026-09-24T10:00:00.000Z",
        completedAt: "2026-09-24T10:01:00.000Z",
        stepResults: [],
        resetPerformed: true
      },
      summary: "forged runtime task",
      source: "imported-file"
    });

    expect(result.recorded).toBe(false);
    expect(result.failures).toContain(
      "Runtime task is not the canonical published task for this lesson."
    );
  });

  it("does not trust a local-agent source without attestation", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const emptySha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    const result = await recordMachineVerification({
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
        runnerVersion: "0.2.0",
        environmentFingerprint: "fingerprint",
        challenge: "fresh-challenge",
        startedAt: "2026-09-24T10:00:00.000Z",
        completedAt: "2026-09-24T10:01:00.000Z",
        stepResults: task!.steps.map((step, index) => ({
          stepId: step.id,
          startedAt: `2026-09-24T10:00:${String(index * 5 + 1).padStart(2, "0")}.000Z`,
          completedAt: `2026-09-24T10:00:${String(index * 5 + 5).padStart(2, "0")}.000Z`,
          exitCode: 0,
          stdout: "",
          stderr: "",
          stdoutHash: emptySha,
          stderrHash: emptySha,
          result: "passed"
        })),
        resetPerformed: true
      },
      summary: "unattested local evidence",
      source: "local-agent",
      expectedChallenge: "fresh-challenge"
    });

    expect(result.recorded).toBe(false);
    expect(listEvidence("B1")).toHaveLength(0);
  });

  it("records only a validated machine-verification envelope", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const emptySha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    const invalid = await recordMachineVerification({
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
      summary: "invalid machine evidence",
      source: "local-agent"
    });

    expect(invalid.recorded).toBe(false);
    expect(listEvidence("B1")).toHaveLength(0);

    const challenge = "a".repeat(64);
    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    const validPublicKey = publicKey
      .export({ type: "spki", format: "der" })
      .toString("base64url");

    const validEnvelope = {
      schemaVersion: 1,
      taskId: task!.taskId,
      contractVersion: task!.contractVersion,
      lessonId: task!.lessonId,
      platform: "linux",
      verificationLevel: "machine-verified" as const,
      verificationSource: "local-runner" as const,
      executionMode: "local-machine" as const,
      target: { kind: "local" as const },
      runnerVersion: "0.2.0",
      environmentFingerprint: "fingerprint",
      challenge,
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:01:00.000Z",
      stepResults: task!.steps.map((step, index) => ({
        stepId: step.id,
        startedAt: `2026-09-24T10:00:${String(index * 5 + 1).padStart(2, "0")}.000Z`,
        completedAt: `2026-09-24T10:00:${String(index * 5 + 5).padStart(2, "0")}.000Z`,
        exitCode: 0,
        stdout: "",
        stderr: "",
        stdoutHash: emptySha,
        stderrHash: emptySha,
        result: "passed" as const
      })),
      resetPerformed: true
    };

    validEnvelope.attestation = {
      algorithm: "Ed25519" as const,
      publicKey: validPublicKey,
      signature: sign(
        null,
        Buffer.from(buildMachineAttestationPayload(validEnvelope), "utf8"),
        privateKey
      ).toString("base64url")
    };

    const valid = await recordMachineVerification({
      course: "beginner",
      projectId: "B1",
      task: task!,
      envelope: validEnvelope,
      summary: "valid machine evidence",
      source: "local-agent",
      expectedChallenge: challenge,
      expectedAttestationPublicKey: validPublicKey
    });

    expect(valid.recorded).toBe(true);
    expect(valid.trustedForCompletion).toBe(true);
    const [entry] = listEvidence("B1");
    expect(entry.verificationLevel).toBe("machine-verified");
    expect(entry.verificationScope).toBe("probe");
    expect(entry.evidencePayload?.verificationSource).toBe("local-runner");
    expect(entry.evidencePayload?.trust).toBe("local-direct");
  });

  it("preserves SSH execution identity without trusting imported files", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const okSha = "2689367b205c16ce32ed4200942b8b8b1e262dfc70d9bc9fbc77c49699a4f1df";
    const emptySha = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

    const result = await recordMachineVerification({
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
        verificationSource: "ssh-runner",
        executionMode: "remote-machine",
        target: {
          kind: "ssh",
          host: "training.example",
          port: 22,
          user: "student",
          hostKeyPolicy: "strict-known-hosts"
        },
        runnerVersion: "0.1.0",
        environmentFingerprint: "fingerprint",
        startedAt: "2026-09-24T10:00:00.000Z",
        completedAt: "2026-09-24T10:01:00.000Z",
        stepResults: task!.steps.map((step, index) => ({
          stepId: step.id,
          startedAt: `2026-09-24T10:00:${String(index * 5 + 1).padStart(2, "0")}.000Z`,
          completedAt: `2026-09-24T10:00:${String(index * 5 + 5).padStart(2, "0")}.000Z`,
          exitCode: 0,
          stdout: "ok",
          stderr: "",
          stdoutHash: okSha,
          stderrHash: emptySha,
          result: "passed"
        })),
        resetPerformed: true
      },
      summary: "ssh verified evidence",
      source: "imported-file"
    });

    expect(result.recorded).toBe(true);
    expect(result.trustedForCompletion).toBe(false);
    const [entry] = listEvidence("B1");
    expect(entry.verificationLevel).toBe("structured");
    expect(entry.verificationScope).toBe("probe");
    expect(entry.evidencePayload?.verificationSource).toBe("ssh-runner");
    expect(entry.evidencePayload?.evidenceSource).toBe("imported-file");
    expect(entry.evidencePayload?.trust).toBe("imported-untrusted");
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
