import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const source = await readFile(
  path.join(root, "app", "src", "data", "runtimeVerification.ts"),
  "utf8"
);

let failed = false;

if (!source.includes("export type MachineVerificationEnvelope")) {
  failed = true;
  console.error("Machine verification envelope type is missing.");
}

if (!source.includes("export function validateMachineVerification")) {
  failed = true;
  console.error("Machine verification validator is missing.");
}

const taskIds = [...source.matchAll(/taskId:\s*"([^"]+)"/g)].map((match) => match[1]);
const duplicateTaskIds = taskIds.filter(
  (id, index) => taskIds.indexOf(id) !== index
);

if (duplicateTaskIds.length) {
  failed = true;
  console.error("Duplicate runtime task IDs: " + [...new Set(duplicateTaskIds)].join(", "));
}

const stepIds = [...source.matchAll(
  /id:\s*"([^"]+)",\s*kind:\s*"(observe|change|failure|restore|verify)"/g
)].map((match) => match[1]);

if (!stepIds.length) {
  failed = true;
  console.error("No runtime verification steps are defined.");
}

for (const platform of ["macos", "linux", "windows"]) {
  const needle = platform + ": command(";
  if (!source.includes(needle)) {
    failed = true;
    console.error("Runtime task has no " + platform + " command mapping.");
  }
}

if (!source.includes("stdoutHash") || !source.includes("stderrHash")) {
  failed = true;
  console.error("Machine evidence must bind stdout and stderr hashes.");
}

if (!source.includes("environmentFingerprint")) {
  failed = true;
  console.error("Machine evidence must include an environment fingerprint.");
}

if (!source.includes("completedAt") || !source.includes("startedAt")) {
  failed = true;
  console.error("Machine evidence must include timing boundaries.");
}

if (failed) process.exit(1);

console.log(
  "Runtime verification contract check passed: " +
    new Set(taskIds).size +
    " task(s), " +
    stepIds.length +
    " runtime step(s), and macOS/Linux/Windows mappings are defined."
);
