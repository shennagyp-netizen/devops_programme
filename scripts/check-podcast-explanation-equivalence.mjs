import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const episode = "B1.4";
const sourceDir = path.join(root, "podcasts", "beginner");
const manifestPath = path.join(sourceDir, `${episode}.equivalence.json`);

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const expected = manifest.informationUnits.map((unit) => unit.id);
const expectedSet = new Set(expected);

if (manifest.episodeId !== episode) {
  throw new Error(`Equivalence manifest episode mismatch: ${manifest.episodeId}`);
}

if (expected.length === 0 || expectedSet.size !== expected.length) {
  throw new Error("Equivalence manifest contains missing or duplicate information-unit IDs.");
}

for (const level of [1, 2, 3, 4]) {
  const filename = `${episode}.cognitive-${level}.txt`;
  const file = await readFile(path.join(sourceDir, filename), "utf8");
  const ids = [...file.matchAll(/^@knowledge\s+([A-Z0-9._-]+)\s*$/gim)].map((match) => match[1]);

  if (ids.length !== expected.length) {
    throw new Error(`${filename} declares ${ids.length} information units; expected ${expected.length}.`);
  }

  if (new Set(ids).size !== ids.length) {
    throw new Error(`${filename} repeats an information-unit marker.`);
  }

  if (ids.some((id) => !expectedSet.has(id))) {
    throw new Error(`${filename} contains an unknown information-unit marker.`);
  }

  if (ids.join("|") !== expected.join("|")) {
    throw new Error(`${filename} does not cover the same information units in the same order.`);
  }

  if (!file.includes(`EPISODE ${episode} —`)) {
    throw new Error(`${filename} is missing its episode heading.`);
  }
}

console.log(`Verified four information-equivalent explanations for ${episode}: ${expected.length} units each.`);
