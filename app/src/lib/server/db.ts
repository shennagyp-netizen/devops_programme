import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as {
  devopsProgrammePool?: Pool;
};

function getPool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  globalForDb.devopsProgrammePool ??= new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000
  });

  return globalForDb.devopsProgrammePool;
}

export function getDb() {
  return drizzle(getPool(), { schema });
}
