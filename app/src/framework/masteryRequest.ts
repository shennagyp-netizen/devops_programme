const MAX_ITEM_ID_LENGTH = 200;
const MAX_STAGE_LENGTH = 64;
const MAX_SUMMARY_LENGTH = 4000;

export const MASTERY_STAGES = [
  "foundation-reteach",
  "mechanism-reteach",
  "guided-practice",
  "prerequisite-rewind"
] as const;
export type MasteryStage = (typeof MASTERY_STAGES)[number];
const MAX_EVIDENCE_REFS = 32;
const MAX_EVIDENCE_REF_LENGTH = 200;

export type MasteryCommand = {
  itemId: string;
  stage: string;
  summary: string;
  evidenceRefs?: string[];
};

const ALLOWED_FIELDS = new Set([
  "itemId",
  "stage",
  "summary",
  "evidenceRefs"
]);

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

export function parseMasteryCommand(value: unknown): MasteryCommand {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail("Mastery command is required.");
  }

  const source = value as Record<string, unknown>;

  for (const field of Object.keys(source)) {
    if (!ALLOWED_FIELDS.has(field)) {
      return fail(`Unsupported field: ${field}.`);
    }
  }

  const stage = source.stage;
  if (
    typeof stage !== "string" ||
    !MASTERY_STAGES.includes(stage as MasteryStage)
  ) {
    return fail("stage must be a supported mastery coaching stage.");
  }

  const rawRefs = source.evidenceRefs;
  if (rawRefs !== undefined && !Array.isArray(rawRefs)) {
    return fail("evidenceRefs must be an array when provided.");
  }

  const evidenceRefs = (rawRefs ?? []).map((ref, index) =>
    requiredString(ref, `Evidence reference at index ${index}`, MAX_EVIDENCE_REF_LENGTH)
  );

  if (evidenceRefs.length > MAX_EVIDENCE_REFS) {
    return fail(
      `evidenceRefs cannot contain more than ${MAX_EVIDENCE_REFS} references.`
    );
  }

  return {
    itemId: requiredString(source.itemId, "itemId", MAX_ITEM_ID_LENGTH),
    stage: stage as MasteryStage,
    summary: requiredString(source.summary, "summary", MAX_SUMMARY_LENGTH),
    evidenceRefs: [...new Set(evidenceRefs)]
  };
}
