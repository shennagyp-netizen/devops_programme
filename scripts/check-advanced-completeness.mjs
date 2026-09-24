import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const programme = await readFile(path.join(root, "app", "src", "data", "programme.ts"), "utf8");
const lessons = await readFile(path.join(root, "app", "src", "data", "courseLessons.ts"), "utf8");
const diagnostics = await readFile(path.join(root, "app", "src", "data", "diagnostics.ts"), "utf8");
const projects = await readFile(path.join(root, "app", "src", "data", "projects.ts"), "utf8");
const handsOn = await readFile(path.join(root, "app", "src", "data", "handsOn.ts"), "utf8");

const expectedSections = ["A-F1","A-F2","A-F3","A-A1","A-A2","A-A3"];
const expectedProjects = ["A1","A2","A3"];
const expectedLessons = 11;
let failed = false;

for (const sectionId of expectedSections) {
  if (!programme.includes(\`id: "\${sectionId}"\`)) {
    failed = true;
    console.error(\`Advanced section \${sectionId} is missing from programme.ts.\`);
  }

  const bankPath = path.join(root, "exams", "items", "advanced", \`\${sectionId}.json\`);
  try {
    const bank = JSON.parse(await readFile(bankPath, "utf8"));
    if (bank.items.length !== 40) {
      failed = true;
      console.error(\`Advanced \${sectionId} bank has \${bank.items.length} items; expected 40.\`);
    }
  } catch (error) {
    failed = true;
    console.error(\`Advanced \${sectionId} assessment bank is missing or invalid: \${error.message}\`);
  }

  if (!diagnostics.includes(\`sectionId: "\${sectionId}"\`)) {
    failed = true;
    console.error(\`Advanced section \${sectionId} has no prerequisite diagnostic.\`);
  }
}

const advancedLessonIds = [...lessons.matchAll(/id: "(A\d+\.\d+)",/g)].map((match) => match[1]);
if (advancedLessonIds.length !== expectedLessons) {
  failed = true;
  console.error(\`Advanced lesson count is \${advancedLessonIds.length}; expected \${expectedLessons}.\`);
}

for (const projectId of expectedProjects) {
  if (!projects.includes(\`id: "\${projectId}"\`)) {
    failed = true;
    console.error(\`Advanced project \${projectId} is missing.\`);
  }
}

for (const script of ["A1.1","A1.2","A1.3","A1.4","A1.5","A1.6","A2.1","A2.2","A2.3","A3.1","A3.2"]) {
  const advancedPodcast = path.join(root, "podcasts", "advanced", \`\${script}.txt\`);
  try {
    await access(advancedPodcast);
  } catch {
    failed = true;
    console.error(\`Advanced podcast script missing for \${script}.\`);
  }
}

if (!handsOn.includes("export function getHandsOnTask")) {
  failed = true;
  console.error("Hands-on task resolver is missing.");
}

if (failed) process.exit(1);

console.log(
  \`Advanced completeness check passed: \${advancedLessonIds.length} lessons, \${expectedSections.length} sections, \${expectedProjects.length} projects, \${expectedSections.length} diagnostics and \${expectedSections.length} pilot banks.\`
);
