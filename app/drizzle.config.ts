import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./api/_lib/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  }
});
