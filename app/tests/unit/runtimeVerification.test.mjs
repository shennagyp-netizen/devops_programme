import { createHash, generateKeyPairSync, sign } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildMachineAttestationPayload,
  runtimeTaskForLesson,
  validateMachineVerification
} from "../../src/data/runtimeVerification.ts";

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function validEnvelope(task) {
  const results = task.steps.map((step, index) => {
    const stdout = `output-${index}`;
    const stderr = `error-${index}`;

    return {
      stepId: step.id,
      startedAt: `2026-09-24T10:00:${String(index * 5 + 1).padStart(2, "0")}.000Z`,
      completedAt: `2026-09-24T10:00:${String(index * 5 + 5).padStart(2, "0")}.000Z`,
      exitCode: 0,
      stdout,
      stderr,
      stdoutHash: hash(stdout),
      stderrHash: hash(stderr),
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

  it("fails closed when the envelope identifies another task", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.taskId = "wrong-task";

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain("Envelope taskId does not match the runtime task.");
  });

  it("fails closed when a required step is missing", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults.pop();

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Envelope stepResults must contain exactly one result for every runtime step."
    );
    expect(result.failures).toContain(
      "Required runtime step is missing: test-https-port"
    );
  });

  it("fails closed on a contract-version mismatch", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.contractVersion += 1;

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Envelope contractVersion does not match the runtime task."
    );
  });

  it("fails closed on duplicate and unknown step results", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults = [
      envelope.stepResults[0],
      { ...envelope.stepResults[0] },
      {
        ...envelope.stepResults[1],
        stepId: "not-in-catalog"
      }
    ];

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain("Duplicate runtime step result: resolve-name");
    expect(result.failures).toContain("Unknown runtime step result: not-in-catalog");
  });

  it("fails closed when stdout or stderr hashes do not match captured output", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults[0].stdout = "tampered";

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "stdoutHash does not match captured stdout for runtime step resolve-name."
    );
  });

  it("fails closed on invalid hash encoding", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults[0].stdoutHash = "not-a-hash";
    envelope.stepResults[0].stderrHash = "also-not-a-hash";

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Output hashes are invalid for runtime step resolve-name."
    );
  });

  it("fails closed when step results are reordered", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults.reverse();

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Runtime step result order does not match the runtime task."
    );
  });

  it("fails closed when step timestamps escape the envelope", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults[0].completedAt = "2026-09-24T10:05:00.000Z";

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Runtime step resolve-name completedAt falls outside the envelope window."
    );
  });

  it("fails closed when a success result has a non-zero exit code", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.stepResults[0].exitCode = 1;

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Runtime step resolve-name is marked passed with a non-zero exit code."
    );
  });

  it("fails closed on an invalid verification source", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.verificationSource = "invalid-source";

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Envelope verificationSource is invalid."
    );
  });

  it("rejects the reserved managed-runner source until a real managed runner exists", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.verificationSource = "managed-runner";

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Managed runner verification is not available in this build."
    );
  });

  it("fails closed when local-runner evidence claims remote execution", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.executionMode = "remote-machine";

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Local runner evidence must declare local-machine executionMode."
    );
  });

  it("requires reset verification when the task contract requires it", async () => {
    const task = {
      ...runtimeTaskForLesson("B1.2"),
      resetRequired: true
    };
    const envelope = validEnvelope(task);
    envelope.resetPerformed = false;

    const result = await validateMachineVerification(task, envelope);

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Task requires reset verification, but resetPerformed is false."
    );
  });

  it("fails closed when no runtime task exists", async () => {
    const result = await validateMachineVerification(undefined, {
      schemaVersion: 1,
      taskId: "missing",
      contractVersion: 1,
      lessonId: "missing",
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
    });

    expect(result).toEqual({
      valid: false,
      failures: ["Runtime task is not defined."]
    });
  });

  it("rejects local-agent verification without a cryptographic attestation", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.challenge = "fresh-challenge";

    const result = await validateMachineVerification(task, envelope, {
      requireAttestation: true,
      expectedChallenge: "fresh-challenge"
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Local agent evidence requires a cryptographic attestation."
    );
  });

  it("accepts a valid Ed25519 local-agent attestation", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.challenge = "fresh-challenge";

    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    const publicKeyBase64 = publicKey
      .export({ type: "spki", format: "der" })
      .toString("base64url");

    envelope.attestation = {
      algorithm: "Ed25519",
      publicKey: publicKeyBase64,
      signature: sign(
        null,
        Buffer.from(buildMachineAttestationPayload(envelope), "utf8"),
        privateKey
      ).toString("base64url")
    };

    const result = await validateMachineVerification(task, envelope, {
      requireAttestation: true,
      expectedChallenge: "fresh-challenge"
    });

    expect(result.valid).toBe(true);
  });

  it("rejects a signed envelope from an agent public key that is not the paired key", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.challenge = "fresh-challenge";

    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    envelope.attestation = {
      algorithm: "Ed25519",
      publicKey: publicKey
        .export({ type: "spki", format: "der" })
        .toString("base64url"),
      signature: sign(
        null,
        Buffer.from(buildMachineAttestationPayload(envelope), "utf8"),
        privateKey
      ).toString("base64url")
    };

    const result = await validateMachineVerification(task, envelope, {
      requireAttestation: true,
      expectedChallenge: "fresh-challenge",
      expectedAttestationPublicKey: "different-agent-key"
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Local agent attestation public key does not match the paired agent."
    );
  });

  it("rejects a locally-attested envelope after output tampering", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.challenge = "fresh-challenge";

    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    envelope.attestation = {
      algorithm: "Ed25519",
      publicKey: publicKey
        .export({ type: "spki", format: "der" })
        .toString("base64url"),
      signature: sign(
        null,
        Buffer.from(buildMachineAttestationPayload(envelope), "utf8"),
        privateKey
      ).toString("base64url")
    };

    envelope.stepResults[0].stdout = "tampered-after-signing";

    const result = await validateMachineVerification(task, envelope, {
      requireAttestation: true,
      expectedChallenge: "fresh-challenge"
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Local agent attestation signature is invalid."
    );
  });

  it("rejects a validly signed envelope replayed with a different challenge", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const envelope = validEnvelope(task);
    envelope.challenge = "original-challenge";

    const { publicKey, privateKey } = generateKeyPairSync("ed25519");
    envelope.attestation = {
      algorithm: "Ed25519",
      publicKey: publicKey
        .export({ type: "spki", format: "der" })
        .toString("base64url"),
      signature: sign(
        null,
        Buffer.from(buildMachineAttestationPayload(envelope), "utf8"),
        privateKey
      ).toString("base64url")
    };

    const result = await validateMachineVerification(task, envelope, {
      requireAttestation: true,
      expectedChallenge: "new-challenge"
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toContain(
      "Machine evidence challenge does not match the active browser challenge."
    );
  });

  it("accepts a complete machine-verified envelope only when all integrity checks pass", async () => {
    const task = runtimeTaskForLesson("B1.2");
    const result = await validateMachineVerification(task, validEnvelope(task));

    expect(result.valid).toBe(true);
  });
});
