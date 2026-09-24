import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const diagnosticsPath = path.join(root, "app", "src", "data", "diagnostics.ts");
const lessonsPath = path.join(root, "app", "src", "data", "courseLessons.ts");

const diagnostics = await readFile(diagnosticsPath, "utf8");
const lessons = await readFile(lessonsPath, "utf8");

let failed = false;

const questionBlocks = [...diagnostics.matchAll(/id:s*"([A-Z0-9.-]+)",s*prompt:/g)];
if (questionBlocks.length === 0) {
  failed = true;
  console.error("No diagnostic questions found.");
}

const correctOptions = [...diagnostics.matchAll(/correctOption:s*(d+)/g)].map((m) =>
  Number(m[1])
);
if (correctOptions.length !== questionBlocks.length) {
  failed = true;
  console.error(
    `Diagnostic question/correct-option count mismatch: ${questionBlocks.length} vs ${correctOptions.length}`
  );
}

if (correctOptions.some((index) => index < 0 || index > 3)) {
  failed = true;
  console.error("A diagnostic correctOption is outside the supported option range.");
}

const sectionIds = [...diagnostics.matchAll(/sectionId:s*"([^"]+)"/g)].map((m) => m[1]);
for (const sectionId of new Set(sectionIds)) {
  if (!diagnostics.includes(`sectionId: "${sectionId}"`)) {
    failed = true;
    console.error(`Diagnostic section ${sectionId} has no definition block.`);
  }
}

const remediationIds = [...diagnostics.matchAll(/remediationLessonIds:s*[([sS]*?)]/g)]
  .flatMap((m) => [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]));

for (const lessonId of remediationIds) {
  if (!lessons.includes(`id: "${lessonId}"`)) {
    failed = true;
    console.error(`Diagnostic remediation lesson ${lessonId} does not exist in courseLessons.ts`);
  }
}

if (!diagnostics.includes('if (ratio >= 0.9) return "skip-theory"')) {
  failed = true;
  console.error("Skip-theory threshold is missing or changed.");
}
if (!diagnostics.includes('if (ratio >= 0.7) return "condense-theory"')) {
  failed = true;
  console.error("Condense-theory threshold is missing or changed.");
}

if (failed) process.exit(1);

console.log(
  `Diagnostic contract check passed: ${questionBlocks.length} questions and ${new Set(remediationIds).size} remediation lessons.`
);
