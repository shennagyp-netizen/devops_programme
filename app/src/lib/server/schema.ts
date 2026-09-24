import { pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

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
    )
  })
);

export type LearnerProgressHistory =
  typeof learnerProgressHistory.$inferSelect;
export type NewLearnerProgressHistory =
  typeof learnerProgressHistory.$inferInsert;
