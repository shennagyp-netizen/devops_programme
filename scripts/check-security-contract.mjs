import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const files = {
  package: "../app/package.json",
  progressContract: "../app/src/lib/progress-contract.ts",
  progressService: "../app/src/lib/server/progress.ts",
  learningCatalog: "../app/src/lib/server/learning-item-catalog.ts",
  action: "../app/src/app/actions/progress.ts",
  runtime: "../app/src/data/runtimeVerification.ts",
  localAgentClient: "../app/src/data/localTerminalAgent.ts",
  localAgent: "../scripts/devops-terminal-agent.mjs",
  nextConfig: "../app/next.config.ts",
  localRunner: "../scripts/run-runtime-task.mjs",
  remoteRunner: "../scripts/run-remote-runtime-task.mjs",
  remoteCore: "../scripts/remote-runtime-core.mjs",
  assessmentPanel: "../app/src/components/AssessmentPanel.tsx",
  evidence: "../app/src/data/evidence.ts",
  workflow: "../.github/workflows/app.yml"
};

async function load(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), "utf8");
}

const content = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([name, relativePath]) => [
      name,
      await load(relativePath)
    ])
  )
);

const packageJson = JSON.parse(content.package);

assert.equal(packageJson.scripts["check:security"], "node ../scripts/check-security-contract.mjs");

const examRoot = new URL("../exams/items/", import.meta.url);
const examFiles = (await readdir(examRoot, { recursive: true }))
  .filter((entry) => entry.endsWith(".json"))
  .map((entry) => new URL(entry, examRoot));

const actualQuestionIds = new Set();

for (const file of examFiles) {
  const bank = JSON.parse(await readFile(file, "utf8"));
  for (const item of bank.items ?? []) {
    actualQuestionIds.add(item.id);
  }

  const prefix = bank.sectionId.replaceAll("-", "");
  const familyLimits = { conceptual: 20, diagnostic: 12, "hands-on": 8 };
  const familyPrefixes = { conceptual: "C", diagnostic: "D", "hands-on": "H" };

  for (const [family, count] of Object.entries(familyLimits)) {
    for (let index = 1; index <= count; index += 1) {
      const expectedId =
        prefix + "-" + familyPrefixes[family] + "-" + String(index).padStart(3, "0");
      assert(
        actualQuestionIds.has(expectedId),
        "Missing canonical assessment question: " + expectedId
      );
    }
  }
}

assert.equal(actualQuestionIds.size, 840);


assert.match(content.action, /await auth\(\)/);
assert.match(content.action, /Authentication required/);

assert.match(content.learningCatalog, /resolveLearningItem/);
assert.match(content.learningCatalog, /hands-on-/);
assert.match(content.learningCatalog, /BF1-C-001|replaceAll/);

assert.match(content.progressService, /resolveLearningItem/);
assert.match(content.progressService, /verificationLevel: "self-report"/);
assert.doesNotMatch(content.progressService, /input\.course|input\.projectId|input\.verificationLevel/);

assert.doesNotMatch(content.progressContract, /verificationLevel/);
assert.doesNotMatch(content.progressContract, /projectId/);
assert.doesNotMatch(content.progressContract, /course/);

assert.match(content.runtime, /subtle\.digest\("SHA-256"/);
assert.match(content.runtime, /Ed25519/);
assert.match(content.runtime, /buildMachineAttestationPayload/);
assert.match(content.runtime, /requireAttestation/);
assert.match(content.runtime, /challenge does not match/);
assert.match(content.runtime, /attestation signature is invalid/);
assert.match(content.runtime, /stdoutHash does not match captured stdout/);
assert.match(content.runtime, /Runtime step result order does not match/);
assert.match(content.runtime, /starts before the previous runtime step completed/);

assert.doesNotMatch(content.localAgentClient, /localStorage/);
assert.match(content.localAgentClient, /let pairingToken/);
assert.match(content.localAgentClient, /attestationPublicKey/);
assert.match(content.localAgentClient, /did not publish an attestation public key/);

assert.match(content.localAgent, /ALLOWED_ORIGINS/);
assert.match(content.localAgent, /generateKeyPairSync\("ed25519"\)/);
assert.match(content.localAgent, /attestationPayload/);
assert.match(content.localAgent, /sign\(/);
assert.match(content.localAgent, /Invalid execution challenge/);
assert.match(content.localAgent, /Origin is not allowed/);
assert.doesNotMatch(content.localAgent, /Access-Control-Allow-Origin", origin \|\| "\*"/);

assert.match(content.nextConfig, /X-Content-Type-Options/);
assert.match(content.nextConfig, /Referrer-Policy/);
assert.match(content.nextConfig, /X-Frame-Options/);
assert.match(content.nextConfig, /Permissions-Policy/);

assert.match(content.localRunner, /shell: false/);
assert.match(content.remoteRunner, /shell: false/);
assert.match(content.remoteCore, /Invalid SSH user/);
assert.match(content.remoteCore, /Invalid SSH host/);
assert.match(content.evidence, /runtimeTaskForLesson/);
assert.match(content.evidence, /Runtime task is not the canonical published task/);
assert.match(content.evidence, /expectedChallenge/);
assert.match(content.evidence, /input\.source === "local-agent"/);
assert.match(content.evidence, /expectedAttestationPublicKey/);
assert.match(content.evidence, /verificationLevel: "structured"/);
assert.doesNotMatch(content.evidence, /input\.course|input\.projectId/);
assert.doesNotMatch(content.assessmentPanel, /exams\/items/);
assert.doesNotMatch(content.assessmentPanel, /correctOption|answerKey/);
assert.match(content.workflow, /npm run check:security/);

console.log("Security architecture contract: PASS");
console.log("Server-authoritative progress, runtime-integrity validation, loopback CORS, browser hardening and shell boundaries are present.");
