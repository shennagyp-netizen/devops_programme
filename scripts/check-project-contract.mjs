import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const lessonsPath = path.join(root, "app", "src", "data", "courseLessons.ts");
const projectsPath = path.join(root, "app", "src", "data", "projects.ts");

const lessons = await readFile(lessonsPath, "utf8");
const projects = await readFile(projectsPath, "utf8");

let failed = false;

const projectIds = new Set(
  [...projects.matchAll(/id:\s*"([A-Z][A-Z0-9.-]*)",\s*course:/g)].map((match) => match[1])
);

const lessonProjectIds = new Set(
  [...lessons.matchAll(/projectId:\s*"([^"]+)"/g)].map((match) => match[1])
);

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
    console.error(`Project ${projectId} has no lesson coverage.`);
  }
}

if (failed) process.exit(1);

console.log(
  `Project contract check passed: ${projectIds.size} projects and ${lessonProjectIds.size} referenced projects.`
);
