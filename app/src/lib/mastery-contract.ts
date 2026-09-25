import { MASTERY_FAILURES, REMEDIATION_METHODS } from "../data/masteryRemediation";

export const MASTERY_ATTEMPT_RESULTS = ["failed", "pending", "passed"] as const;
export type MasteryAttemptResult = (typeof MASTERY_ATTEMPT_RESULTS)[number];

export type MasteryAttemptInput = {
  lessonId: string;
  assignmentId: string;
  attemptNumber: number;
  failureClass: string;
  failedFields: string[];
  remediationMethods: string[];
};

export function parseMasteryAttemptInput(value: unknown): MasteryAttemptInput {
  if (!value || typeof value !== "object") {
    throw new Error("Mastery attempt input is required.");
  }

  const source = value as Record<string, unknown>;
  const stringValue = (raw: unknown, name: string, max: number) => {
    if (typeof raw !== "string" || raw.trim().length === 0 || raw.length > max) {
      throw new Error(name + " must be a non-empty string.");
    }
    return raw.trim();
  };
  const listValue = (raw: unknown, name: string) => {
    if (!Array.isArray(raw) || raw.length > 20 || raw.some((item) => typeof item !== "string")) {
      throw new Error(name + " must be a string list.");
    }
    return raw.map((item) => String(item).trim()).filter(Boolean);
  };

  const failureClass = stringValue(source.failureClass, "failureClass", 64);
  if (!MASTERY_FAILURES.includes(failureClass as (typeof MASTERY_FAILURES)[number])) {
    throw new Error("failureClass is invalid.");
  }

  const remediationMethods = listValue(source.remediationMethods, "remediationMethods");
  if (
    remediationMethods.some(
      (method) => !REMEDIATION_METHODS.includes(method as (typeof REMEDIATION_METHODS)[number])
    )
  ) {
    throw new Error("remediationMethods contains an invalid method.");
  }

  const attemptNumber = source.attemptNumber;
  if (!Number.isSafeInteger(attemptNumber) || Number(attemptNumber) < 1 || Number(attemptNumber) > 1000) {
    throw new Error("attemptNumber must be a positive integer.");
  }

  return {
    lessonId: stringValue(source.lessonId, "lessonId", 200),
    assignmentId: stringValue(source.assignmentId, "assignmentId", 200),
    attemptNumber: Number(attemptNumber),
    failureClass,
    failedFields: listValue(source.failedFields, "failedFields"),
    remediationMethods
  };
}
