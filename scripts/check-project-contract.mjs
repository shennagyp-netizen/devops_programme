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

const projectCourses = new Map(
  [...projects.matchAll(/id:\s*"([A-Z][A-Z0-9.-]*)",\s*course:\s*"([^"]+)"/g)].map(
    (match) => [match[1], match[2]]
  )
);

const lessonRecords = [
  ...lessons.matchAll(
    /id:\s*"([^"]+)"[\s\S]*?course:\s*"([^"]+)"[\s\S]*?sectionId:\s*"([^"]+)"[\s\S]*?projectId:\s*"([^"]+)"/g
  )
].map((match) => ({
  id: match[1],
  course: match[2],
  sectionId: match[3],
  projectId: match[4]
}));

for (const lesson of lessonRecords) {
  if (!projectIds.has(lesson.projectId)) {
    failed = true;
    console.error(
      `Lesson ${lesson.id} points to undefined project ${lesson.projectId}.`
    );
  }

  if (projectCourses.get(lesson.projectId) !== lesson.course) {
    failed = true;
    console.error(
      `Lesson ${lesson.id} maps to project ${lesson.projectId}, but their courses differ.`
    );
  }
}

for (const projectId of projectIds) {
  if (!lessonRecords.some((lesson) => lesson.projectId === projectId)) {
    failed = true;
    console.error(`Project ${projectId} has no lesson coverage.`);
  }
}

if (failed) process.exit(1);

console.log(
  `Project contract check passed: ${projectIds.size} projects and ${lessonRecords.length} lesson records.`
);
