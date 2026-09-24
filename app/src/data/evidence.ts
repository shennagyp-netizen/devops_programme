import { lessonsByCourse } from "./courseLessons";
import { getHandsOnTask } from "./handsOn";
import type { CourseLevel } from "./programme";
import type { VerificationLevel } from "./handsOn";
import type { RuntimeVerificationScope } from "./runtimeVerification";
import {
  runtimeTaskForLesson,
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

export type MachineEvidenceSource = "local-agent" | "imported-file";

export async function recordMachineVerification(input: {
  task: RuntimeTask;
  envelope: MachineVerificationEnvelope;
  summary: string;
  source: MachineEvidenceSource;
  expectedChallenge?: string;
  expectedAttestationPublicKey?: string;
}) {
  const canonicalTask = runtimeTaskForLesson(input.task.lessonId);
  const canonicalLesson = (Object.keys(lessonsByCourse) as CourseLevel[])
    .flatMap((course) => lessonsByCourse[course])
    .find((lesson) => lesson.id === input.task.lessonId);

  if (
    !canonicalTask ||
    input.task.taskId !== canonicalTask.taskId ||
    input.task.contractVersion !== canonicalTask.contractVersion ||
    !canonicalLesson
  ) {
    return {
      recorded: false as const,
      failures: ["Runtime task is not the canonical published task for this lesson."]
    };
  }

  const validation = await validateMachineVerification(
    canonicalTask,
    input.envelope,
    {
      requireAttestation: input.source === "local-agent",
      expectedChallenge: input.expectedChallenge,
      expectedAttestationPublicKey: input.expectedAttestationPublicKey
    }
  );

  if (!validation.valid) {
    return {
      recorded: false as const,
      failures: validation.failures
    };
  }

  const locallyAttested =
    input.source === "local-agent" &&
    input.envelope.verificationSource === "local-runner" &&
    input.envelope.executionMode === "local-machine";

  const entry = addEvidence({
    course: canonicalLesson.course,
    projectId: canonicalLesson.projectId,
    lessonId: canonicalLesson.id,
    kind: "exercise",
    summary: input.summary,
    taskId: input.task.taskId,
    verificationLevel: locallyAttested ? "machine-verified" : "structured",
    verificationScope: canonicalTask.scope,
    evidencePayload: {
      verificationSource: input.envelope.verificationSource,
      runnerVersion: input.envelope.runnerVersion,
      environmentFingerprint: input.envelope.environmentFingerprint,
      evidenceSource: input.source,
      trust: locallyAttested ? "local-direct" : "imported-untrusted"
    }
  });

  return {
    recorded: true as const,
    trustedForCompletion: locallyAttested,
    entry
  };
}

export function recordHandsOnEvidence(input: {
  lessonId: string;
  summary: string;
  evidencePayload: Record<string, string>;
}) {
  const canonicalLesson = (Object.keys(lessonsByCourse) as CourseLevel[])
    .flatMap((course) => lessonsByCourse[course])
    .find((lesson) => lesson.id === input.lessonId);

  if (!canonicalLesson) {
    throw new Error("Lesson does not exist.");
  }

  const canonicalTask = getHandsOnTask(canonicalLesson);

  return addEvidence({
    course: canonicalLesson.course,
    projectId: canonicalLesson.projectId,
    lessonId: canonicalLesson.id,
    kind: "exercise",
    summary: input.summary,
    taskId: canonicalTask.taskId,
    verificationLevel: "structured",
    evidencePayload: input.evidencePayload
  });
}
