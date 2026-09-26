import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { getDb } from "./db";
import { learnerAssessmentAttempts, type LearnerAssessmentAttempt } from "./schema";
import { requireCurrentUser } from "./auth";\nimport { assessmentPool } from "../../data/assessmentBanks";
import {
  getSectionAssessments,
  type AssessmentFamily,
  type AssessmentItem,
  type CourseLevel
} from "../data/assessment";
import { generateAssessmentForm } from "../../assessment/formGenerator";
import {
  attemptExpiresAt,
  publicAssessmentItem,
  scoreAssessment,
  type AssessmentAnswer,
  type AssessmentResult
} from "../../assessment/operational";

let assessmentSchemaReady = false;

async function ensureAssessmentSchema() {
  if (assessmentSchemaReady) return;

  await getDb().execute(sql.raw(`
    CREATE TABLE IF NOT EXISTS "learner_assessment_attempts" (
      "id" uuid PRIMARY KEY NOT NULL,
      "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
      "form_id" text NOT NULL,
      "course_id" text NOT NULL,
      "section_id" text NOT NULL,
      "family" text NOT NULL,
      "seed" text NOT NULL,
      "started_at" timestamptz NOT NULL,
      "expires_at" timestamptz NOT NULL,
      "submitted_at" timestamptz,
      "status" text NOT NULL,
      "answered_count" integer NOT NULL DEFAULT 0,
      "auto_scored_count" integer NOT NULL DEFAULT 0,
      "correct_count" integer NOT NULL DEFAULT 0,
      "auto_score_percent" integer,
      "review_required_count" integer NOT NULL DEFAULT 0,
      "answers_json" text
    )
  `));

  await getDb().execute(sql.raw(`
    CREATE INDEX IF NOT EXISTS "learner_assessment_attempts_user_form_idx"
      ON "learner_assessment_attempts" ("user_id", "form_id")
  `));

  await getDb().execute(sql.raw(`
    CREATE INDEX IF NOT EXISTS "learner_assessment_attempts_user_started_idx"
      ON "learner_assessment_attempts" ("user_id", "started_at")
  `));

  assessmentSchemaReady = true;
}

async function loadPool(
  courseId: CourseLevel,
  sectionId: string
): Promise<AssessmentItem[]> {
  const file = path.resolve(
    process.cwd(),
    "..",
    "exams",
    "items",
    courseDirectory[courseId],
    `${sectionId}.json`
  );

  const source = JSON.parse(await readFile(file, "utf8")) as {
    sectionId: string;
    items: Omit<AssessmentItem, "sectionId">[];
  };

  if (source.sectionId !== sectionId) {
    throw new Error("Assessment bank section mismatch.");
  }

  return source.items.map((item) => ({ ...item, sectionId }));
}

function assertSelection(
  courseId: CourseLevel,
  sectionId: string,
  family: AssessmentFamily
) {
  const blueprint = getSectionAssessments(courseId, sectionId).find(
    (candidate) => candidate.family === family
  );

  if (!blueprint) throw new Error("Assessment selection is not available.");
  return blueprint;
}

export async function startAssessment(
  courseId: CourseLevel,
  sectionId: string,
  family: AssessmentFamily
) {
  const user = await requireCurrentUser();
  await ensureAssessmentSchema();

  const blueprint = assertSelection(courseId, sectionId, family);
  const pool = await loadPool(courseId, sectionId);
  const seed = randomUUID();
  const form = generateAssessmentForm(blueprint, pool, seed);
  const startedAt = new Date();
  const expiresAt = attemptExpiresAt(startedAt, blueprint.expectedMinutes);
  const attemptId = randomUUID();

  await getDb().insert(learnerAssessmentAttempts).values({
    id: attemptId,
    userId: user.id,
    formId: form.formId,
    courseId,
    sectionId,
    family,
    seed,
    startedAt,
    expiresAt,
    status: "in-progress",
    answeredCount: 0,
    autoScoredCount: 0,
    correctCount: 0,
    autoScorePercent: null,
    reviewRequiredCount: 0,
    answersJson: null
  });

  return {
    attemptId,
    formId: form.formId,
    courseId,
    sectionId,
    family,
    startedAt: startedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    expectedMinutes: blueprint.expectedMinutes,
    itemCount: form.items.length,
    items: form.items.map(publicAssessmentItem)
  };
}

export async function submitAssessment(
  attemptId: string,
  answers: AssessmentAnswer[]
): Promise<{ attempt: LearnerAssessmentAttempt; result: AssessmentResult }> {
  const user = await requireCurrentUser();
  await ensureAssessmentSchema();

  const [attempt] = await getDb()
    .select()
    .from(learnerAssessmentAttempts)
    .where(
      and(
        eq(learnerAssessmentAttempts.id, attemptId),
        eq(learnerAssessmentAttempts.userId, user.id)
      )
    )
    .limit(1);

  if (!attempt) throw new Error("Assessment attempt not found.");
  if (attempt.status !== "in-progress") {
    throw new Error("Assessment attempt has already been submitted.");
  }

  const blueprint = assertSelection(
    attempt.courseId as CourseLevel,
    attempt.sectionId,
    attempt.family as AssessmentFamily
  );
  const pool = await loadPool(
    attempt.courseId as CourseLevel,
    attempt.sectionId
  );
  const form = generateAssessmentForm(blueprint, pool, attempt.seed);
  const result = scoreAssessment(form.items, answers);
  const submittedAt = new Date();
  const finalStatus =
    submittedAt.getTime() > attempt.expiresAt.getTime()
      ? "submitted-late"
      : result.status;

  const [updated] = await getDb()
    .update(learnerAssessmentAttempts)
    .set({
      submittedAt,
      status: finalStatus,
      answeredCount: result.answeredCount,
      autoScoredCount: result.autoScoredCount,
      correctCount: result.correctCount,
      autoScorePercent: result.autoScorePercent,
      reviewRequiredCount: result.reviewRequiredCount,
      answersJson: JSON.stringify(answers)
    })
    .where(
      and(
        eq(learnerAssessmentAttempts.id, attempt.id),
        eq(learnerAssessmentAttempts.userId, user.id)
      )
    )
    .returning();

  if (!updated) throw new Error("Assessment result could not be stored.");

  return {
    attempt: updated,
    result: {
      ...result,
      status:
        finalStatus === "submitted-late"
          ? "submitted-review-required"
          : result.status
    }
  };
}
