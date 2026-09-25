import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const files = {
  package: "../app/package.json",
  env: "../app/.env.example",
  schema: "../app/src/lib/server/schema.ts",
  migration: "../app/drizzle/migrations/0000_learner_completions.sql",
  progress: "../app/src/lib/server/progress.ts",
  action: "../app/src/app/actions/progress.ts",
  contract: "../app/src/lib/progress-contract.ts",
  app: "../app/src/App.tsx",
  page: "../app/src/app/page.tsx",
  learnPage: "../app/src/app/learn/page.tsx",
  learnLayout: "../app/src/app/learn/layout.tsx",
  layout: "../app/src/app/layout.tsx",
  proxy: "../app/src/proxy.ts",
  signIn: "../app/src/app/sign-in/[[...sign-in]]/page.tsx",
  signUp: "../app/src/app/sign-up/[[...sign-up]]/page.tsx",
  boundaryTest: "../app/tests/integration/public-learning-boundary.integration.test.mjs",
  authSecurityTest: "../app/tests/unit/auth-security.test.mjs",
  authActionsTest: "../app/tests/integration/auth-actions.integration.test.mjs",
  authBoundaryTest: "../app/tests/integration/auth-boundary.integration.test.mjs",
  migrationAuth: "../app/drizzle/migrations/0001_self_hosted_auth.sql",
  gitignore: "../.gitignore"
};

async function read(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), "utf8");
}

async function exists(relativePath) {
  try {
    await access(new URL(relativePath, import.meta.url));
    return true;
  } catch {
    return false;
  }
}

const loaded = await Promise.all(
  Object.entries(files).map(async ([name, relativePath]) => [
    name,
    await read(relativePath)
  ])
);

const content = Object.fromEntries(loaded);
const packageJson = JSON.parse(content.package);

assert.equal(packageJson.scripts.dev, "npm run sync:podcasts && next dev");
assert.equal(packageJson.scripts.start, "next start");
assert.equal(packageJson.scripts.typecheck, "tsc -b");
assert.equal(packageJson.engines.node, ">=20.9.0");
assert.ok(packageJson.dependencies.next);
assert.equal(packageJson.dependencies["@clerk/nextjs"], undefined);
assert.equal(packageJson.dependencies.react, "19.2.8");
assert.equal(packageJson.dependencies["react-dom"], "19.2.8");
assert.equal(packageJson.dependencies.next, "16.3.6");
assert.equal(packageJson.devDependencies.vite, undefined);
assert.equal(packageJson.devDependencies["@vitejs/plugin-react"], undefined);

assert.match(content.env, /DATABASE_URL=/);
assert.doesNotMatch(content.env, /CLERK_/);
assert.match(content.env, /DATABASE_URL=/);
assert.match(content.gitignore, /\.env\*\.local/);

assert.match(content.schema, /userId\s*:\s*text\("user_id"\)/);
assert.match(content.schema, /learner_progress_history_user_item_uq/);
assert.match(content.schema, /item_type IN/);
assert.doesNotMatch(content.schema, /learnerId/);

assert.match(content.migration, /"user_id" text NOT NULL/);
assert.match(content.migration, /learner_progress_history_user_item_uq/);
assert.match(content.migration, /learner_progress_history_item_type_ck/);

assert.match(content.progress, /onConflictDoNothing/);
assert.match(content.progress, /orderBy\([\s\S]*completedAt/);
assert.doesNotMatch(content.progress, /stdout|stderr|attempt|machineEnvelope/);

assert.match(content.action, /"use server"/);
assert.match(content.action, /requireCurrentUser/);
assert.match(content.action, /Authentication required/);
assert.doesNotMatch(content.action, /learnerId/);

for (const itemType of ["lesson", "assignment", "question", "project"]) {
  assert.match(content.contract, new RegExp(itemType));
}
assert.doesNotMatch(content.contract, /getLearnerId|localStorage|learnerId/);

assert.match(content.app, /^"use client";/);
assert.match(content.app, /initialCompletionHistory/);
assert.match(content.app, /completeLearningItemAction/);
assert.match(content.app, /UserButton/);
assert.doesNotMatch(content.app, /getLearnerId|listCompletionHistory|\/api\/progress/);

assert.doesNotMatch(content.page, /await auth\(\)/);
assert.match(content.page, /href="\/learn"/);
assert.match(content.page, /DevOps/);

assert.match(content.learnPage, /requireCurrentUser/);
assert.match(content.learnPage, /listCompletionHistoryForUser/);
assert.match(content.learnPage, /redirect\("\/sign-in"\)/);

assert.match(content.layout, /<body>/);
assert.doesNotMatch(content.layout, /ClerkProvider/);

assert.doesNotMatch(content.learnLayout, /ClerkProvider|@clerk/);

assert.doesNotMatch(content.proxy, /clerk/i);
assert.match(content.proxy, /"\/learn\(\.\*\)"/);
assert.match(content.proxy, /devops_session/);

assert.match(content.signIn, /<AuthForm/);
assert.match(content.signUp, /<AuthForm/);
assert.doesNotMatch(content.signIn, /Clerk|<SignIn/);
assert.doesNotMatch(content.signUp, /Clerk|<SignUp/);
assert.match(content.boundaryTest, /first-party authenticated learner gateway boundary/);

assert.match(content.authSecurityTest, /hashes passwords without storing the plaintext/);
assert.match(content.authActionsTest, /generic login error/);
assert.match(content.authBoundaryTest, /no Clerk dependency/);
assert.match(content.migrationAuth, /auth_users/);
assert.match(content.migrationAuth, /auth_sessions/);

for (const obsolete of [
  "../app/vite.config.ts",
  "../app/index.html",
  "../app/src/main.tsx",
  "../app/src/data/learnerProgress.ts",
  "../app/api/progress.ts",
  "../api/progress.ts",
  "../app/api/_lib/schema.ts",
  "../app/api/_lib/db.ts"
]) {
  assert.equal(
    await exists(obsolete),
    false,
    "Obsolete architecture still exists: " + obsolete
  );
}

console.log("Learner progress/auth architecture contract: PASS");
console.log("Single architecture: Next.js App Router + first-party sessions + Drizzle/PostgreSQL + Server Actions.");
