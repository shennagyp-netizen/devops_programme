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
);

CREATE INDEX IF NOT EXISTS "learner_assessment_attempts_user_form_idx"
  ON "learner_assessment_attempts" ("user_id", "form_id");

CREATE INDEX IF NOT EXISTS "learner_assessment_attempts_user_started_idx"
  ON "learner_assessment_attempts" ("user_id", "started_at");

ALTER TABLE "learner_assessment_attempts"
  DROP CONSTRAINT IF EXISTS "learner_assessment_attempts_status_ck";

ALTER TABLE "learner_assessment_attempts"
  ADD CONSTRAINT "learner_assessment_attempts_status_ck"
  CHECK ("status" IN ('in-progress', 'scored', 'submitted-review-required', 'submitted-late'));
