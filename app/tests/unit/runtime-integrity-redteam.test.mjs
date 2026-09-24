import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { runtimeTaskForLesson, validateMachineVerification } from "../../src/data/runtimeVerification.ts";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function validEnvelope(task) {
  const results = task.steps.map((step, index) => {
    const stdout = `step-${index}-stdout`;
    const stderr = `step-${index}-stderr`;
    return {
      stepId: step.id,
      startedAt: `2026-09-24T10:00:${String(index * 5 + 1).padStart(2, "0")}.000Z`,
      completedAt: `2026-09-24T10:00:${String(index * 5 + 5).padStart(2, "0")}.000Z`,
      exitCode: 0,
      stdout,
      stderr,
      stdoutHash: sha256(stdout),
      stderrHash: sha256(stderr),
      result: "passed"
    };
  });

  return {
    schemaVersion: 1,
    taskId: task.taskId,
    contractVersion: task.contractVersion,
    lessonId: task.lessonId,
    platform: "linux",
    verificationLevel: "machine-verified",
    verificationSource: "local-runner",
    executionMode: "local-machine",
    target: { kind: "local" },
    runnerVersion: "0.2.0",
    environmentFingerprint: "fingerprint",
    startedAt: "2026-09-24T10:00:00.000Z",
    completedAt: "2026-09-24T10:01:00.000Z",
    stepResults: results,
    resetPerformed: true
  };
}

describe("machine verification red-team integrity", () => {
  it("accepts only hashes that match the captured stdout/stderr exactly", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    const result = await validateMachineVerification(task, envelope);
    expect(result.valid).toBe(true);
  });

  it("rejects tampered stdout when the old hash is retained", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults[0].stdout = "tampered";
    const result = await validateMachineVerification(task, envelope);
    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "stdoutHash does not match captured stdout for runtime step resolve-name."
    );
  });

  it("rejects fake hashes even when they have the correct 64-character shape", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults[0].stdoutHash = "a".repeat(64);
    envelope.stepResults[0].stderrHash = "b".repeat(64);
    const result = await validateMachineVerification(task, envelope);
    expect(result.valid).toBe(false);
  });

  it("rejects runtime step results presented in a different order", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults.reverse();
    const result = await validateMachineVerification(task, envelope);
    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Runtime step result order does not match the runtime task."
    );
  });

  it("rejects overlapping runtime steps when the runner contract is sequential", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults[1].startedAt = "2026-09-24T10:00:03.000Z";

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Runtime step test-https-port starts before the previous runtime step completed."
    );
  });

  it("rejects a result whose timestamps escape the envelope execution window", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults[0].completedAt = "2026-09-24T10:05:00.000Z";
    const result = await validateMachineVerification(task, envelope);
    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Runtime step resolve-name completedAt falls outside the envelope window."
    );
  });
});
