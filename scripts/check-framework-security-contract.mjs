import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(new URL("..", import.meta.url).pathname);

async function source(relative) {
  return readFile(resolve(root, relative), "utf8");
}

const action = await source("app/src/app/actions/progress.ts");
const progress = await source("app/src/lib/server/progress.ts");
const authority = await source("app/src/lib/server/learningAuthority.ts");
const evidence = await source("app/src/lib/server/evidenceAuthority.ts");
const app = await source("app/src/App.tsx");
const verification = await source("app/src/framework/verification.ts");
const schema = await source("app/src/lib/server/schema.ts");
const migration = await source("app/drizzle/migrations/0003_learning_evidence_authority.sql");

assert.match(action, /parseCompleteLearningItemCommand/);
assert.match(action, /completeLearningItemForUser/);
assert.doesNotMatch(action, /verificationLevel/);
assert.doesNotMatch(action, /itemType/);

assert.doesNotMatch(progress, /export async function completeLearningItemForUser/);
assert.match(progress, /authoritative-evidence/);

assert.match(authority, /db\.transaction/);
assert.match(authority, /evaluateLearningTransition/);
assert.match(authority, /learnerCompletionEvidence/);
assert.match(authority, /authoritative-evidence/);
assert.match(authority, /\.update\(/);

assert.doesNotMatch(evidence, /"use client"/);
assert.match(evidence, /recordTrustedVerifiedEvidence/);
assert.match(evidence, /attestationDigest/);
assert.match(evidence, /Unknown learning item/);

assert.doesNotMatch(app, /lib\/server\/programmeAuthority/);
assert.match(app, /data\/programmeLearningItems/);

assert.match(verification, /validateVerificationAttestation/);
assert.match(verification, /CHALLENGE_MISMATCH/);
assert.match(verification, /ATTESTATION_EXPIRED/);
assert.match(verification, /INVALID_ATTESTATION_DIGEST/);

assert.match(schema, /learnerVerifiedEvidence/);
assert.match(schema, /learnerCompletionEvidence/);
assert.match(migration, /learner_verified_evidence/);
assert.match(migration, /learner_completion_evidence/);
assert.match(migration, /attestation_digest/);

console.log("Framework security architecture contract: PASS");
