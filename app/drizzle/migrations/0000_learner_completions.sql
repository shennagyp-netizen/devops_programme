CREATE TABLE IF NOT EXISTS "learner_progress_history" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "learner_id" text NOT NULL,
  "item_type" text NOT NULL,
  "item_id" text NOT NULL,
  "course" text,
  "project_id" text,
  "verification_level" text,
  "completed_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "learner_progress_history_learner_item_uq"
  ON "learner_progress_history" ("learner_id", "item_type", "item_id");
