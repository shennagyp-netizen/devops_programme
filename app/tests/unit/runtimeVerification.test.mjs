import { describe, expect, it } from "vitest";
import {
  runtimeTaskForLesson,
  validateMachineVerification
} from "../../src/data/runtimeVerification.ts";

describe("machine verification contract", () => {
  it("resolves the runner-ready B1.2 task", () => {
    const task = runtimeTaskForLesson("B1.2");

    expect(task).toBeDefined();
    expect(task.taskId).toBe("runtime-probe-B1.2");
    expect(task.verificationLevel).toBe("machine-verified");
    expect(task.steps.map((step) => step.id)).toEqual([
      "resolve-name",
      "test-https-port"
    ]);
    expect(task.steps.every((step) => step.required)).toBe(true);
  });

  it("fails closed when the envelope identifies another task", () => {
    const task = runtimeTaskForLesson("B1.2");
    const result = validateMachineVerification(task, {
      schemaVersion: 1,
      taskId: "wrong-task",
      lessonId: "B1.2",
      platform: "linux",
      verificationLevel: "machine-verified",
      verificationSource: "local-runner",
      runnerVersion: "0.1.0",
      environmentFingerprint: "fingerprint",
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:01:00.000Z",
      stepResults: [],
      resetPerformed: true
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain("Envelope taskId does not match the runtime task.");
  });

  it("fails closed when a required step is missing", () => {
    const task = runtimeTaskForLesson("B1.2");
    const result = validateMachineVerification(task, {
      schemaVersion: 1,
      taskId: task.taskId,
      lessonId: task.lessonId,
      platform: "linux",
      verificationLevel: "machine-verified",
      verificationSource: "local-runner",
      runnerVersion: "0.1.0",
      environmentFingerprint: "fingerprint",
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:01:00.000Z",
      stepResults: [
        {
          stepId: "resolve-name",
          startedAt: "2026-09-24T10:00:01.000Z",
          completedAt: "2026-09-24T10:00:02.000Z",
          exitCode: 0,
          stdoutHash: "stdout",
          stderrHash: "stderr",
          result: "passed"
        }
      ],
      resetPerformed: true
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain("Required runtime step is missing: test-https-port");
  });

  it("fails closed on a contract-version mismatch", () => {
    const task = runtimeTaskForLesson("B1.2");
    const result = validateMachineVerification(task, {
      schemaVersion: 1,
      taskId: task.taskId,
      contractVersion: task.contractVersion + 1,
      lessonId: task.lessonId,
      platform: "linux",
      verificationLevel: "machine-verified",
      verificationSource: "local-runner",
      runnerVersion: "0.1.0",
      environmentFingerprint: "fingerprint",
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:01:00.000Z",
      stepResults: [],
      resetPerformed: true
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Envelope contractVersion does not match the runtime task."
    );
  });

  it("fails closed on duplicate and unknown step results", () => {
    const task = runtimeTaskForLesson("B1.2");
    const validHash = "a".repeat(64);
    const result = validateMachineVerification(task, {
      schemaVersion: 1,
      taskId: task.taskId,
      contractVersion: task.contractVersion,
      lessonId: task.lessonId,
      platform: "linux",
      verificationLevel: "machine-verified",
      verificationSource: "local-runner",
      runnerVersion: "0.1.0",
      environmentFingerprint: "fingerprint",
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:01:00.000Z",
      stepResults: [
        {
          stepId: "resolve-name",
          startedAt: "2026-09-24T10:00:01.000Z",
          completedAt: "2026-09-24T10:00:02.000Z",
          exitCode: 0,
          stdoutHash: validHash,
          stderrHash: validHash,
          result: "passed"
        },
        {
          stepId: "resolve-name",
          startedAt: "2026-09-24T10:00:01.000Z",
          completedAt: "2026-09-24T10:00:02.000Z",
          exitCode: 0,
          stdoutHash: validHash,
          stderrHash: validHash,
          result: "passed"
        },
        {
          stepId: "not-in-catalog",
          startedAt: "2026-09-24T10:00:01.000Z",
          completedAt: "2026-09-24T10:00:02.000Z",
          exitCode: 0,
          stdoutHash: validHash,
          stderrHash: validHash,
          result: "passed"
        }
      ],
      resetPerformed: true
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain("Duplicate runtime step result: resolve-name");
    expect(result.failures).toContain("Unknown runtime step result: not-in-catalog");
  });

  it("fails closed when a step reports success with a non-zero exit code or invalid hashes", () => {
    const task = runtimeTaskForLesson("B1.2");
    const invalid = validateMachineVerification(task, {
      schemaVersion: 1,
      taskId: task.taskId,
      contractVersion: task.contractVersion,
      lessonId: task.lessonId,
      platform: "linux",
      verificationLevel: "machine-verified",
      verificationSource: "local-runner",
      runnerVersion: "0.1.0",
      environmentFingerprint: "fingerprint",
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:01:00.000Z",
      stepResults: [
        {
          stepId: "resolve-name",
          startedAt: "2026-09-24T10:00:02.000Z",
          completedAt: "2026-09-24T10:00:01.000Z",
          exitCode: 1,
          stdoutHash: "",
          stderrHash: "",
          result: "passed"
        },
        {
          stepId: "test-https-port",
          startedAt: "2026-09-24T10:00:03.000Z",
          completedAt: "2026-09-24T10:00:04.000Z",
          exitCode: 0,
          stdoutHash: "b".repeat(64),
          stderrHash: "b".repeat(64),
          result: "passed"
        }
      ],
      resetPerformed: true
    });

    expect(invalid.valid).toBe(false);
    expect(invalid.failures).toContain(
      "Runtime step resolve-name completedAt precedes startedAt."
    );
    expect(invalid.failures).toContain(
      "Output hashes are missing for runtime step resolve-name."
    );
    expect(invalid.failures).toContain(
      "Runtime step resolve-name is marked passed with a non-zero exit code."
    );
  });

  it("fails closed when no runtime task exists", () => {
    const result = validateMachineVerification(undefined, {
      schemaVersion: 1,
      taskId: "missing",
      contractVersion: 1,
      lessonId: "missing",
      platform: "linux",
      verificationLevel: "machine-verified",
      verificationSource: "local-runner",
      runnerVersion: "0.1.0",
      environmentFingerprint: "fingerprint",
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:01:00.000Z",
      stepResults: [],
      resetPerformed: true
    });

    expect(result).toEqual({
      valid: false,
      failures: ["Runtime task is not defined."]
    });
  });

  it("fails closed when a completed step uses a nonzero exit code", () => {
    const task = runtimeTaskForLesson("B1.2");
    const validHash = "e".repeat(64);
    const result = validateMachineVerification(task, {
      schemaVersion: 1,
      taskId: task.taskId,
      contractVersion: task.contractVersion,
      lessonId: task.lessonId,
      platform: "linux",
      verificationLevel: "machine-verified",
      verificationSource: "local-runner",
      runnerVersion: "0.1.0",
      environmentFingerprint: "fingerprint",
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:01:00.000Z",
      stepResults: task.steps.map((step, index) => ({
        stepId: step.id,
        startedAt: `2026-09-24T10:00:0${index}.000Z`,
        completedAt: `2026-09-24T10:00:1${index}.000Z`,
        exitCode: index === 0 ? 1 : 0,
        stdoutHash: validHash,
        stderrHash: validHash,
        result: index === 0 ? "failed" : "passed"
      })),
      resetPerformed: true
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Runtime step resolve-name did not pass."
    );
  });

  it("accepts a complete machine-verified envelope", () => {
    const task = runtimeTaskForLesson("B1.2");
    const results = task.steps.map((step, index) => ({
      stepId: step.id,
      startedAt: `2026-09-24T10:00:0${index}.000Z`,
      completedAt: `2026-09-24T10:00:1${index}.000Z`,
      exitCode: 0,
      stdoutHash: "c".repeat(64),
      stderrHash: "d".repeat(64),
      result: "passed"
    }));

    const result = validateMachineVerification(task, {
      schemaVersion: 1,
      taskId: task.taskId,
      lessonId: task.lessonId,
      platform: "linux",
      verificationLevel: "machine-verified",
      verificationSource: "local-runner",
      runnerVersion: "0.1.0",
      environmentFingerprint: "fingerprint",
      startedAt: "2026-09-24T10:00:00.000Z",
      completedAt: "2026-09-24T10:02:00.000Z",
      stepResults: results,
      resetPerformed: true
    });

    expect(result.valid).toBe(true);
  });
});
