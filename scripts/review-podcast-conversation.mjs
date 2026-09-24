import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const podcastRoot = path.join(root, "podcasts");

async function filesIn(dir) {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await filesIn(abs)));
    else if (entry.isFile() && entry.name.endsWith(".txt")) files.push(abs);
  }

  return files;
}

const files = await filesIn(podcastRoot);
let warnings = 0;

for (const file of files) {
  const text = await readFile(file, "utf8");
  const turns = [...text.matchAll(/^Speaker ([AB]):\s*(.+)$/gm)].map((match) => ({
    speaker: match[1],
    text: match[2].trim()
  }));

  if (turns.length < 8) continue;

  let alternating = 0;
  for (let i = 1; i < turns.length; i += 1) {
    if (turns[i].speaker !== turns[i - 1].speaker) alternating += 1;
  }

  const alternationRate = alternating / Math.max(1, turns.length - 1);
  const shortTurnRate =
    turns.filter((turn) => turn.text.split(/\s+/).length <= 3).length / turns.length;

  const fileLabel = path.relative(root, file);

  if (alternationRate >= 0.97) {
    warnings += 1;
    console.warn(
      `WARN ${fileLabel}: ${(alternationRate * 100).toFixed(1)}% strict A/B alternation. Review for more natural overlap, disagreement or uneven turn lengths.`
    );
  }

  if (shortTurnRate >= 0.45) {
    warnings += 1;
    console.warn(
      `WARN ${fileLabel}: ${(shortTurnRate * 100).toFixed(1)}% of turns have three words or fewer. Review for overly choppy speech.`
    );
  }
}

console.log(
  `Podcast conversation review completed: ${files.length} script files scanned, ${warnings} warning(s).`
);
