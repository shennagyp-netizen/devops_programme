import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const programme = await readFile(
  path.join(root, "app", "src", "data", "programme.ts"),
  "utf8"
);
const lessons = await readFile(
  path.join(root, "app", "src", "data", "courseLessons.ts"),
  "utf8"
);
const diagnostics = await readFile(
  path.join(root, "app", "src", "data", "diagnostics.ts"),
  "utf8"
);
const projects = await readFile(
  path.join(root, "app", "src", "data", "projects.ts"),
  "utf8"
);
const handsOn = await readFile(
  path.join(root, "app", "src", "data", "handsOn.ts"),
  "utf8"
);

const expectedSections = ["B-F1","B-F2","B-A1","B-A2","B-A3","B-A4","B-A5"];
const expectedProjects = ["B1","B2","B3"];

let failed = false;

for (const sectionId of expectedSections) {
  if (!programme.includes(`id: "${sectionId}"`)) {
    failed = true;
    console.error(`Beginner section ${sectionId} is missing from programme.ts.`);
  }

  if (!lessons.includes(`sectionId: "${sectionId}"`)) {
    failed = true;
    console.error(`Beginner section ${sectionId} has no lesson coverage.`);
  }

  if (!diagnostics.includes(`sectionId: "${sectionId}"`)) {
    failed = true;
    console.error(`Beginner section ${sectionId} has no prerequisite diagnostic.`);
  }

  const bankPath = path.join(root, "exams", "items", "beginner", `${sectionId}.json`);
  try {
    await access(bankPath);
    const bank = JSON.parse(await readFile(bankPath, "utf8"));
    if (bank.items.length !== 40) {
      failed = true;
      console.error(`Beginner ${sectionId} bank has ${bank.items.length} items; expected 40.`);
    }
  } catch (error) {
    failed = true;
    console.error(`Beginner ${sectionId} assessment bank is missing or invalid: ${error.message}`);
  }
}

for (const projectId of expectedProjects) {
  if (!projects.includes(`id: "${projectId}"`)) {
    failed = true;
    console.error(`Beginner project ${projectId} is missing.`);
  }
}

if (!handsOn.includes("export function getHandsOnTask")) {
  failed = true;
  console.error("Beginner hands-on resolver is missing.");
}

const beginnerLessonIds = [...lessons.matchAll(/id: "([B][0-9]+\.[0-9]+)",/g)].map((match) => match[1]);
const podcastDir = path.join(root, "podcasts", "beginner");
for (const lessonId of beginnerLessonIds) {
  try {
    await access(path.join(podcastDir, `${lessonId}.txt`));
  } catch {
    failed = true;
    console.error(`Beginner podcast script missing for ${lessonId}.`);
  }
}

if (beginnerLessonIds.length !== 10) {
  failed = true;
  console.error(`Beginner lesson count is ${beginnerLessonIds.length}; expected 10 in the authored core.`);
}

if (failed) process.exit(1);

console.log(
  `Beginner completeness check passed: ${beginnerLessonIds.length} lessons, ${expectedSections.length} sections, ${expectedProjects.length} projects, ${expectedSections.length} diagnostics and ${expectedSections.length} pilot banks.`
);
