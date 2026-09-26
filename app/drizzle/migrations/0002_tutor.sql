CREATE TABLE IF NOT EXISTS "tutor_sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,
  "lesson_id" text NOT NULL,
  "project_id" text NOT NULL,
  "mode" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "last_active_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "tutor_sessions_user_lesson_idx"
  ON "tutor_sessions" ("user_id", "lesson_id", "last_active_at");

CREATE TABLE IF NOT EXISTS "tutor_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "session_id" uuid NOT NULL REFERENCES "tutor_sessions"("id") ON DELETE CASCADE,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "turn_index" integer NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "tutor_messages_session_idx"
  ON "tutor_messages" ("session_id", "created_at", "id");
