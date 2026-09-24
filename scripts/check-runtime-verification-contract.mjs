import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const source = await readFile(
  path.join(root, "app", "src", "data", "runtimeVerification.ts"),
  "utf8"
);
const catalog = JSON.parse(
  await readFile(
    path.join(root, "app", "src", "data", "runtimeTasks.json"),
    "utf8"
  )
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

const runtimeTasks = Array.isArray(catalog.runtimeTasks) ? catalog.runtimeTasks : [];
const taskIds = runtimeTasks.map((task) => task.taskId);
const duplicateTaskIds = taskIds.filter(
  (id, index) => taskIds.indexOf(id) !== index
);

if (duplicateTaskIds.length) {
  failed = true;
  console.error("Duplicate runtime task IDs: " + [...new Set(duplicateTaskIds)].join(", "));
}

const stepIds = runtimeTasks.flatMap((task) =>
  Array.isArray(task.steps) ? task.steps.map((step) => step.id) : []
);

if (!stepIds.length) {
  failed = true;
  console.error("No runtime verification steps are defined.");
}

for (const platform of ["macos", "linux", "windows"]) {
  const hasPlatformCommand = runtimeTasks.some((task) =>
    Array.isArray(task.steps) &&
    task.steps.some((step) => step.commands && step.commands[platform])
  );

  if (!hasPlatformCommand) {
    failed = true;
    console.error("Runtime task has no " + platform + " command mapping.");
  }
}

if (!source.includes("stdoutHash") || !source.includes("stderrHash")) {
  failed = true;
  console.error("Machine evidence must bind stdout and stderr hashes.");
}

if (!source.includes('verificationSource: "local-runner" | "managed-runner"')) {
  failed = true;
  console.error("Machine evidence must declare whether it came from a local or managed runner.");
}

if (!source.includes("environmentFingerprint")) {
  failed = true;
  console.error("Machine evidence must include an environment fingerprint.");
}

const runner = await readFile(
  path.join(root, "scripts", "hands-on-runtime-runner.mjs"),
  "utf8"
);

for (const required of ["--execute", "mode: "dry-run"", "execFileAsync", "createHash", "30_000"]) {
  if (!runner.includes(required)) {
    failed = true;
    console.error("Runtime runner is missing required safety/verification behavior: " + required);
  }
}

if (!source.includes("completedAt") || !source.includes("startedAt")) {
  failed = true;
  console.error("Machine evidence must include timing boundaries.");
}

if (!source.includes("stdoutHash") || !source.includes("stderrHash")) {
  failed = true;
  console.error("Machine evidence must bind stdout and stderr hashes.");
}

if (failed) process.exit(1);

console.log(
  "Runtime verification contract check passed: " +
    new Set(taskIds).size +
    " task(s), " +
    stepIds.length +
    " runtime step(s), and macOS/Linux/Windows mappings are defined."
);
