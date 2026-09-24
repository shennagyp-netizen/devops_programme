import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const sourceDir = path.join(root, "podcasts");
const targetDir = path.join(root, "app", "public", "podcasts");

const dayFiles = ["day-1.txt", "day-2.txt", "day-3.txt", "day-4.txt", "day-5.txt"];

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

function episodeHashes(source) {
  const hashes = {};
  const matcher = /\nEPISODE (D\d+\.\d+) —[^\n]*\n/g;
  const matches = [...source.matchAll(matcher)];

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const start = (match.index ?? 0) + match[0].length;
    const end = i + 1 < matches.length ? (matches[i + 1].index ?? source.length) : source.length;
    const episodeText = source.slice(start, end).trim();
    hashes[match[1]] = sha256(episodeText);
  }

  return hashes;
}

await mkdir(targetDir, { recursive: true });

const episodes = {};

for (const file of dayFiles) {
  const sourcePath = path.join(sourceDir, file);
  const targetPath = path.join(targetDir, file);
  const source = await readFile(sourcePath, "utf8");

  await writeFile(targetPath, source, "utf8");

  Object.assign(episodes, episodeHashes(source));
}

const manifest = {
  schemaVersion: 1,
  source: "podcasts/",
  episodes
};

await writeFile(
  path.join(targetDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);

console.log(
  `Synchronized ${dayFiles.length} podcast source files and ${Object.keys(episodes).length} episode hashes.`
);
