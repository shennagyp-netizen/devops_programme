CREATE TABLE IF NOT EXISTS "verification_provider_keys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "provider_id" text NOT NULL,
  "key_id" text NOT NULL,
  "algorithm" text NOT NULL,
  "public_key" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "revoked_at" timestamptz,
  CONSTRAINT "verification_provider_keys_algorithm_ck"
    CHECK ("algorithm" = 'ed25519')
);

CREATE UNIQUE INDEX IF NOT EXISTS "verification_provider_keys_user_provider_key_uq"
  ON "verification_provider_keys" ("user_id", "provider_id", "key_id");

CREATE INDEX IF NOT EXISTS "verification_provider_keys_user_provider_idx"
  ON "verification_provider_keys" ("user_id", "provider_id", "created_at");

CREATE TABLE IF NOT EXISTS "verification_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "item_id" text NOT NULL,
  "evidence_kind" text NOT NULL,
  "provider_id" text NOT NULL,
  "nonce" text NOT NULL,
  "nonce_hash" text NOT NULL,
  "issued_at" timestamptz NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "consumed_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "verification_attempts_user_item_idx"
  ON "verification_attempts" ("user_id", "item_id", "created_at");

CREATE INDEX IF NOT EXISTS "verification_attempts_user_provider_idx"
  ON "verification_attempts" ("user_id", "provider_id", "created_at");

ALTER TABLE "learner_verified_evidence"
  ADD COLUMN IF NOT EXISTS "provider_key_id" text;

ALTER TABLE "learner_verified_evidence"
  ADD COLUMN IF NOT EXISTS "verification_attempt_id" uuid;

ALTER TABLE "learner_verified_evidence"
  ADD COLUMN IF NOT EXISTS "signature" text;

ALTER TABLE "learner_verified_evidence"
  ADD CONSTRAINT "learner_verified_evidence_attempt_fk"
  FOREIGN KEY ("verification_attempt_id")
  REFERENCES "verification_attempts"("id")
  ON DELETE SET NULL;
