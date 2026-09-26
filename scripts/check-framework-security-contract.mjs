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
const provider = await source("app/src/lib/server/verificationProviderAuthority.ts");
const localAgent = await source("scripts/devops-terminal-agent.mjs");
const sshRunner = await source("scripts/run-remote-runtime-task.mjs");
const verificationRequest = await source("app/src/framework/verificationRequest.ts");
const masteryAction = await source("app/src/app/actions/progress.ts");
const masteryRequest = await source("app/src/framework/masteryRequest.ts");
const masteryAuthority = await source("app/src/lib/server/masteryAuthority.ts");
const assessmentAction = await source("app/src/app/actions/assessment.ts");
const assessmentRequest = await source("app/src/framework/assessmentRequest.ts");
const assessmentAuthority = await source("app/src/lib/server/assessmentAuthority.ts");
const assessmentSchema = await source("app/src/lib/server/schema.ts");
const assessmentMigration = await source("app/drizzle/migrations/0006_assessment_authority.sql");
const verificationAction = await source("app/src/app/actions/verification.ts");
const app = await source("app/src/App.tsx");
const verification = await source("app/src/framework/verification.ts");
const schema = await source("app/src/lib/server/schema.ts");
const migration = await source("app/drizzle/migrations/0003_learning_evidence_authority.sql");
const verificationMigration = await source("app/drizzle/migrations/0005_verification_provider_authority.sql");

assert.match(action, /parseCompleteLearningItemCommand/);
assert.match(action, /completeLearningItemForUser/);
assert.doesNotMatch(action, /verificationLevel/);
assert.doesNotMatch(action, /itemType/);
assert.match(masteryAction, /parseMasteryCommand/);
assert.match(masteryAction, /recordAuthoritativeMasteryAttemptForUser/);
assert.match(masteryRequest, /MASTERY_STAGES/);
assert.doesNotMatch(masteryRequest, /outcome/);
assert.match(masteryAuthority, /evaluateLearningTransition/);
assert.match(masteryAuthority, /const outcome = decision\.accepted \? "mastered" : "failure"/);
assert.match(masteryAuthority, /attemptNumber/);
assert.match(masteryAuthority, /onConflictDoNothing/);
assert.match(assessmentAction, /issueAssessmentForUser/);
assert.match(assessmentAction, /submitAssessmentForUser/);
assert.match(assessmentRequest, /Unsupported field/);
assert.match(assessmentRequest, /answers/);
assert.match(assessmentAuthority, /itemSnapshotJson/);
assert.match(assessmentAuthority, /safeQuestion/);
assert.match(assessmentAuthority, /correctOption/);
assert.match(assessmentAuthority, /Assessment submission replay detected/);
assert.doesNotMatch(assessmentAuthority, /pass.?mark|70%|80%/i);
assert.match(assessmentSchema, /assessmentInstances/);
assert.match(assessmentSchema, /assessmentAttempts/);
assert.match(assessmentMigration, /assessment_instances/);
assert.match(assessmentMigration, /assessment_attempts/);

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
assert.match(verification, /PROVIDER_KEY_MISMATCH/);

assert.match(schema, /learnerVerifiedEvidence/);
assert.match(schema, /learnerCompletionEvidence/);
assert.match(migration, /learner_verified_evidence/);
assert.match(migration, /learner_completion_evidence/);
assert.match(migration, /attestation_digest/);

console.log("Framework security architecture contract: PASS — completion, provider attestation, and mastery boundaries.");

assert.match(provider, /registerTrustedProviderKey/);
assert.match(provider, /verifySignature/);
assert.match(provider, /verificationAttempts/);
assert.match(provider, /consumedAt/);
assert.match(provider, /isNull/);
assert.match(provider, /verificationSigningPayload/);
assert.match(provider, /ensureRuntimeVerificationTarget/);
assert.match(provider, /providerKeyId/);
assert.match(provider, /challengeProviderKeyId/);
assert.match(localAgent, /signVerificationAttestation/);
const providerCore = await source("scripts/verification-provider-core.mjs");
assert.match(providerCore, /providerKeyId/);
assert.doesNotMatch(localAgent, /send\(res, 200, envelope/);
assert.match(sshRunner, /signVerificationAttestation/);
assert.match(sshRunner, /challengeFile/);
assert.doesNotMatch(verificationAction, /registerTrustedProviderKey/);
assert.match(verificationAction, /requestVerificationChallengeAction/);
assert.match(verificationAction, /submitVerificationAttestationAction/);
assert.match(verificationRequest, /Unsupported field/);
assert.match(verificationRequest, /ed25519/);
assert.doesNotMatch(app, /recordMachineVerification/);
assert.match(schema, /verificationProviderKeys/);
assert.match(schema, /verificationAttempts/);
assert.match(schema, /providerKeyId/);
assert.match(schema, /providerKeyId/);
assert.match(schema, /verificationAttemptId/);
assert.match(schema, /signature/);
assert.match(verificationMigration, /verification_provider_keys/);
assert.match(verificationMigration, /verification_attempts/);
assert.match(verificationMigration, /provider_key_id/);
assert.match(verificationMigration, /learner_verified_evidence/);
assert.match(verificationMigration, /verification_attempt_id/);
assert.match(verificationMigration, /signature/);
