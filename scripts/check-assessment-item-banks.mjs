import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const itemRoot = path.join(root, "exams", "items");

const required = {
  conceptual: { foundation: 3, applied: 7, difficult: 7, challenge: 3 },
  diagnostic: { foundation: 2, applied: 4, difficult: 4, challenge: 2 },
  "hands-on": { foundation: 1, applied: 3, difficult: 3, challenge: 1 }
};

async function filesIn(dir, relative = "") {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const rel = path.join(relative, entry.name);
    const abs = path.join(dir, entry.name);

    if (entry.isDirectory()) files.push(...(await filesIn(abs, rel)));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push({ abs, rel });
  }

  return files;
}

const files = await filesIn(itemRoot);
let failed = false;

for (const file of files) {
  const data = JSON.parse(await readFile(file.abs, "utf8"));
  const items = Array.isArray(data.items) ? data.items : [];
  const ids = new Set();

  for (const item of items) {
    if (ids.has(item.id)) {
      failed = true;
      console.error(`${file.rel}: duplicate item id ${item.id}`);
    }
    ids.add(item.id);
  }

  if (data.purpose?.includes("Not yet a certification pool")) continue;

  for (const [family, bands] of Object.entries(required)) {
    for (const [band, minimum] of Object.entries(bands)) {
      const count = items.filter(
        (item) => item.family === family && item.difficulty === band
      ).length;

      if (count < minimum) {
        failed = true;
        console.error(
          `${file.rel}: ${family}/${band} has ${count}; needs at least ${minimum}`
        );
      }
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Assessment item-bank check passed for ${files.length} bank file(s).`);
