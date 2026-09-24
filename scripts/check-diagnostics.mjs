import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const diagnosticsPath = path.join(root, "app", "src", "data", "diagnostics.ts");
const lessonsPath = path.join(root, "app", "src", "data", "courseLessons.ts");
const programmePath = path.join(root, "app", "src", "data", "programme.ts");

const diagnostics = await readFile(diagnosticsPath, "utf8");
const lessons = await readFile(lessonsPath, "utf8");
const programme = await readFile(programmePath, "utf8");

let failed = false;

const definitionBlocks = [...diagnostics.matchAll(
  /sectionId:\s*"([^"]+)",\s*course:\s*"([^"]+)",\s*title:\s*"([^"]+)"/g
)].map((match) => ({
  sectionId: match[1],
  course: match[2],
  title: match[3]
}));

if (!definitionBlocks.length) {
  failed = true;
  console.error("No diagnostic definitions found.");
}

const sectionIds = new Set(
  [...programme.matchAll(/id:\s*"([^"]+)",\s*title:/g)].map((match) => match[1])
);

for (const definition of definitionBlocks) {
  if (!sectionIds.has(definition.sectionId)) {
    failed = true;
    console.error(
      `Diagnostic ${definition.sectionId} does not exist in programme.ts.`
    );
  }

  if (!["beginner", "intermediate", "advanced"].includes(definition.course)) {
    failed = true;
    console.error(
      `Diagnostic ${definition.sectionId} has unknown course ${definition.course}.`
    );
  }
}

const questionBlocks = [...diagnostics.matchAll(
  /id:\s*"([A-Z0-9.-]+)",\s*prompt:/g
)];

const correctOptions = [...diagnostics.matchAll(
  /correctOption:\s*(\d+)/g
)].map((match) => Number(match[1]));

if (questionBlocks.length === 0) {
  failed = true;
  console.error("No diagnostic questions found.");
}

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

const remediationIds = [...diagnostics.matchAll(
  /remediationLessonIds:\s*\[([\s\S]*?)\]/g
)].flatMap((match) =>
  [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])
);

for (const lessonId of remediationIds) {
  if (!lessons.includes(`id: "${lessonId}"`)) {
    failed = true;
    console.error(
      `Diagnostic remediation lesson ${lessonId} does not exist in courseLessons.ts`
    );
  }
}

const prerequisiteIds = [...diagnostics.matchAll(
  /prerequisiteLessonIds:\s*\[([\s\S]*?)\]/g
)].flatMap((match) =>
  [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1])
);

for (const lessonId of prerequisiteIds) {
  if (!lessons.includes(`id: "${lessonId}"`)) {
    failed = true;
    console.error(
      `Diagnostic prerequisite lesson ${lessonId} does not exist in courseLessons.ts`
    );
  }
}


const sectionsWithLessons = new Set(
  [...lessons.matchAll(/sectionId:\s*"([^"]+)"/g)].map((match) => match[1])
);

for (const definition of definitionBlocks) {
  if (!sectionsWithLessons.has(definition.sectionId)) {
    failed = true;
    console.error(
      `Diagnostic ${definition.sectionId} has no lesson coverage.`
    );
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
  `Diagnostic contract check passed: ${definitionBlocks.length} sections, ${questionBlocks.length} questions, ${new Set(prerequisiteIds).size} prerequisite lessons, and ${new Set(remediationIds).size} remediation lessons.`
);
