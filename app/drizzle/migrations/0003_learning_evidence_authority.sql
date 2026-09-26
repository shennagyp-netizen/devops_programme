ALTER TABLE "learner_progress_history"
  ADD COLUMN IF NOT EXISTS "evidence_digest" text;

ALTER TABLE "learner_progress_history"
  ADD COLUMN IF NOT EXISTS "authority_version" text;

CREATE TABLE IF NOT EXISTS "learning_evidence" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "item_id" text NOT NULL,
  "kind" text NOT NULL,
  "verification_level" text NOT NULL,
  "verifier_id" text NOT NULL,
  "verification_ref" text NOT NULL,
  "task_id" text,
  "summary" text NOT NULL,
  "payload" jsonb NOT NULL,
  "payload_hash" text NOT NULL,
  "verified_at" timestamptz DEFAULT now() NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "learning_evidence_verification_level_ck"
    CHECK ("verification_level" IN ('self-report', 'structured', 'machine-verified'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "learning_evidence_user_item_kind_hash_uq"
  ON "learning_evidence" ("user_id", "item_id", "kind", "payload_hash");

CREATE INDEX IF NOT EXISTS "learning_evidence_user_item_idx"
  ON "learning_evidence" ("user_id", "item_id", "created_at");

CREATE TABLE IF NOT EXISTS "verification_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "item_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "status" text NOT NULL,
  "request_hash" text NOT NULL,
  "evidence_id" uuid REFERENCES "learning_evidence"("id") ON DELETE SET NULL,
  "started_at" timestamptz NOT NULL,
  "completed_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "verification_attempts_status_ck"
    CHECK ("status" IN ('accepted', 'rejected', 'failed'))
);

CREATE INDEX IF NOT EXISTS "verification_attempts_user_item_idx"
  ON "verification_attempts" ("user_id", "item_id", "created_at");

CREATE TABLE IF NOT EXISTS "evidence_attestations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "evidence_id" uuid NOT NULL REFERENCES "learning_evidence"("id") ON DELETE CASCADE,
  "provider_id" text NOT NULL,
  "attestation_type" text NOT NULL,
  "claims_digest" text NOT NULL,
  "issued_at" timestamptz DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "evidence_attestations_evidence_provider_type_uq"
  ON "evidence_attestations" ("evidence_id", "provider_id", "attestation_type");
