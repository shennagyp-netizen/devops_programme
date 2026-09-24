import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const lessons = await readFile(
  path.join(root, "app", "src", "data", "courseLessons.ts"),
  "utf8"
);
const intermediateLessons = await readFile(
  path.join(root, "app", "src", "data", "curriculum.ts"),
  "utf8"
);
const handsOn = await readFile(
  path.join(root, "app", "src", "data", "handsOn.ts"),
  "utf8"
);

let failed = false;

const lessonIds = new Set([
  ...[...lessons.matchAll(/id:\s*"([A-Z0-9.]+)",\s*title:/g)].map((match) => match[1]),
  ...[...intermediateLessons.matchAll(/"id":\s*"([A-Z0-9.]+)"/g)].map((match) => match[1])
]);

const overrideIds = [
  ...handsOn.matchAll(/^\s{2}"([A-Z0-9.]+)":\s*\{/gm)
].map((match) => match[1]);

for (const id of overrideIds) {
  if (!lessonIds.has(id)) {
    failed = true;
    console.error(\`Hands-on override targets unknown lesson \${id}.\`);
  }
}

const duplicateIds = overrideIds.filter(
  (id, index) => overrideIds.indexOf(id) !== index
);

if (duplicateIds.length) {
  failed = true;
  console.error(
    \`Duplicate hands-on override IDs: \${[...new Set(duplicateIds)].join(", ")}\`
  );
}

if (!handsOn.includes('verificationLevel: "structured"')) {
  failed = true;
  console.error("Structured verification coverage is missing.");
}

const defaultFieldCount =
  handsOn.match(/id:\s*"(observation|change|failure|recovery)",/g)?.length ?? 0;

if (defaultFieldCount !== 4) {
  failed = true;
  console.error(
    \`Default hands-on evidence contract must define four fields; found \${defaultFieldCount}.\`
  );
}

if (!handsOn.includes("export function validateHandsOnEvidence")) {
  failed = true;
  console.error("Hands-on evidence validator is missing.");
}

if (!handsOn.includes("Default task coverage uses structured evidence validation.")) {
  failed = true;
  console.error("Default tasks must explicitly state their current verification boundary.");
}

if (failed) process.exit(1);

console.log(
  \`Hands-on contract check passed: \${lessonIds.size} lessons covered by the default/override task resolver; \${overrideIds.length} authored overrides.\`
);
