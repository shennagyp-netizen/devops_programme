import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const podcastDir = path.join(root, "podcasts");

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
  "constitutes",
  "arbitrates"
];

async function collectScripts(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "README.md") continue;

    const rel = path.join(relative, entry.name);
    const abs = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectScripts(abs, rel)));
    } else if (entry.isFile() && entry.name.endsWith(".txt")) {
      files.push({ abs, rel });
    }
  }

  return files;
}

const files = await collectScripts(podcastDir);
let failed = false;

for (const file of files) {
  const text = (await readFile(file.abs, "utf8")).toLowerCase();

  for (const word of blocked) {
    const expression = new RegExp(`\\b${word}\\b`, "g");
    const count = text.match(expression)?.length ?? 0;

    if (count > 0) {
      failed = true;
      console.error(
        `Language check failed: ${file.rel} contains "${word}" (${count} time(s)).`
      );
    }
  }
}

if (failed) {
  console.error(
    "Use simpler general English. Keep exact technical terms, but do not make the English harder than necessary."
  );
  process.exit(1);
}

console.log(`Plain-English podcast check passed for ${files.length} script files.`);
