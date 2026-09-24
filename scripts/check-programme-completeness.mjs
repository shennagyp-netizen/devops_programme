import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

const programme = await readFile(path.join(root, "app", "src", "data", "programme.ts"), "utf8");
const courseLessons = await readFile(path.join(root, "app", "src", "data", "courseLessons.ts"), "utf8");
const diagnostics = await readFile(path.join(root, "app", "src", "data", "diagnostics.ts"), "utf8");
const projects = await readFile(path.join(root, "app", "src", "data", "projects.ts"), "utf8");
const assessment = await readFile(path.join(root, "app", "src", "data", "assessment.ts"), "utf8");

const expected = {
  beginner: {
    sections: ["B-F1","B-F2","B-A1","B-A2","B-A3","B-A4","B-A5"],
    lessons: 10,
    projects: ["B1","B2","B3"]
  },
  intermediate: {
    sections: ["I-F1","I-F2","I-A1","I-A2","I-A3","I-A4","I-A5","I-A6"],
    lessons: 32,
    projects: ["I1","I2","I3"]
  },
  advanced: {
    sections: ["A-F1","A-F2","A-F3","A-A1","A-A2","A-A3"],
    lessons: 11,
    projects: ["A1","A2","A3"]
  }
};

let failed = false;
let bankCount = 0;
let bankItemCount = 0;
let diagnosticCount = 0;

for (const [course, spec] of Object.entries(expected)) {
  for (const sectionId of spec.sections) {
    if (!programme.includes(\`id: "\${sectionId}"\`)) {
      failed = true;
      console.error(\`Missing programme section: \${sectionId}\`);
    }

    if (!diagnostics.includes(\`sectionId: "\${sectionId}"\`)) {
      failed = true;
      console.error(\`Missing diagnostic: \${sectionId}\`);
    } else {
      diagnosticCount += 1;
    }

    const bankPath = path.join(
      root,
      "exams",
      "items",
      course,
      \`\${sectionId}.json\`
    );

    try {
      const bank = JSON.parse(await readFile(bankPath, "utf8"));
      bankCount += 1;
      bankItemCount += Array.isArray(bank.items) ? bank.items.length : 0;
      if (bank.sectionId !== sectionId || !Array.isArray(bank.items) || bank.items.length !== 40) {
        failed = true;
        console.error(\`Invalid pilot bank contract for \${course}/\${sectionId}.\`);
      }
    } catch (error) {
      failed = true;
      console.error(\`Missing/invalid pilot bank for \${course}/\${sectionId}: \${error.message}\`);
    }
  }

  for (const projectId of spec.projects) {
    if (!projects.includes(\`id: "\${projectId}"\`)) {
      failed = true;
      console.error(\`Missing project: \${projectId}\`);
    }
  }
}

const beginnerLessons = [...courseLessons.matchAll(/id: "(B\d+\.\d+)",/g)].map((match) => match[1]);
const intermediateLessons = [...courseLessons.matchAll(/"id": "(D\d+\.\d+)"/g)].map((match) => match[1]);
const advancedLessons = [...courseLessons.matchAll(/id: "(A\d+\.\d+)",/g)].map((match) => match[1]);

const counts = {
  beginner: beginnerLessons.length,
  intermediate: new Set(intermediateLessons).size,
  advanced: advancedLessons.length
};

for (const [course, spec] of Object.entries(expected)) {
  if (counts[course] !== spec.lessons) {
    failed = true;
    console.error(\`\${course} lesson count is \${counts[course]}; expected \${spec.lessons}.\`);
  }
}

if (!assessment.includes('"A-A3"')) {
  failed = true;
  console.error("Assessment blueprint is missing Advanced A-A3.");
}

if (bankCount !== 21 || bankItemCount !== 840 || diagnosticCount !== 21) {
  failed = true;
  console.error(
    \`Global authored-course totals are banks=\${bankCount}, items=\${bankItemCount}, diagnostics=\${diagnosticCount}; expected 21, 840, 21.\`
  );
}

if (failed) process.exit(1);

console.log(
  \`Programme completeness check passed: 53 lessons, 21 sections, 9 projects, 21 pilot banks, 840 pilot items and 21 prerequisite diagnostics.\`
);
