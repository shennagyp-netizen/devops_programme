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
const expectedLessonSections = {
  "I-F1": ["D1.1","D1.2","D1.3"],
  "I-F2": ["D1.4","D1.5","D1.6","D2.1","D2.2","D2.3","D2.4"],
  "I-A1": ["D2.5","D2.6","D2.7"],
  "I-A2": ["D3.1","D3.4","D3.5"],
  "I-A3": ["D3.2","D3.3"],
  "I-A4": ["D4.1","D4.2","D4.3","D4.4","D4.5","D4.6"],
  "I-A5": ["D5.5","D5.8"],
  "I-A6": ["D5.1","D5.2","D5.3","D5.4","D5.6","D5.7"]
};
let failed = false;

for (const sectionId of expectedSections) {
  if (!programme.includes(`id: "${sectionId}"`)) {
    failed = true;
    console.error(`Intermediate section ${sectionId} is missing from programme.ts.`);
  }

  const bankPath = path.join(root, "exams", "items", "intermediate", `${sectionId}.json`);
  try {
    const bank = JSON.parse(await readFile(bankPath, "utf8"));
    if (bank.items.length !== 40) {
      failed = true;
      console.error(`Intermediate ${sectionId} bank has ${bank.items.length} items; expected 40.`);
    }
  } catch (error) {
    failed = true;
    console.error(`Intermediate ${sectionId} assessment bank is missing or invalid: ${error.message}`);
  }

  if (!diagnostics.includes(`sectionId: "${sectionId}"`)) {
    failed = true;
    console.error(`Intermediate section ${sectionId} has no prerequisite diagnostic.`);
  }
}

const lessonIds = [...lessons.matchAll(/"id":\s*"(D[1-5]\.\d+)"/g)].map((match) => match[1]);
if (lessonIds.length !== expectedLessons) {
  failed = true;
  console.error(`Intermediate lesson count is ${lessonIds.length}; expected ${expectedLessons}.`);
}

const courseLessons = await readFile(
  path.join(root, "app", "src", "data", "courseLessons.ts"),
  "utf8"
);

const mappingContracts = [
  ['["D2.5", "D2.6", "D2.7"].includes(id)', 'I-A1'],
  ['id === "D3.1"', 'I-A2'],
  ['id === "D3.2" || id === "D3.3"', 'I-A3'],
  ['id === "D3.4" || id === "D3.5"', 'I-A2'],
  ['["D4.1", "D4.2", "D4.3", "D4.4", "D4.5", "D4.6"].includes(id)', 'I-A4'],
  ['["D5.5", "D5.8"].includes(id)', 'I-A5']
];

for (const [condition, sectionId] of mappingContracts) {
  if (!courseLessons.includes(condition) || !courseLessons.includes(`return "${sectionId}"`)) {
    failed = true;
    console.error(`Intermediate mapping contract is missing ${condition} -> ${sectionId}.`);
  }
}

for (const projectId of expectedProjects) {
  if (!projects.includes(`id: "${projectId}"`)) {
    failed = true;
    console.error(`Intermediate project ${projectId} is missing.`);
  }
}

for (const script of ["day-1.txt","day-2.txt","day-3.txt","day-4.txt","day-5.txt"]) {
  try {
    await access(path.join(root, "podcasts", script));
  } catch {
    failed = true;
    console.error(`Intermediate podcast source ${script} is missing.`);
  }
}

if (!handsOn.includes("export function getHandsOnTask")) {
  failed = true;
  console.error("Hands-on task resolver is missing.");
}

if (failed) process.exit(1);

console.log(
  `Intermediate completeness check passed: ${lessonIds.length} lessons, ${expectedSections.length} sections, ${expectedProjects.length} projects, ${expectedSections.length} diagnostics and ${expectedSections.length} pilot banks.`
);
