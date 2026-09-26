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
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    emailUnique: uniqueIndex("auth_users_email_uq").on(table.email)
  })
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
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    course: text("course"),
    projectId: text("project_id"),
    verificationLevel: text("verification_level"),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userItemUnique: uniqueIndex("learner_progress_history_user_item_uq").on(
      table.userId, table.itemType, table.itemId
    ),
    itemTypeCheck: check(
      "learner_progress_history_item_type_ck",
      sql`item_type IN ('lesson', 'assignment', 'question', 'project')`
    )
  })
);

export const learnerVerifiedEvidence = pgTable(
  "learner_verified_evidence",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    kind: text("kind").notNull(),
    verifierId: text("verifier_id").notNull(),
    verificationRef: text("verification_ref").notNull(),
    attestationDigest: text("attestation_digest").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userItemVerificationUnique: uniqueIndex("learner_verified_evidence_user_item_ref_uq").on(
      table.userId, table.itemId, table.verificationRef
    ),
    userItemIndex: index("learner_verified_evidence_user_item_idx").on(
      table.userId, table.itemId, table.verifiedAt
    ),
    digestCheck: check(
      "learner_verified_evidence_attestation_digest_ck",
      sql`attestation_digest ~ '^sha256:[0-9a-fA-F]{64}$'`
    )
  })
);

export const learnerCompletionEvidence = pgTable(
  "learner_completion_evidence",
  {
    completionId: uuid("completion_id").notNull().references(() => learnerProgressHistory.id, { onDelete: "cascade" }),
    evidenceId: uuid("evidence_id").notNull().references(() => learnerVerifiedEvidence.id, { onDelete: "restrict" })
  },
  (table) => ({
    completionEvidenceUnique: uniqueIndex("learner_completion_evidence_uq").on(
      table.completionId, table.evidenceId
    ),
    evidenceIndex: index("learner_completion_evidence_evidence_idx").on(
      table.evidenceId
    )
  })
);

export const verificationProviderKeys = pgTable(
  "verification_provider_keys",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull(),
    keyId: text("key_id").notNull(),
    algorithm: text("algorithm").notNull(),
    publicKey: text("public_key").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true })
  },
  (table) => ({
    providerKeyUnique: uniqueIndex("verification_provider_keys_user_provider_key_uq").on(
      table.userId, table.providerId, table.keyId
    ),
    activeKeyIndex: index("verification_provider_keys_user_provider_idx").on(
      table.userId, table.providerId, table.createdAt
    ),
    algorithmCheck: check(
      "verification_provider_keys_algorithm_ck",
      sql`"algorithm" = 'ed25519'`
    )
  })
);

export const verificationAttempts = pgTable(
  "verification_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    itemId: text("item_id").notNull(),
    evidenceKind: text("evidence_kind").notNull(),
    providerId: text("provider_id").notNull(),
    nonceHash: text("nonce_hash").notNull(),
    issuedAt: timestamp("issued_at", { withTimezone: true }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull()
  },
  (table) => ({
    userItemIndex: index("verification_attempts_user_item_idx").on(
      table.userId, table.itemId, table.createdAt
    ),
    providerIndex: index("verification_attempts_user_provider_idx").on(
      table.userId, table.providerId, table.createdAt
    )
  })
);

export type AuthUser = typeof authUsers.$inferSelect;
export type AuthSession = typeof authSessions.$inferSelect;
export type LearnerProgressHistory = typeof learnerProgressHistory.$inferSelect;
export type NewLearnerProgressHistory = typeof learnerProgressHistory.$inferInsert;
