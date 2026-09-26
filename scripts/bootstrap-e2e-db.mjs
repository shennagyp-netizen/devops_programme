#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Client } = require("../app/node_modules/pg");

const root = path.resolve(new URL("..", import.meta.url).pathname);
const migrationDir = path.join(root, "app", "drizzle", "migrations");

const files = [
  "0000_learner_completions.sql",
  "0001_self_hosted_auth.sql",
  "0002_learner_mastery_attempts.sql",
  "0003_learner_assessment_attempts.sql"
];

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

try {
  await client.connect();

  for (const file of files) {
    const sql = await readFile(path.join(migrationDir, file), "utf8");
    await client.query(sql);
    console.log("Applied E2E schema migration:", file);
  }
} catch (error) {
  console.error("E2E database bootstrap failed:", error);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
