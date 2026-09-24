import { and, asc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { learnerProgressHistory } from "./schema";
import {
  parseCompletionInput,
  type CompletionInput,
  type CompletionRecord
} from "../progress-contract";
import { resolvePublishedLearningItem } from "./learning-catalog";

function requireUserId(userId: string) {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new Error("Authentication required.");
  }

  return userId.trim();
}

function toCompletionRecord(
  item: typeof learnerProgressHistory.$inferSelect
): CompletionRecord {
  return {
    itemType: item.itemType as CompletionRecord["itemType"],
    itemId: item.itemId,
    completedAt: item.completedAt.toISOString(),
    verificationLevel: item.verificationLevel,
    course: item.course,
    projectId: item.projectId
  };
}

export async function listCompletionHistoryForUser(
  userId: string
): Promise<CompletionRecord[]> {
  const safeUserId = requireUserId(userId);
  const db = getDb();

  const rows = await db
    .select()
    .from(learnerProgressHistory)
    .where(eq(learnerProgressHistory.userId, safeUserId))
    .orderBy(
      asc(learnerProgressHistory.completedAt),
      asc(learnerProgressHistory.id)
    );

  return rows.map(toCompletionRecord);
}

export async function completeLearningItemForUser(
  userId: string,
  rawInput: unknown
): Promise<CompletionRecord> {
  const safeUserId = requireUserId(userId);
  const input: CompletionInput = parseCompletionInput(rawInput);
  const published = resolvePublishedLearningItem(input);

  if (input.course !== undefined && input.course !== published.course) {
    throw new Error("Completion course does not match the published item.");
  }

  if (
    input.projectId !== undefined &&
    input.projectId !== published.projectId
  ) {
    throw new Error("Completion project does not match the published item.");
  }

  if (
    input.verificationLevel !== undefined &&
    input.verificationLevel !== "exercise-validated"
  ) {
    throw new Error("Unsupported completion verification level.");
  }

  if (input.verificationLevel !== "exercise-validated") {
    throw new Error("Completion requires exercise validation.");
  }

  const db = getDb();

  await db
    .insert(learnerProgressHistory)
    .values({
      userId: safeUserId,
      itemType: published.itemType,
      itemId: published.itemId,
      course: published.course,
      projectId: published.projectId,
      verificationLevel: input.verificationLevel ?? null
    })
    .onConflictDoNothing({
      target: [
        learnerProgressHistory.userId,
        learnerProgressHistory.itemType,
        learnerProgressHistory.itemId
      ]
    });

  const [row] = await db
    .select()
    .from(learnerProgressHistory)
    .where(
      and(
        eq(learnerProgressHistory.userId, safeUserId),
        eq(learnerProgressHistory.itemType, published.itemType),
        eq(learnerProgressHistory.itemId, published.itemId)
      )
    )
    .limit(1);

  if (!row) {
    throw new Error("Completion could not be stored.");
  }

  return toCompletionRecord(row);
}
