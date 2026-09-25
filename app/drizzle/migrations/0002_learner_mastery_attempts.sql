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
);

CREATE INDEX IF NOT EXISTS "learner_mastery_attempts_user_assignment_idx"
  ON "learner_mastery_attempts" ("user_id", "lesson_id", "assignment_id");
