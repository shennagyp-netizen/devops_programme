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
  startedAt: string;
  completedAt: string;
  stepResults: RuntimeStepResult[];
  resetPerformed: boolean;
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

export function validateMachineVerification(
  task: RuntimeTask | undefined,
  envelope: MachineVerificationEnvelope
): RuntimeVerificationResult {
  const failures: string[] = [];

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

  if (!["local-machine", "remote-machine"].includes(envelope.executionMode)) {
    failures.push("Envelope executionMode is invalid.");
  }

  if (!envelope.target || typeof envelope.target !== "object") {
    failures.push("Envelope target is missing.");
  } else if (envelope.verificationSource === "ssh-runner") {
    if (envelope.executionMode !== "remote-machine") {
      failures.push("SSH runner evidence must declare remote-machine executionMode.");
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
  } else if (envelope.executionMode === "local-machine" && envelope.target.kind !== "local") {
    failures.push("Local execution evidence must identify a local target.");
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

  const expectedStepIds = new Set(task.steps.map((step) => step.id));
  const seenStepIds = new Set<string>();

  for (const result of envelope.stepResults) {
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
    } else if (Date.parse(result.completedAt) < Date.parse(result.startedAt)) {
      failures.push(`Runtime step ${result.stepId} completedAt precedes startedAt.`);
    }

    if (typeof result.stdout !== "string" || typeof result.stderr !== "string") {
      failures.push(`Captured command output is missing for runtime step ${result.stepId}.`);
    }

    if (\n      (typeof result.stdout === "string" && result.stdout.length > 65536) ||\n      (typeof result.stderr === "string" && result.stderr.length > 65536)\n    ) {
      failures.push(`Captured command output is too large for runtime step ${result.stepId}.`);
    }

    if (!result.stdoutHash.trim() || !result.stderrHash.trim()) {
      failures.push(`Output hashes are missing for runtime step ${result.stepId}.`);
    }

    if (result.result === "passed" && result.exitCode !== 0) {
      failures.push(`Runtime step ${result.stepId} is marked passed with a non-zero exit code.`);
    }

    if (result.result !== "passed") {
      failures.push(`Runtime step ${result.stepId} did not pass.`);
    }
  }

  for (const step of task.steps) {
    if (!seenStepIds.has(step.id) && step.required) {
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
