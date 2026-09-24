import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const files = {
  schema: "../app/api/_lib/schema.ts",
  api: "../app/api/progress.ts",
  migration: "../app/drizzle/migrations/0000_learner_completions.sql",
  client: "../app/src/data/learnerProgress.ts",
  app: "../app/src/App.tsx",
  lesson: "../app/src/components/LessonPanel.tsx",
  evidence: "../app/src/data/evidence.ts"
};

async function read(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), "utf8");
}

const [schema, api, migration, client, app, lesson, evidence] = await Promise.all(
  Object.values(files).map(read)
);

assert.match(schema, /pgTable(s*"learner_progress_history"/);
assert.match(schema, /learner_id/);
assert.match(schema, /item_type/);
assert.match(schema, /item_id/);
assert.match(schema, /learner_progress_history_learner_item_uq/);

assert.match(migration, /CREATE TABLE IF NOT EXISTS "learner_progress_history"/);
assert.match(
  migration,
  /UNIQUE INDEX IF NOT EXISTS "learner_progress_history_learner_item_uq"/
);

assert.match(api, /learnerProgressHistory/);
assert.match(api, /onConflictDoUpdate/);
assert.match(api, /orderBy(asc(learnerProgressHistory.completedAt)/);
assert.doesNotMatch(api, /stdout|stderr|machineEnvelope|attempt/);
assert.doesNotMatch(api, /method === "DELETE"/);

assert.match(client, /listCompletionHistory/);
assert.match(client, /completeLearningItem/);
assert.doesNotMatch(client, /uncompleteLearningItem/);

assert.match(app, /listCompletionHistory/);
assert.match(app, /completeLesson/);
assert.doesNotMatch(app, /uncompleteLearningItem/);

assert.doesNotMatch(lesson, /localStorage\.setItem[\s\S]*machineEnvelope/);
assert.doesNotMatch(evidence, /envelope: JSON\.stringify\(input\.envelope\)/);

console.log("Learner progress contract: PASS");
console.log("Completion history is one row per learner/item, ordered by server completion time.");
