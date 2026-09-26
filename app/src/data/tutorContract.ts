export const tutorModes = [
  "teaching",
  "failure-investigation",
  "assignment-coach",
  "incident-review",
  "design-defense",
  "oral-assessment"
] as const;

export type TutorMode = (typeof tutorModes)[number];

export type TutorRequest = {
  sessionId?: string;
  lessonId: string;
  mode: TutorMode;
  message: string;
  platform?: PlatformId;
  learnerEvidence?: Record<string, string>;
  mastery?: {
    attemptNumber: number;
    stage: string;
    failureSummary: string[];
  };
  verificationSummary?: {
    exerciseRecorded: boolean;
    steps: Array<{
      stepId: string;
      result: string;
      exitCode: number;
    }>;
  };
};

export type TutorResponse = {
  message: string;
  mode: TutorMode;
  pedagogicalIntent:
    | "explain"
    | "question"
    | "challenge"
    | "diagnose"
    | "reframe"
    | "review";
  nextQuestion?: string;
  requestedEvidence: string[];
  suggestedAction?: string;
  authoritativeDecision: "not-authoritative";
  canUnlockRetry: false;
  canCertify: false;
};

const validIntents = new Set<TutorResponse["pedagogicalIntent"]>([
  "explain",
  "question",
  "challenge",
  "diagnose",
  "reframe",
  "review"
]);

function boundedString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function boundedStrings(value: unknown, maxItems: number, maxLength: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function parseJsonCandidate(raw: string) {
  const trimmed = raw.trim();
  const fence = String.fromCharCode(96).repeat(3);
  if (trimmed.startsWith(fence)) {
    const withoutOpen = trimmed.slice(3).replace(/^json\s*/i, "");
    return withoutOpen.endsWith(fence)
      ? withoutOpen.slice(0, -3).trim()
      : withoutOpen.trim();
  }
  return trimmed;
}

export function parseTutorResponse(
  raw: string,
  fallbackMode: TutorMode
): TutorResponse {
  try {
    const parsed = JSON.parse(parseJsonCandidate(raw)) as Record<string, unknown>;
    const mode = tutorModes.includes(parsed.mode as TutorMode)
      ? (parsed.mode as TutorMode)
      : fallbackMode;
    const intent = validIntents.has(
      parsed.pedagogicalIntent as TutorResponse["pedagogicalIntent"]
    )
      ? (parsed.pedagogicalIntent as TutorResponse["pedagogicalIntent"])
      : "question";

    return {
      message:
        boundedString(parsed.message, 5000) ||
        "I need one more piece of evidence before I can guide the investigation.",
      mode,
      pedagogicalIntent: intent,
      nextQuestion: boundedString(parsed.nextQuestion, 1200) || undefined,
      requestedEvidence: boundedStrings(parsed.requestedEvidence, 5, 500),
      suggestedAction: boundedString(parsed.suggestedAction, 1200) || undefined,
      authoritativeDecision: "not-authoritative",
      canUnlockRetry: false,
      canCertify: false
    };
  } catch {
    return {
      message:
        boundedString(raw, 5000) ||
        "I could not interpret the tutor response safely.",
      mode: fallbackMode,
      pedagogicalIntent: "question",
      requestedEvidence: [],
      authoritativeDecision: "not-authoritative",
      canUnlockRetry: false,
      canCertify: false
    };
  }
}

export function parseTutorRequest(input: unknown): TutorRequest {
  if (!input || typeof input !== "object") {
    throw new Error("Invalid tutor request.");
  }

  const value = input as Record<string, unknown>;
  const lessonId = boundedString(value.lessonId, 80);
  const mode = value.mode;
  const message = boundedString(value.message, 4000);

  if (!lessonId || !tutorModes.includes(mode as TutorMode) || !message) {
    throw new Error("Tutor request requires a lesson, mode and message.");
  }

  const learnerEvidence =
    value.learnerEvidence && typeof value.learnerEvidence === "object"
      ? Object.fromEntries(
          Object.entries(value.learnerEvidence as Record<string, unknown>)
            .map(([key, item]) => [key.slice(0, 80), boundedString(item, 800)])
            .filter(([, item]) => item)
            .slice(0, 8)
        )
      : undefined;

  const masteryValue =
    value.mastery && typeof value.mastery === "object"
      ? (value.mastery as Record<string, unknown>)
      : undefined;

  const verificationValue =
    value.verificationSummary && typeof value.verificationSummary === "object"
      ? (value.verificationSummary as Record<string, unknown>)
      : undefined;

  const steps = Array.isArray(verificationValue?.steps)
    ? verificationValue.steps
        .filter((step): step is Record<string, unknown> =>
          Boolean(step) && typeof step === "object"
        )
        .map((step) => ({
          stepId: boundedString(step.stepId, 80),
          result: boundedString(step.result, 160),
          exitCode:
            typeof step.exitCode === "number" && Number.isFinite(step.exitCode)
              ? Math.trunc(step.exitCode)
              : -1
        }))
        .filter((step) => step.stepId)
        .slice(0, 12)
    : [];

  return {
    sessionId:
      typeof value.sessionId === "string" && value.sessionId.trim()
        ? value.sessionId.trim().slice(0, 80)
        : undefined,
    lessonId,
    mode: mode as TutorMode,
    message,
    platform:
      value.platform === "macos" || value.platform === "linux" || value.platform === "windows"
        ? value.platform
        : undefined,
    learnerEvidence,
    mastery:
      masteryValue &&
      typeof masteryValue.attemptNumber === "number" &&
      typeof masteryValue.stage === "string"
        ? {
            attemptNumber: Math.max(1, Math.trunc(masteryValue.attemptNumber)),
            stage: boundedString(masteryValue.stage, 80),
            failureSummary: boundedStrings(masteryValue.failureSummary, 4, 500)
          }
        : undefined,
    verificationSummary: verificationValue
      ? {
          exerciseRecorded: verificationValue.exerciseRecorded === true,
          steps
        }
      : undefined
  };
}
