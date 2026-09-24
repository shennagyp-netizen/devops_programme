import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const files = {
  package: "../app/package.json",
  env: "../app/.env.example",
  schema: "../app/src/lib/server/schema.ts",
  migration: "../app/drizzle/migrations/0000_learner_completions.sql",
  progress: "../app/src/lib/server/progress.ts",
  catalog: "../app/src/lib/server/learning-catalog.ts",
  action: "../app/src/app/actions/progress.ts",
  contract: "../app/src/lib/progress-contract.ts",
  app: "../app/src/App.tsx",
  page: "../app/src/app/page.tsx",
  layout: "../app/src/app/layout.tsx",
  proxy: "../app/src/proxy.ts",
  signIn: "../app/src/app/sign-in/[[...sign-in]]/page.tsx",
  signUp: "../app/src/app/sign-up/[[...sign-up]]/page.tsx",
  gitignore: "../.gitignore",
  vitest: "../app/vitest.config.ts",
  terminalAgent: "../scripts/devops-terminal-agent.mjs",
  browserTerminalAgent: "../app/src/data/localTerminalAgent.ts"
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
assert.equal(packageJson.engines.node, ">=22.23.3");
assert.ok(packageJson.dependencies.next);
assert.ok(packageJson.dependencies["@clerk/nextjs"]);
assert.equal(packageJson.dependencies.react, "19.2.8");
assert.equal(packageJson.dependencies["react-dom"], "19.2.8");
assert.equal(packageJson.dependencies.next, "16.3.6");
assert.equal(packageJson.dependencies["@clerk/nextjs"], "7.9.4");
assert.equal(packageJson.devDependencies.vite, undefined);
assert.equal(packageJson.devDependencies["@vitejs/plugin-react"], undefined);

assert.match(content.env, /DATABASE_URL=/);
assert.match(content.env, /NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=/);
assert.match(content.env, /CLERK_SECRET_KEY=/);
assert.match(content.gitignore, /^\.env$/m);
assert.match(content.gitignore, /^\.env\.\*$/m);
assert.doesNotMatch(content.gitignore, /\n/);

assert.match(content.schema, /userId\("user_id"\)/);
assert.match(content.schema, /learner_progress_history_user_item_uq/);
assert.match(content.schema, /item_type IN/);
assert.doesNotMatch(content.schema, /learnerId/);

assert.match(content.migration, /"user_id" text NOT NULL/);
assert.match(content.migration, /learner_progress_history_user_item_uq/);
assert.match(content.migration, /learner_progress_history_item_type_ck/);

assert.match(content.progress, /onConflictDoNothing/);
assert.match(content.progress, /resolvePublishedLearningItem/);
assert.match(content.catalog, /export function resolvePublishedLearningItem/);
assert.match(content.progress, /orderBy\([\s\S]*completedAt/);
assert.doesNotMatch(content.progress, /stdout|stderr|attempt|machineEnvelope/);

assert.match(content.action, /"use server"/);
assert.match(content.action, /await auth\(\)/);
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

assert.match(content.page, /await auth\(\)/);
assert.match(content.page, /listCompletionHistoryForUser/);
assert.match(content.page, /redirect\("\/sign-in"\)/);

assert.match(content.layout, /<body>/);
assert.match(content.layout, /<ClerkProvider>/);
assert.ok(content.layout.indexOf("<body>") < content.layout.indexOf("<ClerkProvider>"));

assert.match(content.proxy, /clerkMiddleware/);

assert.doesNotMatch(content.vitest, /@vite\/plugin-react/);
assert.match(content.terminalAgent, /DEVOPS_TERMINAL_ALLOWED_ORIGINS/);
assert.match(content.terminalAgent, /MAX_COMMAND_TIMEOUT/);
assert.match(content.terminalAgent, /SIGKILL/);
assert.match(content.terminalAgent, /isAllowedOrigin/);
assert.match(content.terminalAgent, /429/);
assert.match(content.browserTerminalAgent, /sessionStorage/);
assert.doesNotMatch(content.browserTerminalAgent, /localStorage\.setItem\(TOKEN_KEY/);
assert.match(content.signIn, /<SignIn/);
assert.match(content.signUp, /<SignUp/);

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
console.log("Single architecture: Next.js App Router + Clerk + Drizzle/PostgreSQL + Server Actions.");
