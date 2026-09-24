import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFile(path.join(root, p), "utf8");

const lessonSource = await read("app/src/data/courseLessons.ts");
const programme = await read("app/src/data/programme.ts");
const projects = await read("app/src/data/projects.ts");
const diagnostics = await read("app/src/data/diagnostics.ts");
const handsOn = await read("app/src/data/handsOn.ts");

const sections = ["B-F1","B-F2","B-A1","B-A2","B-A3","B-A4","B-A5"];
const lessons = ["B1.1","B1.2","B1.3","B1.4","B1.5","B2.1","B2.2","B2.3","B3.1","B3.2"];
const projectsExpected = ["B1","B2","B3"];
const sectionByLesson = {"B1.1":"B-F1","B1.2":"B-F2","B1.3":"B-A1","B1.4":"B-A2","B1.5":"B-A2","B2.1":"B-A3","B2.2":"B-A4","B2.3":"B-A4","B3.1":"B-A5","B3.2":"B-A5"};
const projectByLesson = {"B1.1":"B1","B1.2":"B1","B1.3":"B1","B1.4":"B1","B1.5":"B1","B2.1":"B2","B2.2":"B2","B2.3":"B2","B3.1":"B3","B3.2":"B3"};

let failed = false;
const fail = (message) => { failed = true; console.error(message); };

const ids = [...lessonSource.matchAll(/id: "(B\d+\.\d+)",/g)].map((m) => m[1]);
if (JSON.stringify(ids) !== JSON.stringify(lessons)) fail("Beginner lesson identity/order mismatch: " + ids.join(", "));

for (const sectionId of sections) {
  if (!programme.includes('id: "' + sectionId + '",')) fail("Missing section " + sectionId);
  if (!lessonSource.includes('sectionId: "' + sectionId + '",')) fail("Missing lessons for " + sectionId);
  if (!diagnostics.includes('sectionId: "' + sectionId + '",')) fail("Missing diagnostic " + sectionId);

  const bank = JSON.parse(await read("exams/items/beginner/" + sectionId + ".json"));
  if (bank.schemaVersion !== 1 || bank.sectionId !== sectionId || !Array.isArray(bank.items)) {
    fail("Invalid assessment bank wrapper " + sectionId);
    continue;
  }
  if (bank.items.length !== 40) fail(sectionId + " must contain 40 items.");
  if (new Set(bank.items.map((item) => item.id)).size !== bank.items.length) fail("Duplicate assessment item ID in " + sectionId);

  const counts = {
    conceptual: bank.items.filter((item) => item.family === "conceptual").length,
    diagnostic: bank.items.filter((item) => item.family === "diagnostic").length,
    "hands-on": bank.items.filter((item) => item.family === "hands-on").length
  };
  if (counts.conceptual !== 20 || counts.diagnostic !== 12 || counts["hands-on"] !== 8) fail(sectionId + " family counts are " + JSON.stringify(counts));

  for (const item of bank.items) {
    if (!item.prompt || !item.prompt.trim()) fail("Empty prompt: " + sectionId + "/" + item.id);
    if (!item.competencyId || !item.competencyId.startsWith(sectionId + ".")) fail("Wrong competency: " + sectionId + "/" + item.id);
    if (!Number.isFinite(item.expectedMinutes) || item.expectedMinutes <= 0) fail("Bad time: " + sectionId + "/" + item.id);

    if (item.options) {
      if (item.options.length < 2) fail("Too few options: " + sectionId + "/" + item.id);
      if (!Number.isInteger(item.correctOption) || item.correctOption < 0 || item.correctOption >= item.options.length) fail("Invalid correct option: " + sectionId + "/" + item.id);
    } else if (!(item.expectedElements?.length || item.scoring?.full?.length || item.scoringNote)) {
      fail("Missing scoring contract: " + sectionId + "/" + item.id);
    }

    if (item.family === "hands-on") {
      for (const key of ["environment","initialState","allowedOperations","success","evidence","failureConditions","recoveryRequirements","resetStrategy"]) {
        if (!item[key] || (Array.isArray(item[key]) && item[key].length === 0)) fail("Missing hands-on " + key + ": " + sectionId + "/" + item.id);
      }
    }
  }
}

for (const projectId of projectsExpected) {
  if (!projects.includes('id: "' + projectId + '"')) fail("Missing project " + projectId);
}

for (let i = 0; i < lessons.length; i += 1) {
  const id = lessons[i];
  const start = lessonSource.indexOf('    id: "' + id + '",');
  const next = lessons[i + 1];
  const end = next ? lessonSource.indexOf('    id: "' + next + '",', start + 1) : lessonSource.indexOf("\n];", start);
  const block = start >= 0 && end >= 0 ? lessonSource.slice(start, end) : "";

  if (!block) { fail("Missing lesson block " + id); continue; }
  if (!block.includes('sectionId: "' + sectionByLesson[id] + '"')) fail("Wrong section mapping " + id);
  if (!block.includes('projectId: "' + projectByLesson[id] + '"')) fail("Wrong project mapping " + id);
  for (const field of ["objective:","command:","challenge:","recall:"]) if (!block.includes(field)) fail("Missing " + field + " in " + id);

  try {
    const source = await readFile(path.join(root, "podcasts", "beginner", id + ".txt"), "utf8");
    if (source.trim().length < 100) fail("Podcast script is too short: " + id);
  } catch {
    fail("Missing podcast script: " + id);
  }
}

for (const id of ["B1.1","B1.2","B1.3","B1.4","B1.5","B2.1","B2.2","B2.3","B3.1","B3.2"]) {
  if (!handsOn.includes(`"${id}": {`)) fail("Missing authored Beginner hands-on override " + id);
}

if (!handsOn.includes("export function getHandsOnTask")) fail("Hands-on resolver missing.");
if (!handsOn.includes("export function validateHandsOnEvidence")) fail("Hands-on validator missing.");
for (const field of ["observation","change","failure","recovery"]) if (!handsOn.includes('id: "' + field + '"')) fail("Missing default evidence field " + field);

if (failed) process.exit(1);
console.log("BEGINNER GATE PASSED: 10 lessons, 7 sections, 3 projects, 7 diagnostics, 280 pilot items.");