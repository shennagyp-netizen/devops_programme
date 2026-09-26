import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(path) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const route = read("src/app/api/tutor/route.ts");
const contract = read("src/data/tutorContract.ts");
const component = read("src/components/TutorCoach.tsx");
const env = read(".env.example");
const authMigration = read("drizzle/migrations/0001_self_hosted_auth.sql");
const tutorMigration = read("drizzle/migrations/0003_tutor.sql");
const rateLimitMigration = read("drizzle/migrations/0004_tutor_rate_limit.sql");


const required = [
  ["route is authenticated", route.includes("getCurrentUser")],
  ["route uses the AI Gateway server key", route.includes("AI_GATEWAY_API_KEY")],
  ["route normalizes provider output", route.includes("parseTutorResponse")],
  ["route atomically reserves tutor requests", route.includes("reserveTutorRequest")],
  ["tutor reservation uses a transaction lock", read("src/lib/server/tutor.ts").includes("pg_advisory_xact_lock")],
  ["client verification is marked untrusted", route.includes("Learner-reported verification summary (untrusted)")],
  ["rate limit reservation migration exists", rateLimitMigration.includes("tutor_rate_limit_reservations")],
  ["contract locks retry authority", contract.includes("canUnlockRetry: false")],
  ["contract locks certification authority", contract.includes("canCertify: false")],
  ["component labels learner evidence unverified", component.includes("treated as unverified")],
  ["server key is not public", !env.includes("NEXT_PUBLIC_AI_GATEWAY_API_KEY")],
  ["tutor uses a versioned migration", tutorMigration.includes("CREATE TABLE IF NOT EXISTS \"tutor_sessions\"")],
  ["historical auth migration stays auth-only", !authMigration.includes("\"tutor_sessions\"")]
];

const failures = required.filter(([, ok]) => !ok).map(([name]) => name);

if (failures.length) {
  console.error("Tutor contract failures:");
  for (const failure of failures) console.error(" - " + failure);
  process.exit(1);
}

console.log("Tutor contract: green");
