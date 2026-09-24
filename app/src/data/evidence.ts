import type { CourseLevel } from "./programme";
import type { VerificationLevel } from "./handsOn";
import type { RuntimeVerificationScope } from "./runtimeVerification";
import {
  validateMachineVerification,
  type MachineVerificationEnvelope,
  type RuntimeTask
} from "./runtimeVerification";

export type EvidenceKind =
  | "diagnostic"
  | "exercise"
  | "failure"
  | "recovery"
  | "assessment"
  | "design";

export type EvidenceEntry = {
  id: string;
  course: CourseLevel;
  projectId: string;
  lessonId?: string;
  kind: EvidenceKind;
  summary: string;
  createdAt: string;
  taskId?: string;
  verificationLevel?: VerificationLevel;
  verificationScope?: RuntimeVerificationScope;
  evidencePayload?: Record<string, string>;
};

const STORAGE_KEY = "devops-programme-evidence-ledger";

function readLedger(): EvidenceEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as EvidenceEntry[];
  } catch {
    return [];
  }
}

function writeLedger(entries: EvidenceEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Local evidence is best-effort in the MVP.
  }
}

export function listEvidence(projectId?: string) {
  const entries = readLedger();
  return projectId
    ? entries.filter((entry) => entry.projectId === projectId)
    : entries;
}

export function addEvidence(entry: Omit<EvidenceEntry, "id" | "createdAt">) {
  const existing = readLedger().find(
    (candidate) =>
      candidate.course === entry.course &&
      candidate.projectId === entry.projectId &&
      candidate.lessonId === entry.lessonId &&
      candidate.kind === entry.kind &&
      candidate.summary === entry.summary
  );

  if (existing) return existing;

  const next: EvidenceEntry = {
    ...entry,
    id: `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  };
  writeLedger([...readLedger(), next]);
  return next;
}

export function clearEvidence() {
  writeLedger([]);
}

export function recordMachineVerification(input: {
  course: CourseLevel;
  projectId: string;
  task: RuntimeTask;
  envelope: MachineVerificationEnvelope;
  summary: string;
}) {
  const validation = validateMachineVerification(input.task, input.envelope);

  if (!validation.valid) {
    return {
      recorded: false as const,
      failures: validation.failures
    };
  }

  const entry = addEvidence({
    course: input.course,
    projectId: input.projectId,
    lessonId: input.task.lessonId,
    kind: "exercise",
    summary: input.summary,
    taskId: input.task.taskId,
    verificationLevel: "machine-verified",
    verificationScope: input.task.scope,
    evidencePayload: {
      verificationSource: input.envelope.verificationSource,
      runnerVersion: input.envelope.runnerVersion,
      environmentFingerprint: input.envelope.environmentFingerprint
    }
  });

  return {
    recorded: true as const,
    entry
  };
}

export function recordHandsOnEvidence(input: {
  course: CourseLevel;
  projectId: string;
  lessonId: string;
  taskId: string;
  summary: string;
  verificationLevel: VerificationLevel;
  evidencePayload: Record<string, string>;
}) {
  return addEvidence({
    course: input.course,
    projectId: input.projectId,
    lessonId: input.lessonId,
    kind: "exercise",
    summary: input.summary,
    taskId: input.taskId,
    verificationLevel: input.verificationLevel,
    evidencePayload: input.evidencePayload
  });
}
