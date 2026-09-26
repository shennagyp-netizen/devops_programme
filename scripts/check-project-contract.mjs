import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const lessonsPath = path.join(root, "app", "src", "data", "courseLessons.ts");
const intermediateLessonsPath = path.join(root, "app", "src", "data", "curriculum.ts");
const projectsPath = path.join(root, "app", "src", "data", "projects.ts");

const lessons = await readFile(lessonsPath, "utf8");
const curriculum = await readFile(intermediateLessonsPath, "utf8");
const projects = await readFile(projectsPath, "utf8");

let failed = false;

const projectIds = new Set(
  [...projects.matchAll(/id:\s*"([A-Z][A-Z0-9.-]*)",\s*course:/g)].map((match) => match[1])
);

const lessonProjectIds = new Set(
  [...lessons.matchAll(/projectId:\s*"([^"]+)"/g)].map((match) => match[1])
);

for (const projectId of [...lessons.matchAll(/return\s+"(I[1-3])"/g)].map((match) => match[1])) {
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
  const phaseCount = (projectBlock.match(new RegExp('id: "' + projectId + '-P\\d+"', 'g')) || []).length;
  const milestoneBlock = projectBlock.match(/    milestones: \[[\s\S]*?\n    \],/);
  const milestoneCount = (milestoneBlock?.[0].match(/^      "/gm) || []).length;
  if (!projectBlock.includes("estimatedHours:") || !projectBlock.includes("phases: [") || !projectBlock.includes("deliverables: [") || !projectBlock.includes("reviewGates: [") || phaseCount < 4 || milestoneCount < 8) {
    failed = true;
    console.error(`Project ${projectId} must define four phases, at least eight milestones, deliverables, review gates and an estimated workload.`);
  }

  const hourMatches = [...projectBlock.matchAll(/hours: (\d+)/g)].map((match) => Number(match[1]));
  const estimatedMatch = projectBlock.match(/estimatedHours: (\d+)/);
  const phaseHours = hourMatches.reduce((sum, hours) => sum + hours, 0);
  const estimatedHours = estimatedMatch ? Number(estimatedMatch[1]) : 0;
  if (!estimatedHours || phaseHours !== estimatedHours) {
    failed = true;
    console.error(`Project ${projectId} phase hours must add up to estimatedHours.`);
  }
}

const intermediateProjectIds = ["I1", "I2", "I3"];
const allIntermediateLessonIds = [
  ...curriculum.matchAll(/"id":\s*"(D\d+\.\d+)"/g)
].map((match) => match[1]);

if (allIntermediateLessonIds.length !== 32) {
  failed = true;
  console.error(
    `Intermediate project mapping source contains ${allIntermediateLessonIds.length} lessons; expected 32.`
  );
}

const intermediateMapping = await readFile(lessonsPath, "utf8");
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
