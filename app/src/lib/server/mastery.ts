"use server";

import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { requireCurrentUser } from "./auth";
import { getDb } from "./db";
import { learnerMasteryAttempts } from "./schema";
import {
  parseMasteryAttemptInput,
  type MasteryAttemptInput,
  type MasteryAttemptResult
} from "../mastery-contract";

let masterySchemaReady = false;

async function ensureMasterySchema() {
  if (masterySchemaReady) return;

  const db = getDb();

  await db.execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "learner_mastery_attempts" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
      "lesson_id" text NOT NULL,
      "assignment_id" text NOT NULL,
      "attempt_number" integer NOT NULL,
      "failure_class" text NOT NULL,
      "failed_fields" text NOT NULL DEFAULT '[]',
      "remediation_methods" text NOT NULL DEFAULT '[]',
      "remediation_completed" boolean NOT NULL DEFAULT false,
      "reattempt_result" text NOT NULL DEFAULT 'pending',
      "created_at" timestamptz DEFAULT now() NOT NULL,
      CONSTRAINT "learner_mastery_attempts_attempt_ck" CHECK ("attempt_number" > 0),
      CONSTRAINT "learner_mastery_attempts_result_ck" CHECK ("reattempt_result" IN ('failed', 'pending', 'passed'))
    )
  `);

  await db.execute(sql.raw(`
    CREATE INDEX IF NOT EXISTS "learner_mastery_attempts_user_assignment_idx"
      ON "learner_mastery_attempts" ("user_id", "lesson_id", "assignment_id")
  `);

  masterySchemaReady = true;
}

function requireAttemptId(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > 128) {
    throw new Error("attemptId must be a non-empty string.");
  }
  return value.trim();
}

export async function createMasteryAttempt(
  userId: string,
  rawInput: unknown
) {
  await ensureMasterySchema();
  const input: MasteryAttemptInput = parseMasteryAttemptInput(rawInput);

  const [row] = await getDb()
    .insert(learnerMasteryAttempts)
    .values({
      userId,
      lessonId: input.lessonId,
      assignmentId: input.assignmentId,
      attemptNumber: input.attemptNumber,
      failureClass: input.failureClass,
      failedFields: JSON.stringify(input.failedFields),
      remediationMethods: JSON.stringify(input.remediationMethods),
      remediationCompleted: false,
      reattemptResult: "pending"
    })
    .returning({ id: learnerMasteryAttempts.id });

  if (!row) throw new Error("Mastery attempt could not be stored.");
  return row.id;
}

export async function completeMasteryRemediation(userId: string, rawAttemptId: unknown) {
  await ensureMasterySchema();
  const attemptId = requireAttemptId(rawAttemptId);

  await getDb()
    .update(learnerMasteryAttempts)
    .set({ remediationCompleted: true })
    .where(
      and(
        eq(learnerMasteryAttempts.id, attemptId),
        eq(learnerMasteryAttempts.userId, userId)
      )
    );

  return { attemptId, remediationCompleted: true };
}

export async function finishMasteryAttempt(
  userId: string,
  rawAttemptId: unknown,
  result: MasteryAttemptResult
) {
  await ensureMasterySchema();
  const attemptId = requireAttemptId(rawAttemptId);

  if (!["failed", "pending", "passed"].includes(result)) {
    throw new Error("Invalid mastery attempt result.");
  }

  await getDb()
    .update(learnerMasteryAttempts)
    .set({ reattemptResult: result })
    .where(
      and(
        eq(learnerMasteryAttempts.id, attemptId),
        eq(learnerMasteryAttempts.userId, userId)
      )
    );

  return { attemptId, reattemptResult: result };
}
