export const MASTERY_OUTCOMES = ["failure", "mastered"] as const;
export type MasteryOutcome = (typeof MASTERY_OUTCOMES)[number];

const limits = {
  lessonId: 200,
  taskId: 200,
  stage: 64,
  summary: 4000
} as const;

function requiredString(value: unknown, name: string, maxLength: number) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > maxLength
  ) {
    throw new Error(name + " must be a non-empty string within the allowed length.");
  }

  return value.trim();
}

export type MasteryAttemptInput = {
  lessonId: string;
  taskId: string;
  outcome: MasteryOutcome;
  stage: string;
  summary: string;
};

export function parseMasteryAttemptInput(value: unknown): MasteryAttemptInput {
  if (!value || typeof value !== "object") {
    throw new Error("Mastery attempt input is required.");
  }

  const source = value as Record<string, unknown>;
  const outcome = source.outcome;

  if (
    typeof outcome !== "string" ||
    !MASTERY_OUTCOMES.includes(outcome as MasteryOutcome)
  ) {
    throw new Error("outcome must be failure or mastered.");
  }

  return {
    lessonId: requiredString(source.lessonId, "lessonId", limits.lessonId),
    taskId: requiredString(source.taskId, "taskId", limits.taskId),
    outcome: outcome as MasteryOutcome,
    stage: requiredString(source.stage, "stage", limits.stage),
    summary: requiredString(source.summary, "summary", limits.summary)
  };
}

export type MasteryAttemptRecord = {
  id: string;
  lessonId: string;
  taskId: string;
  attemptNumber: number;
  outcome: MasteryOutcome;
  stage: string;
  summary: string;
  createdAt: string;
};
