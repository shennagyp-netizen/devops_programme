CREATE TABLE IF NOT EXISTS "assessment_instances" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "course_id" text NOT NULL,
  "section_id" text NOT NULL,
  "family" text NOT NULL,
  "form_id" text NOT NULL,
  "seed" text NOT NULL,
  "item_snapshot_json" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "submitted_at" timestamptz,
  CONSTRAINT "assessment_instances_status_ck"
    CHECK ("status" IN ('active', 'submitted', 'expired')),
  CONSTRAINT "assessment_instances_family_ck"
    CHECK ("family" IN ('conceptual', 'diagnostic', 'hands-on'))
);

CREATE INDEX IF NOT EXISTS "assessment_instances_user_status_idx"
  ON "assessment_instances" ("user_id", "status", "created_at");

CREATE TABLE IF NOT EXISTS "assessment_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "instance_id" uuid NOT NULL REFERENCES "assessment_instances"("id") ON DELETE CASCADE,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "answers_json" text NOT NULL,
  "auto_score" integer NOT NULL,
  "auto_scorable_count" integer NOT NULL,
  "outcome" text NOT NULL,
  "submitted_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "assessment_attempts_outcome_ck"
    CHECK ("outcome" IN ('scored', 'pending-review')),
  CONSTRAINT "assessment_attempts_score_ck"
    CHECK (
      "auto_score" >= 0
      AND "auto_scorable_count" >= 0
      AND "auto_score" <= "auto_scorable_count"
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS "assessment_attempts_instance_user_uq"
  ON "assessment_attempts" ("instance_id", "user_id");

CREATE INDEX IF NOT EXISTS "assessment_attempts_user_submitted_idx"
  ON "assessment_attempts" ("user_id", "submitted_at");
