import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const lessonsPath = path.join(root, "app", "src", "data", "courseLessons.ts");
const intermediateLessonsPath = path.join(root, "app", "src", "data", "curriculum.ts");
const intermediateMappingPath = path.join(root, "app", "src", "data", "courseLessons.ts");
const projectsPath = path.join(root, "app", "src", "data", "projects.ts");

const lessons = await readFile(lessonsPath, "utf8");
const intermediateLessons = await readFile(intermediateLessonsPath, "utf8");
const projects = await readFile(projectsPath, "utf8");
const intermediateMapping = await readFile(intermediateMappingPath, "utf8");

let failed = false;

const projectIds = new Set(
  [...projects.matchAll(/id:\s*"([A-Z][A-Z0-9.-]*)",\s*course:/g)].map((match) => match[1])
);

const lessonProjectIds = new Set(
  [...lessons.matchAll(/projectId:\s*"([^"]+)"/g)].map((match) => match[1])
);

for (const projectId of [...intermediateMapping.matchAll(/return\s+"(I[1-3])"/g)].map((match) => match[1])) {
  lessonProjectIds.add(projectId);
}

for (const lessonProjectId of lessonProjectIds) {
  if (!projectIds.has(lessonProjectId)) {
    failed = true;
    console.error(
      `Lesson metadata points to undefined project ${lessonProjectId}.`
    );
  }
}

for (const projectId of projectIds) {
  if (!lessonProjectIds.has(projectId)) {
    failed = true;
    console.error(`Project ${projectId} has no literal lesson metadata coverage.`);
  }

  const projectStart = projects.indexOf(`id: "${projectId}",`);
  const projectEnd = projects.indexOf(`\n  },`, projectStart);
  const projectBlock = projectStart >= 0 ? projects.slice(projectStart, projectEnd >= 0 ? projectEnd : projects.length) : "";
  if (!projectBlock.includes("changeHistory: [") || !projectBlock.includes("incidentHistory: [")) {
    failed = true;
    console.error(`Project ${projectId} must define change and incident history.`);
  }
}

const intermediateProjectIds = ["I1", "I2", "I3"];
const allIntermediateLessonIds = [
  ...intermediateLessons.matchAll(/"id":\s*"(D\d+\.\d+)"/g)
].map((match) => match[1]);

if (allIntermediateLessonIds.length !== 32) {
  failed = true;
  console.error(
    `Intermediate project mapping source contains ${allIntermediateLessonIds.length} lessons; expected 32.`
  );
}

for (const projectId of intermediateProjectIds) {
  if (!intermediateMapping.includes(`return "${projectId}"`)) {
    failed = true;
    console.error(`Intermediate project mapping has no ${projectId} return branch.`);
  }
}

if (failed) process.exit(1);

console.log(
  `Project contract check passed: ${projectIds.size} projects and ${lessonProjectIds.size} referenced projects.`
);
