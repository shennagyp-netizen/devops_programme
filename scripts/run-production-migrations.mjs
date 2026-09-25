import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(new URL("../app/package.json", import.meta.url));
const { Pool } = require("pg");

if (process.env.VERCEL_ENV !== "production") {
  console.log("Production database migration: skipped outside Vercel production.");
  process.exit(0);
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for the production migration gate.");
}

const migrationsDirectory = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "app",
  "drizzle",
  "migrations"
);

const migrationFiles = (await readdir(migrationsDirectory))
  .filter((file) => /^\d+_.+\.sql$/.test(file))
  .sort();

const pool = new Pool({
  connectionString,
  max: 1,
  connectionTimeoutMillis: 10_000
});

try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "_devops_programme_migrations" (
      "filename" text PRIMARY KEY,
      "applied_at" timestamptz NOT NULL DEFAULT now()
    )
  `);

  for (const filename of migrationFiles) {
    const result = await pool.query(
      'SELECT 1 FROM "_devops_programme_migrations" WHERE "filename" = $1',
      [filename]
    );

    if (result.rowCount) {
      continue;
    }

    const sql = await readFile(join(migrationsDirectory, filename), "utf8");

    await pool.query("BEGIN");
    try {
      await pool.query(sql);
      await pool.query(
        'INSERT INTO "_devops_programme_migrations" ("filename") VALUES ($1)',
        [filename]
      );
      await pool.query("COMMIT");
      console.log(`Applied production migration: ${filename}`);
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    }
  }

  console.log(
    `Production database migration gate passed: ${migrationFiles.length} migration file(s) checked.`
  );
} finally {
  await pool.end();
}
