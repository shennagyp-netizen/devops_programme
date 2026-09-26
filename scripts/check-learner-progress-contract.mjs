import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const files = {
  app: "../app/src/App.tsx",
  learnPage: "../app/src/app/learn/page.tsx",
  localProgress: "../app/src/data/localProgress.ts",
  lessonPanel: "../app/src/components/LessonPanel.tsx",
  tutorContract: "../app/src/lib/tutor-contract.ts",
  package: "../app/package.json"
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

const [app, learnPage, localProgress, lessonPanel, tutorContract, packageText] =
  await Promise.all(Object.values(files).map(read));

const packageJson = JSON.parse(packageText);

assert.match(app, /export default function App()/);
assert.match(app, /completeLocalLearningItem/);
assert.match(app, /readLocalCompletionHistory/);
assert.doesNotMatch(app, /currentUser|logoutAction|completeLearningItemAction|Server Action/i);
assert.doesNotMatch(app, /initialCompletionHistory|initialMasteryHistory/);

assert.match(learnPage, /return <App />/);
assert.doesNotMatch(learnPage, /requireCurrentUser|redirect\(|listCompletionHistoryForUser|Server Action/);

assert.match(localProgress, /localStorage/);
assert.match(localProgress, /verificationLevel: "structured"/);
assert.doesNotMatch(localProgress, /userId|learnerId|session|token/i);

assert.doesNotMatch(lessonPanel, /localTerminalAgent|getLocalTerminalToken|pairing token|recordMasteryAttemptAction/);
assert.match(lessonPanel, /browser-local evidence/);

assert.match(tutorContract, /export type TutorRole = "user"/);
assert.doesNotMatch(tutorContract, /"assistant"/);

for (const obsolete of [
  "../app/src/proxy.ts",
  "../app/src/lib/server/auth.ts",
  "../app/src/lib/server/progress.ts",
  "../app/src/lib/server/schema.ts",
  "../app/src/lib/server/db.ts",
  "../app/src/app/actions/auth.ts",
  "../app/src/app/actions/progress.ts",
  "../app/src/components/AuthForm.tsx"
]) {
  assert.equal(await exists(obsolete), false, "Obsolete MVP auth layer still exists: " + obsolete);
}

assert.equal(packageJson.engines.node, ">=22.12.0");

console.log("MVP architecture contract: PASS");
console.log("Single learner UI: Next.js/React + browser-local progress, no account/session/token authority.");
