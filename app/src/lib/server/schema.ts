import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid
} from "drizzle-orm/pg-core";

export const authUsers = pgTable(
  "auth_users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    emailUnique: uniqueIndex("auth_users_email_uq").on(table.email)
  })
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    tokenUnique: uniqueIndex("auth_sessions_token_hash_uq").on(table.tokenHash),
    userIndex: index("auth_sessions_user_id_idx").on(table.userId)
  })
);

export const learnerMasteryAttempts = pgTable(
  "learner_mastery_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    taskId: text("task_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    outcome: text("outcome").notNull(),
    stage: text("stage").notNull(),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    userTaskAttemptUnique: uniqueIndex(
      "learner_mastery_attempts_user_task_attempt_uq"
    ).on(table.userId, table.taskId, table.attemptNumber),
    userLessonIndex: index("learner_mastery_attempts_user_lesson_idx").on(
      table.userId,
      table.lessonId,
      table.createdAt
    ),
    outcomeCheck: check(
      "learner_mastery_attempts_outcome_ck",
      sql.raw("outcome IN ('failure', 'mastered')")
    ),
    attemptNumberCheck: check(
      "learner_mastery_attempts_attempt_number_ck",
      sql.raw("attempt_number >= 1")
    )
  })
);

export const learnerProgressHistory = pgTable(
  "learner_progress_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    course: text("course"),
    projectId: text("project_id"),
    verificationLevel: text("verification_level"),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    userItemUnique: uniqueIndex("learner_progress_history_user_item_uq").on(
      table.userId,
      table.itemType,
      table.itemId
    ),
    itemTypeCheck: check(
      "learner_progress_history_item_type_ck",
      sql`item_type IN ('lesson', 'assignment', 'question', 'project')`
    )
  })
);

export const tutorSessions = pgTable(
  "tutor_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    projectId: text("project_id").notNull(),
    mode: text("mode").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    userLessonIndex: index("tutor_sessions_user_lesson_idx").on(
      table.userId,
      table.lessonId,
      table.lastActiveAt
    ),
    modeCheck: check(
      "tutor_sessions_mode_ck",
      sql.raw(
        "mode IN ('teaching', 'failure-investigation', 'assignment-coach', 'incident-review', 'design-defense', 'oral-assessment')"
      )
    )
  })
);

export const tutorRateLimitReservations = pgTable(
  "tutor_rate_limit_reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    reservedAt: timestamp("reserved_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    userReservedAtIndex: index("tutor_rate_limit_reservations_user_reserved_at_idx").on(
      table.userId,
      table.reservedAt
    )
  })
);

export const tutorMessages = pgTable(
  "tutor_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => tutorSessions.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    content: text("content").notNull(),
    turnIndex: integer("turn_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => ({
    sessionIndex: index("tutor_messages_session_idx").on(
      table.sessionId,
      table.createdAt,
      table.id
    ),
    roleCheck: check(
      "tutor_messages_role_ck",
      sql.raw("role IN ('user', 'assistant')")
    ),
    turnIndexCheck: check(
      "tutor_messages_turn_index_ck",
      sql.raw("turn_index >= 0")
    )
  })
);

export type AuthUser = typeof authUsers.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type LearnerProgressHistory =
  typeof learnerProgressHistory.$inferSelect;
export type NewLearnerProgressHistory =
  typeof learnerProgressHistory.$inferInsert;
export type TutorSession = typeof tutorSessions.$inferSelect;
export type TutorMessageRow = typeof tutorMessages.$inferSelect;
