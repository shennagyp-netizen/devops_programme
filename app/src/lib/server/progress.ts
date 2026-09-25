import { and, asc, desc, eq } from "drizzle-orm";
import { getDb } from "./db";
import { learnerMasteryAttempts, learnerProgressHistory } from "./schema";
import {
  parseCompletionInput,
  type CompletionInput,
  type CompletionRecord
} from "../progress-contract";
import {
  parseMasteryAttemptInput,
  type MasteryAttemptInput,
  type MasteryAttemptRecord
} from "../mastery-contract";


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
  const db = getDb();

  await db
    .insert(learnerProgressHistory)
    .values({
      userId: safeUserId,
      itemType: input.itemType,
      itemId: input.itemId,
      course: input.course ?? null,
      projectId: input.projectId ?? null,
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
        eq(learnerProgressHistory.itemType, input.itemType),
        eq(learnerProgressHistory.itemId, input.itemId)
      )
    )
    .limit(1);

  if (!row) {
    throw new Error("Completion could not be stored.");
  }

  return toCompletionRecord(row);
}

function toMasteryAttemptRecord(
  item: typeof learnerMasteryAttempts.$inferSelect
): MasteryAttemptRecord {
  return {
    id: item.id,
    lessonId: item.lessonId,
    taskId: item.taskId,
    attemptNumber: item.attemptNumber,
    outcome: item.outcome as MasteryAttemptRecord["outcome"],
    stage: item.stage,
    summary: item.summary,
    createdAt: item.createdAt.toISOString()
  };
}

export async function listMasteryHistoryForUser(
  userId: string
): Promise<MasteryAttemptRecord[]> {
  const safeUserId = requireUserId(userId);
  const db = getDb();

  const rows = await db
    .select()
    .from(learnerMasteryAttempts)
    .where(eq(learnerMasteryAttempts.userId, safeUserId))
    .orderBy(
      asc(learnerMasteryAttempts.createdAt),
      asc(learnerMasteryAttempts.id)
    );

  return rows.map(toMasteryAttemptRecord);
}

export async function recordMasteryAttemptForUser(
  userId: string,
  rawInput: unknown
): Promise<MasteryAttemptRecord> {
  const safeUserId = requireUserId(userId);
  const input: MasteryAttemptInput = parseMasteryAttemptInput(rawInput);
  const db = getDb();

  const [latest] = await db
    .select({ attemptNumber: learnerMasteryAttempts.attemptNumber })
    .from(learnerMasteryAttempts)
    .where(
      and(
        eq(learnerMasteryAttempts.userId, safeUserId),
        eq(learnerMasteryAttempts.taskId, input.taskId)
      )
    )
    .orderBy(desc(learnerMasteryAttempts.attemptNumber))
    .limit(1);

  const attemptNumber = (latest?.attemptNumber ?? 0) + 1;

  const [row] = await db
    .insert(learnerMasteryAttempts)
    .values({
      userId: safeUserId,
      lessonId: input.lessonId,
      taskId: input.taskId,
      attemptNumber,
      outcome: input.outcome,
      stage: input.stage,
      summary: input.summary
    })
    .returning();

  if (!row) {
    throw new Error("Mastery attempt could not be stored.");
  }

  return toMasteryAttemptRecord(row);
}
