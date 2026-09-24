import { describe, expect, it } from "vitest";
import {
  runtimeTaskForLesson,
  validateMachineVerification
} from "../../src/data/runtimeVerification.ts";

describe("machine verification contract", () => {
  it("resolves the runner-ready B1.2 task", () => {
    const task = runtimeTaskForLesson("B1.2");

    expect(task).toBeDefined();
    expect(task.taskId).toBe("hands-on-B1.2");
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

  it("accepts a complete machine-verified envelope", () => {
    const task = runtimeTaskForLesson("B1.2");
    const results = task.steps.map((step, index) => ({
      stepId: step.id,
      startedAt: `2026-09-24T10:00:0${index}.000Z`,
      completedAt: `2026-09-24T10:00:1${index}.000Z`,
      exitCode: 0,
      stdoutHash: `stdout-${step.id}`,
      stderrHash: `stderr-${step.id}`,
      result: "passed"
    }));

    const result = validateMachineVerification(task, {
      schemaVersion: 1,
      taskId: task.taskId,
      lessonId: task.lessonId,
      platform: "linux",
      verificationLevel: "machine-verified",
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
