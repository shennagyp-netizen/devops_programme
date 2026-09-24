import type { PlatformId } from "./programme";
import type { VerificationLevel } from "./handsOn";
import runtimeTaskCatalog from "./runtimeTasks.json";

export type RuntimeStepKind =
  | "observe"
  | "change"
  | "failure"
  | "restore"
  | "verify";

export type RuntimeCommand = {
  program: string;
  args: string[];
  timeoutMs: number;
  destructive: boolean;
};

export type RuntimeStep = {
  id: string;
  kind: RuntimeStepKind;
  purpose: string;
  commands: Partial<Record<PlatformId, RuntimeCommand>>;
  required: boolean;
};

export type RuntimeTask = {
  taskId: string;
  contractVersion: number;
  lessonId: string;
  verificationLevel: VerificationLevel;
  steps: RuntimeStep[];
  resetRequired: boolean;
  scope: RuntimeVerificationScope;
};

export type RuntimeVerificationScope = "probe" | "exercise";

export type RuntimeStepResult = {
  stepId: string;
  startedAt: string;
  completedAt: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  stdoutHash: string;
  stderrHash: string;
  result: "passed" | "failed" | "not-run";
};

export type MachineExecutionTarget =
  | {
      kind: "local";
    }
  | {
      kind: "ssh";
      host: string;
      port: number;
      user: string;
      hostKeyPolicy: "strict-known-hosts";
    };

export type MachineAttestation = {
  algorithm: "Ed25519";
  publicKey: string;
  signature: string;
};

export type MachineVerificationEnvelope = {
  schemaVersion: 1;
  taskId: string;
  contractVersion: number;
  lessonId: string;
  platform: PlatformId;
  verificationLevel: "machine-verified";
  verificationSource: "local-runner" | "ssh-runner" | "managed-runner";
  executionMode: "local-machine" | "remote-machine";
  target: MachineExecutionTarget;
  runnerVersion: string;
  environmentFingerprint: string;
  challenge?: string;
  attestation?: MachineAttestation;
  startedAt: string;
  completedAt: string;
  stepResults: RuntimeStepResult[];
  resetPerformed: boolean;
};

export type RuntimeVerificationOptions = {
  requireAttestation?: boolean;
  expectedChallenge?: string;
  expectedAttestationPublicKey?: string;
};

export type RuntimeVerificationResult =
  | { valid: true; envelope: MachineVerificationEnvelope }
  | { valid: false; failures: string[] };

export const runtimeTasks = runtimeTaskCatalog.runtimeTasks as RuntimeTask[];

export function runtimeTaskForLesson(lessonId: string) {
  return runtimeTasks.find((task) => task.lessonId === lessonId);
}

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function supportedPlatform(value: string): value is PlatformId {
  return value === "macos" || value === "linux" || value === "windows";
}

function isSha256(value: string) {
  return /^[a-f0-9]{64}$/i.test(value);
}

async function sha256Hex(value: string) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Web Crypto SHA-256 support is unavailable.");
  }

  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function buildMachineAttestationPayload(
  envelope: MachineVerificationEnvelope
) {
  return JSON.stringify({
    schemaVersion: envelope.schemaVersion,
    taskId: envelope.taskId,
    contractVersion: envelope.contractVersion,
    lessonId: envelope.lessonId,
    platform: envelope.platform,
    verificationLevel: envelope.verificationLevel,
    verificationSource: envelope.verificationSource,
    executionMode: envelope.executionMode,
    target: envelope.target,
    runnerVersion: envelope.runnerVersion,
    environmentFingerprint: envelope.environmentFingerprint,
    challenge: envelope.challenge ?? "",
    startedAt: envelope.startedAt,
    completedAt: envelope.completedAt,
    stepResults: envelope.stepResults,
    resetPerformed: envelope.resetPerformed
  });
}

