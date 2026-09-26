CREATE TABLE IF NOT EXISTS "learner_verified_evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "item_id" text NOT NULL,
  "kind" text NOT NULL,
  "verifier_id" text NOT NULL,
  "verification_ref" text NOT NULL,
  "attestation_digest" text NOT NULL,
  "verified_at" timestamptz DEFAULT now() NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "learner_verified_evidence_attestation_digest_ck"
    CHECK (char_length("attestation_digest") > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS "learner_verified_evidence_user_item_ref_uq"
  ON "learner_verified_evidence" ("user_id", "item_id", "verification_ref");

CREATE INDEX IF NOT EXISTS "learner_verified_evidence_user_item_idx"
  ON "learner_verified_evidence" ("user_id", "item_id", "verified_at");

CREATE TABLE IF NOT EXISTS "learner_completion_evidence" (
  "completion_id" uuid NOT NULL REFERENCES "learner_progress_history"("id") ON DELETE CASCADE,
  "evidence_id" uuid NOT NULL REFERENCES "learner_verified_evidence"("id") ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS "learner_completion_evidence_uq"
  ON "learner_completion_evidence" ("completion_id", "evidence_id");

CREATE INDEX IF NOT EXISTS "learner_completion_evidence_evidence_idx"
  ON "learner_completion_evidence" ("evidence_id");
