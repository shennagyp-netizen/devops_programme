CREATE TABLE IF NOT EXISTS "tutor_rate_limit_reservations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "reserved_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "tutor_rate_limit_reservations_user_reserved_at_idx"
  ON "tutor_rate_limit_reservations" ("user_id", "reserved_at");
