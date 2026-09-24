import type { PlatformId } from "./programme";
import type { VerificationLevel } from "./handsOn";

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
  lessonId: string;
  verificationLevel: VerificationLevel;
  steps: RuntimeStep[];
  resetRequired: boolean;
};

export type RuntimeStepResult = {
  stepId: string;
  startedAt: string;
  completedAt: string;
  exitCode: number;
  stdoutHash: string;
  stderrHash: string;
  result: "passed" | "failed" | "not-run";
};

export type MachineVerificationEnvelope = {
  schemaVersion: 1;
  taskId: string;
  lessonId: string;
  platform: PlatformId;
  verificationLevel: "machine-verified";
  verificationSource: "local-runner" | "managed-runner";
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

const SAFE_DEFAULT_TIMEOUT_MS = 30_000;

export function command(program: string, args: string[], destructive = false): RuntimeCommand {
  return {
    program,
    args,
    timeoutMs: SAFE_DEFAULT_TIMEOUT_MS,
    destructive
  };
}

export const runtimeTasks: RuntimeTask[] = [
  {
    taskId: "hands-on-B1.2",
    lessonId: "B1.2",
    verificationLevel: "machine-verified",
    resetRequired: false,
    steps: [
      {
        id: "resolve-name",
        kind: "observe",
        purpose: "Resolve the service name before testing the connection path.",
        commands: {
          macos: command("dig", ["example.com"]),
          linux: command("dig", ["example.com"]),
          windows: command("powershell.exe", ["-NoProfile", "-Command", "Resolve-DnsName example.com"])
        },
        required: true
      },
      {
        id: "test-https-port",
        kind: "verify",
        purpose: "Test whether the target HTTPS port is reachable.",
        commands: {
          macos: command("nc", ["-z", "example.com", "443"]),
          linux: command("nc", ["-z", "example.com", "443"]),
          windows: command("powershell.exe", ["-NoProfile", "-Command", "Test-NetConnection example.com -Port 443"])
        },
        required: true
      }
    ]
  }
];

export function runtimeTaskForLesson(lessonId: string) {
  return runtimeTasks.find((task) => task.lessonId === lessonId);
}

function isIsoDate(value: string) {
  return !Number.isNaN(Date.parse(value));
}

export function validateMachineVerification(
  task: RuntimeTask,
  envelope: MachineVerificationEnvelope
): RuntimeVerificationResult {
  const failures: string[] = [];

  if (envelope.schemaVersion !== 1) {
    failures.push("Unsupported machine-verification schema version.");
  }

  if (envelope.taskId !== task.taskId) {
    failures.push("Envelope taskId does not match the runtime task.");
  }

  if (envelope.lessonId !== task.lessonId) {
    failures.push("Envelope lessonId does not match the runtime task.");
  }

  if (envelope.verificationLevel !== "machine-verified") {
    failures.push("Envelope must declare machine-verified status.");
  }

  if (!["local-runner", "managed-runner"].includes(envelope.verificationSource)) {
    failures.push("Envelope verificationSource is invalid.");
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

  const resultByStep = new Map(
    envelope.stepResults.map((result) => [result.stepId, result])
  );

  for (const step of task.steps) {
    const result = resultByStep.get(step.id);

    if (!result) {
      if (step.required) {
        failures.push(`Required runtime step is missing: ${step.id}`);
      }
      continue;
    }

    if (!isIsoDate(result.startedAt) || !isIsoDate(result.completedAt)) {
      failures.push(`Invalid timestamps for runtime step ${step.id}.`);
    }

    if (!result.stdoutHash.trim() || !result.stderrHash.trim()) {
      failures.push(`Output hashes are missing for runtime step ${step.id}.`);
    }

    if (result.result !== "passed") {
      failures.push(`Runtime step ${step.id} did not pass.`);
    }
  }

  if (task.resetRequired && !envelope.resetPerformed) {
    failures.push("Task requires reset verification, but resetPerformed is false.");
  }

  return failures.length
    ? { valid: false, failures }
    : { valid: true, envelope };
}
