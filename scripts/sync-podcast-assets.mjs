import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const sourceDir = path.join(root, "podcasts");
const targetDir = path.join(root, "app", "public", "podcasts");
const sourceAudioManifest = path.join(sourceDir, "audio-manifest.json");
const targetAudioManifest = path.join(targetDir, "audio-manifest.json");

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

async function collectMediaFiles(directory, relative = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name === "README.md") continue;

    const relativePath = path.join(relative, entry.name);
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectMediaFiles(absolutePath, relativePath)));
      continue;
    }

    if (entry.isFile() && /\.(mp3|ogg|wav|m4a)$/i.test(entry.name)) {
      files.push({ absolutePath, relativePath });
    }
  }

  return files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function episodeHashes(source) {
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
const mediaFiles = await collectMediaFiles(sourceDir);
const episodes = {};

for (const file of files) {
  const source = await readFile(file.absolutePath, "utf8");
  const targetPath = path.join(targetDir, file.relativePath);

  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, source, "utf8");

  Object.assign(episodes, episodeHashes(source));
}

for (const file of mediaFiles) {
  const targetPath = path.join(targetDir, file.relativePath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, await readFile(file.absolutePath));
}

const manifest = {
  schemaVersion: 2,
  source: "podcasts/",
  episodes
};

await writeFile(
  path.join(targetDir, "manifest.json"),
  JSON.stringify(manifest, null, 2) + "\n",
  "utf8"
);

try {
  const audioManifest = await readFile(sourceAudioManifest, "utf8");
  JSON.parse(audioManifest);
  await writeFile(targetAudioManifest, audioManifest, "utf8");
} catch {
  await writeFile(targetAudioManifest, "{}\n", "utf8");
}

console.log(
  `Synchronized ${files.length} podcast text files, ${mediaFiles.length} audio files and ${Object.keys(episodes).length} episode hashes.`
);
