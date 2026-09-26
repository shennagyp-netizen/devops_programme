const MAX_INSTANCE_ID_LENGTH = 128;
const MAX_COURSE_ID_LENGTH = 32;
const MAX_SECTION_ID_LENGTH = 64;
const MAX_FAMILY_LENGTH = 32;
const MAX_ANSWER_COUNT = 40;
const MAX_ANSWER_LENGTH = 4000;

export const ASSESSMENT_FAMILIES = [
  "conceptual",
  "diagnostic",
  "hands-on"
] as const;

export type AssessmentFamily = (typeof ASSESSMENT_FAMILIES)[number];

export type IssueAssessmentCommand = {
  courseId: "beginner" | "intermediate" | "advanced";
  sectionId: string;
  family: AssessmentFamily;
};

export type SubmitAssessmentCommand = {
  instanceId: string;
  answers: Record<string, string | number | boolean>;
};

const ISSUE_FIELDS = new Set(["courseId", "sectionId", "family"]);
const SUBMIT_FIELDS = new Set(["instanceId", "answers"]);

function fail(message: string): never {
  throw new Error(message);
}

function requiredString(value: unknown, name: string, maxLength: number) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > maxLength
  ) {
    return fail(
      `${name} must be a non-empty string up to ${maxLength} characters.`
    );
  }

  return value.trim();
}

function parseObject(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail(`${label} is required.`);
  }

  return value as Record<string, unknown>;
}

export function parseIssueAssessmentCommand(
  value: unknown
): IssueAssessmentCommand {
  const source = parseObject(value, "Assessment issue command");

  for (const field of Object.keys(source)) {
    if (!ISSUE_FIELDS.has(field)) {
      return fail(`Unsupported field: ${field}.`);
    }
  }

  const courseId = requiredString(source.courseId, "courseId", MAX_COURSE_ID_LENGTH);
  if (!["beginner", "intermediate", "advanced"].includes(courseId)) {
    return fail("courseId must be beginner, intermediate, or advanced.");
  }

  const family = requiredString(source.family, "family", MAX_FAMILY_LENGTH);
  if (!ASSESSMENT_FAMILIES.includes(family as AssessmentFamily)) {
    return fail("family must be conceptual, diagnostic, or hands-on.");
  }

  return {
    courseId: courseId as IssueAssessmentCommand["courseId"],
    sectionId: requiredString(source.sectionId, "sectionId", MAX_SECTION_ID_LENGTH),
    family: family as AssessmentFamily
  };
}

export function parseSubmitAssessmentCommand(
  value: unknown
): SubmitAssessmentCommand {
  const source = parseObject(value, "Assessment submission command");

  for (const field of Object.keys(source)) {
    if (!SUBMIT_FIELDS.has(field)) {
      return fail(`Unsupported field: ${field}.`);
    }
  }

  const answersValue = source.answers;
  if (
    !answersValue ||
    typeof answersValue !== "object" ||
    Array.isArray(answersValue)
  ) {
    return fail("answers must be an object.");
  }

  const entries = Object.entries(answersValue as Record<string, unknown>);
  if (entries.length > MAX_ANSWER_COUNT) {
    return fail(`answers cannot contain more than ${MAX_ANSWER_COUNT} entries.`);
  }

  const answers: Record<string, string | number | boolean> = {};

  for (const [questionId, answer] of entries) {
    const safeQuestionId = requiredString(
      questionId,
      "questionId",
      MAX_SECTION_ID_LENGTH
    );

    if (
      !["string", "number", "boolean"].includes(typeof answer) ||
      (typeof answer === "string" && answer.length > MAX_ANSWER_LENGTH)
    ) {
      return fail(`Answer for ${safeQuestionId} is invalid or too large.`);
    }

    answers[safeQuestionId] = answer as string | number | boolean;
  }

  return {
    instanceId: requiredString(
      source.instanceId,
      "instanceId",
      MAX_INSTANCE_ID_LENGTH
    ),
    answers
  };
}
