import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const lessons = await readFile(
  path.join(root, "app", "src", "data", "courseLessons.ts"),
  "utf8"
);
const intermediateLessons = await readFile(
  path.join(root, "app", "src", "data", "curriculum.ts"),
  "utf8"
);
const adapters = await readFile(
  path.join(root, "app", "src", "data", "platformAdapters.ts"),
  "utf8"
);

const lessonIds = new Set([
  ...[...lessons.matchAll(/id:\s*"([A-Z0-9.]+)",\s*title:/g)].map((match) => match[1]),
  ...[...intermediateLessons.matchAll(/"id":\s*"([A-Z0-9.]+)"/g)].map((match) => match[1])
]);
const windowsIds = new Set(
  [...adapters.matchAll(/"([A-Z0-9.]+)":\s*"/g)].map((match) => match[1])
);

let failed = false;

for (const id of lessonIds) {
  if (!windowsIds.has(id)) {
    failed = true;
    console.error(`Windows adapter is missing lesson ${id}.`);
  }
}

if (failed) process.exit(1);

console.log(
  `Platform adapter check passed: ${lessonIds.size} lessons have Windows command coverage.`
);
