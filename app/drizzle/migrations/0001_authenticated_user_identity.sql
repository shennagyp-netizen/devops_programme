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
