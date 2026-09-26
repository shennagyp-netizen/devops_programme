#!/usr/bin/env node

import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const itemRoot = path.join(repoRoot, "exams", "items");
const output = path.join(repoRoot, "app", "src", "data", "generatedAssessmentBanks.ts");

async function listBanks() {
  const courses = (await readdir(itemRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const banks = [];

  for (const course of courses) {
    const courseDir = path.join(itemRoot, course);
    const files = (await readdir(courseDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
      .map((entry) => entry.name)
      .sort();

    for (const file of files) {
      const absolute = path.join(courseDir, file);
      const source = JSON.parse(await readFile(absolute, "utf8"));

      if (!source || typeof source.sectionId !== "string" || !Array.isArray(source.items)) {
        throw new Error("Invalid assessment bank: " + absolute);
      }

      banks.push({ course, sectionId: source.sectionId, items: source.items });
    }
  }

  if (banks.length === 0) throw new Error("No assessment banks found.");

  const ids = new Set();
  for (const bank of banks) {
    if (ids.has(bank.sectionId)) throw new Error("Duplicate assessment section: " + bank.sectionId);
    ids.add(bank.sectionId);
  }

  return banks;
}

const banks = await listBanks();
const entries = banks.map((bank) =>
  "  " + JSON.stringify(bank.sectionId) + ": " + JSON.stringify({ sectionId: bank.sectionId, items: bank.items }, null, 2)
).join(",\n");

const content = "// GENERATED FILE — DO NOT EDIT.\n" +
  "// Source of truth: exams/items/**/*.json\n" +
  "// Regenerate with: npm run generate:assessment-runtime\n\n" +
  "export const generatedAssessmentBanks = {\n" + entries + "\n} as const;\n";

await writeFile(output, content, "utf8");
console.log("Generated assessment runtime banks: " + banks.length + " bank(s) from exams/items.");
