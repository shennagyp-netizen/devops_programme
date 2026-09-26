import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "app",
  "drizzle",
  "migrations"
);

const entries = (await readdir(root))
  .filter((name) => /^\d{4}_[^/]+\.sql$/.test(name))
  .sort();

let failed = false;
const seen = new Set();
const numbers = [];

for (const name of entries) {
  const number = Number(name.slice(0, 4));
  numbers.push(number);

  if (seen.has(number)) {
    failed = true;
    console.error("Duplicate migration number: " + String(number).padStart(4, "0"));
  }
  seen.add(number);
}

for (let index = 1; index < numbers.length; index += 1) {
  if (numbers[index] <= numbers[index - 1]) {
    failed = true;
    console.error(
      "Migration numbers must increase strictly: " +
        String(numbers[index - 1]).padStart(4, "0") +
        " then " +
        String(numbers[index]).padStart(4, "0")
    );
  }
}

if (failed) process.exit(1);

console.log("Migration contract: " + entries.length + " migration files with unique ordered prefixes.");
