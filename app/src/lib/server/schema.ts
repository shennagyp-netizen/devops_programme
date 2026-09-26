import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({ emailUnique: uniqueIndex("auth_users_email_uq").on(table.email) })
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    tokenUnique: uniqueIndex("auth_sessions_token_hash_uq").on(table.tokenHash),
    userIndex: index("auth_sessions_user_id_idx").on(table.userId)
  })
);

export const learningEvidence = pgTable(
  "learning_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    kind: text("kind").notNull(),
    verificationLevel: text("verification_level").notNull(),
    verifierId: text("verifier_id").notNull(),
    verificationRef: text("verification_ref").notNull(),
    taskId: text("task_id"),
    summary: text("summary").notNull(),
    payload: jsonb("payload").$type<Record<string, string>>().notNull(),
    payloadHash: text("payload_hash").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    uniqueEvidence: uniqueIndex("learning_evidence_user_item_kind_hash_uq").on(
      table.userId, table.itemId, table.kind, table.payloadHash
    ),
    userItemIndex: index("learning_evidence_user_item_idx").on(
      table.userId, table.itemId, table.createdAt
    ),
    verificationLevelCheck: check(
      "learning_evidence_verification_level_ck",
      sql\`"verification_level" IN ('self-report', 'structured', 'machine-verified')\`
    )
  })
);

export const verificationAttempts = pgTable(
  "verification_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    providerId: text("provider_id").notNull(),
    status: text("status").notNull(),
    requestHash: text("request_hash").notNull(),
    evidenceId: uuid("evidence_id").references(() => learningEvidence.id, { onDelete: "set null" }),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userItemIndex: index("verification_attempts_user_item_idx").on(
      table.userId, table.itemId, table.createdAt
    ),
    statusCheck: check(
      "verification_attempts_status_ck",
      sql\`"status" IN ('accepted', 'rejected', 'failed')\`
    )
  })
);

export const evidenceAttestations = pgTable(
  "evidence_attestations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    evidenceId: uuid("evidence_id").notNull().references(() => learningEvidence.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(),
    attestationType: text("attestation_type").notNull(),
    claimsDigest: text("claims_digest").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    uniqueAttestation: uniqueIndex("evidence_attestations_evidence_provider_type_uq").on(
      table.evidenceId, table.providerId, table.attestationType
    )
  })
);

export const learnerMasteryAttempts = pgTable(
  "learner_mastery_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id").notNull(),
    taskId: text("task_id").notNull(),
    attemptNumber: integer("attempt_number").notNull(),
    outcome: text("outcome").notNull(),
    stage: text("stage").notNull(),
    summary: text("summary").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userTaskAttemptUnique: uniqueIndex("learner_mastery_attempts_user_task_attempt_uq").on(
      table.userId, table.taskId, table.attemptNumber
    ),
    userLessonIndex: index("learner_mastery_attempts_user_lesson_idx").on(
      table.userId, table.lessonId, table.createdAt
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
    evidenceDigest: text("evidence_digest"),
    authorityVersion: text("authority_version"),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userItemUnique: uniqueIndex("learner_progress_history_user_item_uq").on(
      table.userId, table.itemType, table.itemId
    ),
    itemTypeCheck: check(
      "learner_progress_history_item_type_ck",
      sql\`item_type IN ('lesson', 'assignment', 'question', 'project')\`
    )
  })
);

export type AuthUser = typeof authUsers.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type LearningEvidence = typeof learningEvidence.$inferSelect;
export type VerificationAttempt = typeof verificationAttempts.$inferSelect;
export type EvidenceAttestation = typeof evidenceAttestations.$inferSelect;
export type LearnerProgressHistory = typeof learnerProgressHistory.$inferSelect;
export type NewLearnerProgressHistory = typeof learnerProgressHistory.$inferInsert;
