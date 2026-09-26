import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const sourceDir = path.join(root, "podcasts");
const targetDir = path.join(root, "app", "public", "podcasts");

function sha256(text) {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

async function collectTextFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "README.md") continue;

    const relativePath = path.join(relative, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectTextFiles(absolutePath, relativePath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".txt")) {
      files.push({ absolutePath, relativePath });
    }
  }

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function episodeHashes(source, relativePath = "") {
  const hashes = {};
  const matcher = /(?:^|\n)EPISODE ([A-Z0-9]+\.[0-9]+) —[^\n]*\n/g;
  const matches = [...source.matchAll(matcher)];

  for (let i = 0; i < matches.length; i += 1) {
    const match = matches[i];
    const start = (match.index ?? 0) + match[0].length;
    const end =
      i + 1 < matches.length
        ? (matches[i + 1].index ?? source.length)
        : source.length;

    hashes[match[1]] = sha256(source.slice(start, end).trim());
  }

  return hashes;
}

await mkdir(targetDir, { recursive: true });

const files = await collectTextFiles(sourceDir);
const episodes = {};
const cognitiveLevels = {};

for (const file of files) {
  const source = await readFile(file.absolutePath, "utf8");
  const targetPath = path.join(targetDir, file.relativePath);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, source, "utf8");

  const hashes = episodeHashes(source);

  if (/\.cognitive-[1-4]\.txt$/i.test(file.relativePath)) {
    const match = file.relativePath.match(/(?:^|[/\\])([A-Z0-9]+\.[0-9]+)\.cognitive-([1-4])\.txt$/i);
    if (match) {
      const [, episodeId, level] = match;
      cognitiveLevels[episodeId] ??= {};
      cognitiveLevels[episodeId][level] = Object.values(hashes)[0];
    }
  } else {
    Object.assign(episodes, hashes);
  }
}

const manifest = {
  schemaVersion: 2,
  source: "podcasts/",
  episodes,
  cognitiveLevels
};

await writeFile(
  path.join(targetDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);

console.log(
  `Synchronized ${files.length} podcast text files and ${Object.keys(episodes).length} episode hashes across four cognitive levels.`
);
