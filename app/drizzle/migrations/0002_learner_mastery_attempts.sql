CREATE TABLE IF NOT EXISTS "learner_mastery_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "lesson_id" text NOT NULL,
  "task_id" text NOT NULL,
  "attempt_number" integer NOT NULL,
  "outcome" text NOT NULL,
  "stage" text NOT NULL,
  "summary" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "learner_mastery_attempts_outcome_ck"
    CHECK ("outcome" IN ('failure', 'mastered')),
  CONSTRAINT "learner_mastery_attempts_attempt_number_ck"
    CHECK ("attempt_number" >= 1)
);

CREATE UNIQUE INDEX IF NOT EXISTS "learner_mastery_attempts_user_task_attempt_uq"
  ON "learner_mastery_attempts" ("user_id", "task_id", "attempt_number");

CREATE INDEX IF NOT EXISTS "learner_mastery_attempts_user_lesson_idx"
  ON "learner_mastery_attempts" ("user_id", "lesson_id", "created_at");
