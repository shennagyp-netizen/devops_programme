ALTER TABLE "learner_progress_history"
  ADD CONSTRAINT "learner_progress_history_user_fk"
  FOREIGN KEY ("user_id") REFERENCES "auth_users"("id")
  ON DELETE CASCADE
  NOT VALID;
