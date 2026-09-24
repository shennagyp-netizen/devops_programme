ALTER TABLE IF EXISTS "learner_progress_history"
  RENAME COLUMN "learner_id" TO "user_id";

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'learner_progress_history_learner_item_uq'
  ) THEN
    ALTER INDEX "learner_progress_history_learner_item_uq"
      RENAME TO "learner_progress_history_user_item_uq";
  END IF;
END $$;


DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'learner_progress_history_item_type_ck'
  ) THEN
    ALTER TABLE "learner_progress_history"
      ADD CONSTRAINT "learner_progress_history_item_type_ck"
      CHECK ("item_type" IN ('lesson', 'assignment', 'question', 'project'));
  END IF;
END $$;
