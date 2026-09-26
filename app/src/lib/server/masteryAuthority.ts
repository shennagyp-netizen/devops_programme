import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { learnerMasteryAttempts, learnerVerifiedEvidence } from "./schema";
import { findProgrammeLearningItem } from "./programmeAuthority";
import { courseLessons } from "../../data/courseLessons";
import { getHandsOnTask } from "../../data/handsOn";
import { evaluateLearningTransition } from "../../framework/authority";
import type { MasteryAttemptRecord } from "../mastery-contract";
import type { MasteryCommand } from "../../framework/masteryRequest";
import type { VerifiedEvidenceRecord } from "../../framework/contracts";

const MAX_ATTEMPT_NUMBER_RETRIES = 5;

function requireUserId(userId: string) {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new Error("Authentication required.");
  }

  return userId.trim();
}

function toVerifiedEvidenceRecord(
  row: typeof learnerVerifiedEvidence.$inferSelect
): VerifiedEvidenceRecord {
  return {
    id: row.id,
    learnerId: row.userId,
    itemId: row.itemId,
    kind: row.kind,
    verifierId: row.verifierId,
    verificationRef: row.verificationRef,
    attestationDigest: row.attestationDigest,
    verifiedAt: row.verifiedAt.toISOString()
  };
}

function toMasteryAttemptRecord(
  row: typeof learnerMasteryAttempts.$inferSelect
): MasteryAttemptRecord {
  return {
    id: row.id,
    lessonId: row.lessonId,
    taskId: row.taskId,
    attemptNumber: row.attemptNumber,
    outcome: row.outcome as MasteryAttemptRecord["outcome"],
    stage: row.stage,
    summary: row.summary,
    createdAt: row.createdAt.toISOString()
  };
}

function normalizeRefs(refs?: string[]) {
  return [
    ...new Set(
      (refs ?? [])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ];
}

export async function recordAuthoritativeMasteryAttemptForUser(
  userId: string,
  command: MasteryCommand
): Promise<MasteryAttemptRecord> {
  const learnerId = requireUserId(userId);
  const item = findProgrammeLearningItem(command.itemId);

  if (!item) {
    throw new Error("Unknown learning item.");
  }

  if (item.itemType !== "lesson") {
    throw new Error("Mastery attempts are only supported for learning lessons.");
  }

  const lesson = courseLessons.find((candidate) => candidate.id === item.id);
  if (!lesson) {
    throw new Error("Learning lesson definition is unavailable.");
  }

  const task = getHandsOnTask(lesson);
  const evidenceRefs = normalizeRefs(command.evidenceRefs);
  const db = getDb();

  return db.transaction(async (tx) => {
    const evidenceRows = evidenceRefs.length
      ? await tx
          .select()
          .from(learnerVerifiedEvidence)
          .where(
            and(
              eq(learnerVerifiedEvidence.userId, learnerId),
              inArray(learnerVerifiedEvidence.id, evidenceRefs)
            )
          )
      : [];

    const evidence = new Map(
      evidenceRows.map((row) => [row.id, toVerifiedEvidenceRecord(row)] as const)
    );

    const decision = evaluateLearningTransition(
      {
        learnerId,
        items: new Map([[item.id, item]]),
        verifiedEvidence: evidence
      },
      {
        itemId: item.id,
        evidenceRefs
      }
    );

    const outcome = decision.accepted ? "mastered" : "failure";

    for (let attempt = 0; attempt < MAX_ATTEMPT_NUMBER_RETRIES; attempt += 1) {
      const [latest] = await tx
        .select({ attemptNumber: learnerMasteryAttempts.attemptNumber })
        .from(learnerMasteryAttempts)
        .where(
          and(
            eq(learnerMasteryAttempts.userId, learnerId),
            eq(learnerMasteryAttempts.taskId, task.id)
          )
        )
        .orderBy(desc(learnerMasteryAttempts.attemptNumber))
        .limit(1);

      const attemptNumber = (latest?.attemptNumber ?? 0) + 1;

      const [row] = await tx
        .insert(learnerMasteryAttempts)
        .values({
          userId: learnerId,
          lessonId: item.id,
          taskId: task.id,
          attemptNumber,
          outcome,
          stage: command.stage,
          summary: command.summary
        })
        .onConflictDoNothing({
          target: [
            learnerMasteryAttempts.userId,
            learnerMasteryAttempts.taskId,
            learnerMasteryAttempts.attemptNumber
          ]
        })
        .returning();

      if (row) {
        return toMasteryAttemptRecord(row);
      }
    }

    throw new Error("Mastery attempt could not obtain a unique attempt number.");
  });
}
