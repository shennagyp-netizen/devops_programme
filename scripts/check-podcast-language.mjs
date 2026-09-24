import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const podcastDir = path.join(root, "podcasts");

const files = ["day-1.txt", "day-2.txt", "day-3.txt", "day-4.txt", "day-5.txt"];

/*
 * These are general-English words we do not want in learner-facing spoken
 * material when a simple word works. Real technical terms are not listed.
 */
const blocked = [
  "facilitate",
  "utilize",
  "commence",
  "subsequently",
  "nevertheless",
  "consequently",
  "approximately",
  "sufficient",
  "obtain",
  "regarding",
  "comprehensive",
  "aforementioned",
  "notwithstanding",
  "whereby",
  "hence",
  "therefore",
  "thus",
  "disparate",
  "proliferate",
  "endeavour",
  "endeavor",
  "ascertain",
  "elucidate",
  "exemplify",
  "predominantly",
  "indispensable",
  "intricate",
  "pervasive",
  "unprecedented",
  "constitutes"
];

let failed = false;

for (const file of files) {
  const text = (await readFile(path.join(podcastDir, file), "utf8")).toLowerCase();

  for (const word of blocked) {
    const expression = new RegExp(`\\b${word}\\b`, "g");
    const count = text.match(expression)?.length ?? 0;

    if (count > 0) {
      failed = true;
      console.error(`Language check failed: ${file} contains "${word}" (${count} time(s)).`);
    }
  }
}

if (failed) {
  console.error(
    "Use simpler general English. Keep exact technical terms, but do not make the English harder than necessary."
  );
  process.exit(1);
}

console.log("Plain-English podcast check passed.");
