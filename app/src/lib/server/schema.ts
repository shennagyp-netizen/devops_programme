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


export const learnerAssessmentAttempts = pgTable(
  "learner_assessment_attempts",
  {
    id: uuid("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    formId: text("form_id").notNull(),
    courseId: text("course_id").notNull(),
    sectionId: text("section_id").notNull(),
    family: text("family").notNull(),
    seed: text("seed").notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    status: text("status").notNull(),
    answeredCount: integer("answered_count").notNull().default(0),
    autoScoredCount: integer("auto_scored_count").notNull().default(0),
    correctCount: integer("correct_count").notNull().default(0),
    autoScorePercent: integer("auto_score_percent"),
    reviewRequiredCount: integer("review_required_count").notNull().default(0),
    answersJson: text("answers_json")
  },
  (table) => ({
    userFormIndex: index("learner_assessment_attempts_user_form_idx").on(
      table.userId,
      table.formId
    ),
    userStartedIndex: index("learner_assessment_attempts_user_started_idx").on(
      table.userId,
      table.startedAt
    ),
    statusCheck: check(
      "learner_assessment_attempts_status_ck",
      sql.raw(
        "status IN ('in-progress', 'scored', 'submitted-review-required', 'submitted-late')"
      )
    )
  })
);

export type LearnerAssessmentAttempt =
  typeof learnerAssessmentAttempts.$inferSelect;

export type AuthUser = typeof authUsers.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type LearnerProgressHistory =
  typeof learnerProgressHistory.$inferSelect;
export type NewLearnerProgressHistory =
  typeof learnerProgressHistory.$inferInsert;
