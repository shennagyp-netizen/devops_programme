export const LEARNING_ITEM_TYPES = [
  "lesson",
  "assignment",
  "question",
  "project"
] as const;

export type LearningItemType = (typeof LEARNING_ITEM_TYPES)[number];

export type CompletionInput = {
  itemType: LearningItemType;
  itemId: string;
};

const limits = {
  itemId: 200
} as const;


function requireString(
  value: unknown,
  name: string,
  maxLength: number
): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > maxLength) {
    throw new Error(
      name +
        " must be a non-empty string up to " +
        String(maxLength) +
        " characters."
    );
  }

  return value.trim();
}

export function parseCompletionInput(value: unknown): CompletionInput {
  if (!value || typeof value !== "object") {
    throw new Error("Completion input is required.");
  }

  const source = value as Record<string, unknown>;
  const rawType = source.itemType;

  if (rawType === undefined) {
    throw new Error("itemType is required.");
  }

  if (
    typeof rawType !== "string" ||
    !LEARNING_ITEM_TYPES.includes(rawType as LearningItemType)
  ) {
    throw new Error(
      "itemType must be lesson, assignment, question, or project."
    );
  }

  return {
    itemType: rawType as LearningItemType,
    itemId: requireString(source.itemId, "itemId", limits.itemId)
  };
}

export type CompletionRecord = {
  itemType: LearningItemType;
  itemId: string;
  completedAt: string;
  verificationLevel?: string | null;
  course?: string | null;
  projectId?: string | null;
};