function base64UrlToBytes(value: string) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;

  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "="
  );

  try {
    const binary = globalThis.atob(padded);
    return Uint8Array.from(binary, (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

async function verifyLocalAgentAttestation(
  envelope: MachineVerificationEnvelope,
  expectedChallenge: string | undefined,
  expectedAttestationPublicKey: string | undefined
) {
  const failures: string[] = [];

  if (!expectedChallenge?.trim()) {
    failures.push("Local agent verification requires an active browser challenge.");
    return failures;
  }

  if (!envelope.challenge || envelope.challenge !== expectedChallenge) {
    failures.push(
      "Machine evidence challenge does not match the active browser challenge."
    );
    return failures;
  }

  if (!envelope.attestation) {
    failures.push("Local agent evidence requires a cryptographic attestation.");
    return failures;
  }

  if (
    expectedAttestationPublicKey &&
    envelope.attestation.publicKey !== expectedAttestationPublicKey
  ) {
    failures.push(
      "Local agent attestation public key does not match the paired agent."
    );
    return failures;
  }

  if (envelope.attestation.algorithm !== "Ed25519") {
    failures.push("Local agent attestation algorithm is unsupported.");
    return failures;
  }

  const publicKey = base64UrlToBytes(envelope.attestation.publicKey);
  const signature = base64UrlToBytes(envelope.attestation.signature);

  if (!publicKey || !signature) {
    failures.push("Local agent attestation encoding is invalid.");
    return failures;
  }

  if (!globalThis.crypto?.subtle) {
    failures.push("Web Crypto attestation verification is unavailable.");
    return failures;
  }

  try {
    const key = await globalThis.crypto.subtle.importKey(
      "spki",
      publicKey,
      { name: "Ed25519" },
      false,
      ["verify"]
    );

    const valid = await globalThis.crypto.subtle.verify(
      { name: "Ed25519" },
      key,
      signature,
      new TextEncoder().encode(buildMachineAttestationPayload(envelope))
    );

    if (!valid) {
      failures.push("Local agent attestation signature is invalid.");
    }
  } catch {
    failures.push("Local agent attestation could not be verified.");
  }

  return failures;
}

export async function validateMachineVerification(
  task: RuntimeTask | undefined,
  envelope: MachineVerificationEnvelope,
  options: RuntimeVerificationOptions = {}
): Promise<RuntimeVerificationResult> {
  const failures: string[] = [];
  const requireAttestation = options.requireAttestation === true;

  if (!task) {
    return {
      valid: false,
      failures: ["Runtime task is not defined."]
    };
  }

  if (task.verificationLevel !== "machine-verified") {
    failures.push("Runtime task must declare machine-verified status.");
  }

  if (envelope.schemaVersion !== 1) {
    failures.push("Unsupported machine-verification schema version.");
  }

  if (envelope.taskId !== task.taskId) {
    failures.push("Envelope taskId does not match the runtime task.");
  }

  if (envelope.contractVersion !== task.contractVersion) {
    failures.push("Envelope contractVersion does not match the runtime task.");
  }

  if (envelope.lessonId !== task.lessonId) {
    failures.push("Envelope lessonId does not match the runtime task.");
  }

  if (envelope.verificationLevel !== "machine-verified") {
    failures.push("Envelope must declare machine-verified status.");
  }

  if (!supportedPlatform(String(envelope.platform))) {
    failures.push("Envelope platform is unsupported.");
  } else {
    for (const step of task.steps) {
      if (!step.commands[envelope.platform]) {
        failures.push(
          `Runtime step ${step.id} has no command for envelope platform ${envelope.platform}.`
        );
      }
    }
  }

  if (!["local-runner", "ssh-runner", "managed-runner"].includes(envelope.verificationSource)) {
    failures.push("Envelope verificationSource is invalid.");
  }

  if (envelope.verificationSource === "managed-runner") {
    failures.push("Managed runner verification is not available in this build.");
  }

  if (!["local-machine", "remote-machine"].includes(envelope.executionMode)) {
    failures.push("Envelope executionMode is invalid.");
  }

  if (envelope.verificationSource === "local-runner" && envelope.executionMode !== "local-machine") {
    failures.push("Local runner evidence must declare local-machine executionMode.");
  }

  if (envelope.verificationSource === "ssh-runner" && envelope.executionMode !== "remote-machine") {
    failures.push("SSH runner evidence must declare remote-machine executionMode.");
  }

  if (requireAttestation) {
    failures.push(
      ...(await verifyLocalAgentAttestation(
        envelope,
        options.expectedChallenge,
        options.expectedAttestationPublicKey
      ))
    );
  }

  if (!envelope.target || typeof envelope.target !== "object") {
    failures.push("Envelope target is missing.");
  } else if (envelope.verificationSource === "ssh-runner") {
    if (envelope.executionMode !== "remote-machine") {
      failures.push("SSH runner evidence must use remote-machine executionMode.");
    }
    if (envelope.target.kind !== "ssh") {
      failures.push("SSH runner evidence must identify an SSH target.");
    } else {
      if (!envelope.target.host.trim()) failures.push("SSH target host is missing.");
      if (!envelope.target.user.trim()) failures.push("SSH target user is missing.");
      if (!Number.isInteger(envelope.target.port) || envelope.target.port < 1 || envelope.target.port > 65535) {
        failures.push("SSH target port is invalid.");
      }
      if (envelope.target.hostKeyPolicy !== "strict-known-hosts") {
        failures.push("SSH target must use strict-known-hosts policy.");
      }
    }
  } else {
    if (envelope.executionMode === "local-machine" && envelope.target.kind !== "local") {
      failures.push("Local execution evidence must identify a local target.");
    }
    if (
      envelope.executionMode === "remote-machine" &&
      envelope.verificationSource !== "managed-runner" &&
      envelope.target.kind !== "ssh"
    ) {
      failures.push("Remote execution evidence must identify an SSH target.");
    }
  }

  if (!envelope.runnerVersion.trim()) {
    failures.push("Runner version is missing.");
  }

  if (!envelope.environmentFingerprint.trim()) {
    failures.push("Environment fingerprint is missing.");
  }

  if (!isIsoDate(envelope.startedAt) || !isIsoDate(envelope.completedAt)) {
    failures.push("Envelope timestamps are invalid.");
  } else if (Date.parse(envelope.completedAt) < Date.parse(envelope.startedAt)) {
    failures.push("Envelope completedAt precedes startedAt.");
  }

  if (!Array.isArray(envelope.stepResults)) {
    failures.push("Envelope stepResults must be an array.");
    return { valid: false, failures };
  }

  if (envelope.stepResults.length !== task.steps.length) {
    failures.push("Envelope stepResults must contain exactly one result for every runtime step.");
  }

  const expectedStepIds = new Set(task.steps.map((step) => step.id));
  const seenStepIds = new Set<string>();
  let orderMatches = true;
  let previousStepCompleted: number | null = null;

  for (let index = 0; index < envelope.stepResults.length; index += 1) {
    const result = envelope.stepResults[index];
    const expectedStep = task.steps[index];

    if (result.stepId !== expectedStep?.id) {
      orderMatches = false;
    }

    if (seenStepIds.has(result.stepId)) {
      failures.push(`Duplicate runtime step result: ${result.stepId}`);
    }
    seenStepIds.add(result.stepId);

    if (!expectedStepIds.has(result.stepId)) {
      failures.push(`Unknown runtime step result: ${result.stepId}`);
      continue;
    }

    if (!isIsoDate(result.startedAt) || !isIsoDate(result.completedAt)) {
      failures.push(`Invalid timestamps for runtime step ${result.stepId}.`);
    } else {
      const stepStarted = Date.parse(result.startedAt);
      const stepCompleted = Date.parse(result.completedAt);
      const envelopeStarted = Date.parse(envelope.startedAt);
      const envelopeCompleted = Date.parse(envelope.completedAt);

      if (stepCompleted < stepStarted) {
        failures.push(`Runtime step ${result.stepId} completedAt precedes startedAt.`);
      }

      if (
        Number.isFinite(envelopeStarted) &&
        Number.isFinite(envelopeCompleted) &&
        (stepStarted < envelopeStarted || stepCompleted > envelopeCompleted)
      ) {
        failures.push(
          `Runtime step ${result.stepId} completedAt falls outside the envelope window.`
        );
      }

      if (previousStepCompleted !== null && stepStarted < previousStepCompleted) {
        failures.push(
          `Runtime step ${result.stepId} starts before the previous runtime step completed.`
        );
      }

      previousStepCompleted = stepCompleted;
    }

    if (typeof result.stdout !== "string" || typeof result.stderr !== "string") {
      failures.push(`Captured command output is missing for runtime step ${result.stepId}.`);
      continue;
    }

    if (result.stdout.length > 65536 || result.stderr.length > 65536) {
      failures.push(`Captured command output is too large for runtime step ${result.stepId}.`);
    }

    if (!isSha256(result.stdoutHash) || !isSha256(result.stderrHash)) {
      failures.push(`Output hashes are invalid for runtime step ${result.stepId}.`);
    } else {
      const [stdoutHash, stderrHash] = await Promise.all([
        sha256Hex(result.stdout),
        sha256Hex(result.stderr)
      ]);

      if (stdoutHash !== result.stdoutHash.toLowerCase()) {
        failures.push(
          `stdoutHash does not match captured stdout for runtime step ${result.stepId}.`
        );
      }

      if (stderrHash !== result.stderrHash.toLowerCase()) {
        failures.push(
          `stderrHash does not match captured stderr for runtime step ${result.stepId}.`
        );
      }
    }

    if (result.result === "passed" && result.exitCode !== 0) {
      failures.push(`Runtime step ${result.stepId} is marked passed with a non-zero exit code.`);
    }

    if (result.result !== "passed") {
      failures.push(`Runtime step ${result.stepId} did not pass.`);
    }
  }

  if (!orderMatches) {
    failures.push("Runtime step result order does not match the runtime task.");
  }

  for (const step of task.steps) {
    if (!seenStepIds.has(step.id)) {
      failures.push(`Required runtime step is missing: ${step.id}`);
    }
  }

  if (task.resetRequired && !envelope.resetPerformed) {
    failures.push("Task requires reset verification, but resetPerformed is false.");
  }

  return failures.length
    ? { valid: false, failures }
    : { valid: true, envelope };
}
