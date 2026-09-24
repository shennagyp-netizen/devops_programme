CREATE TABLE IF NOT EXISTS "learner_progress_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "item_type" text NOT NULL,
  "item_id" text NOT NULL,
  "course" text,
  "project_id" text,
  "verification_level" text,
  "completed_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "learner_progress_history_item_type_ck"
    CHECK ("item_type" IN ('lesson', 'assignment', 'question', 'project'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "learner_progress_history_user_item_uq"
  ON "learner_progress_history" ("user_id", "item_type", "item_id");
