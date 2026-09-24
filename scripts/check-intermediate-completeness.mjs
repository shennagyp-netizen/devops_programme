import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const programme = await readFile(path.join(root, "app", "src", "data", "programme.ts"), "utf8");
const lessons = await readFile(path.join(root, "app", "src", "data", "curriculum.ts"), "utf8");
const diagnostics = await readFile(path.join(root, "app", "src", "data", "diagnostics.ts"), "utf8");
const projects = await readFile(path.join(root, "app", "src", "data", "projects.ts"), "utf8");
const handsOn = await readFile(path.join(root, "app", "src", "data", "handsOn.ts"), "utf8");

const expectedSections = ["I-F1","I-F2","I-A1","I-A2","I-A3","I-A4","I-A5","I-A6"];
const expectedProjects = ["I1","I2","I3"];
const expectedLessons = 32;
let failed = false;

for (const sectionId of expectedSections) {
  if (!programme.includes(\`id: "\${sectionId}"\`)) {
    failed = true;
    console.error(\`Intermediate section \${sectionId} is missing from programme.ts.\`);
  }

  const bankPath = path.join(root, "exams", "items", "intermediate", \`\${sectionId}.json\`);
  try {
    const bank = JSON.parse(await readFile(bankPath, "utf8"));
    if (bank.items.length !== 40) {
      failed = true;
      console.error(\`Intermediate \${sectionId} bank has \${bank.items.length} items; expected 40.\`);
    }
  } catch (error) {
    failed = true;
    console.error(\`Intermediate \${sectionId} assessment bank is missing or invalid: \${error.message}\`);
  }

  if (!diagnostics.includes(\`sectionId: "\${sectionId}"\`)) {
    failed = true;
    console.error(\`Intermediate section \${sectionId} has no prerequisite diagnostic.\`);
  }
}

const lessonIds = [...lessons.matchAll(/"id":\s*"(D[1-5]\.\d+)"/g)].map((match) => match[1]);
if (lessonIds.length !== expectedLessons) {
  failed = true;
  console.error(\`Intermediate lesson count is \${lessonIds.length}; expected \${expectedLessons}.\`);
}

for (const projectId of expectedProjects) {
  if (!projects.includes(\`id: "\${projectId}"\`)) {
    failed = true;
    console.error(\`Intermediate project \${projectId} is missing.\`);
  }
}

for (const script of ["day-1.txt","day-2.txt","day-3.txt","day-4.txt","day-5.txt"]) {
  try {
    await access(path.join(root, "podcasts", script));
  } catch {
    failed = true;
    console.error(\`Intermediate podcast source \${script} is missing.\`);
  }
}

if (!handsOn.includes("export function getHandsOnTask")) {
  failed = true;
  console.error("Hands-on task resolver is missing.");
}

if (failed) process.exit(1);

console.log(
  \`Intermediate completeness check passed: \${lessonIds.length} lessons, \${expectedSections.length} sections, \${expectedProjects.length} projects, \${expectedSections.length} diagnostics and \${expectedSections.length} pilot banks.\`
);
