import type { LearningTransitionRequest } from "./contracts";

const MAX_ITEM_ID_LENGTH = 200;
const MAX_EVIDENCE_REFS = 32;
const MAX_EVIDENCE_REF_LENGTH = 200;

export type CompleteLearningItemCommand = Pick<
  LearningTransitionRequest,
  "itemId" | "evidenceRefs"
>;

const ALLOWED_FIELDS = new Set(["itemId", "evidenceRefs"]);

function fail(message: string): never {
  throw new Error(message);
}

export function parseCompleteLearningItemCommand(
  value: unknown
): CompleteLearningItemCommand {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail("Completion command is required.");
  }

  const source = value as Record<string, unknown>;

  for (const field of Object.keys(source)) {
    if (!ALLOWED_FIELDS.has(field)) {
      return fail(`Unsupported field: ${field}.`);
    }
  }

  if (
    typeof source.itemId !== "string" ||
    source.itemId.trim().length === 0 ||
    source.itemId.length > MAX_ITEM_ID_LENGTH
  ) {
    return fail("itemId must be a non-empty string up to 200 characters.");
  }

  const rawEvidenceRefs = source.evidenceRefs;
  if (rawEvidenceRefs !== undefined && !Array.isArray(rawEvidenceRefs)) {
    return fail("evidenceRefs must be an array when provided.");
  }

  const evidenceRefs = (rawEvidenceRefs ?? []).map((value, index) => {
    if (
      typeof value !== "string" ||
      value.trim().length === 0 ||
      value.length > MAX_EVIDENCE_REF_LENGTH
    ) {
      return fail(`Evidence reference at index ${index} is invalid or too long.`);
    }
    return value.trim();
  });

  if (evidenceRefs.length > MAX_EVIDENCE_REFS) {
    return fail(`evidenceRefs cannot contain more than ${MAX_EVIDENCE_REFS} references.`);
  }

  return {
    itemId: source.itemId.trim(),
    evidenceRefs: [...new Set(evidenceRefs)]
  };
}
