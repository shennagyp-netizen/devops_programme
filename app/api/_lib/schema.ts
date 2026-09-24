import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const learnerProgressHistory = pgTable(
  "learner_progress_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    learnerId: text("learner_id").notNull(),
    itemType: text("item_type").notNull(),
    itemId: text("item_id").notNull(),
    course: text("course"),
    projectId: text("project_id"),
    verificationLevel: text("verification_level"),
    completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    learnerItemUnique: uniqueIndex("learner_progress_history_learner_item_uq").on(
      table.learnerId,
      table.itemType,
      table.itemId
    ),
  })
);

export type LearnerCompletion = typeof learnerCompletions.$inferSelect;
export type NewLearnerCompletion = typeof learnerCompletions.$inferInsert;
