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
  await readFile(path.join(root, "app", "src", "data", "runtimeTasks.json"), "utf8")
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

if (!source.includes('from "./runtimeTasks.json"')) {
  failed = true;
  console.error("TypeScript verification layer must use the runtime task catalog.");
}

const tasks = Array.isArray(catalog.runtimeTasks) ? catalog.runtimeTasks : [];
const taskIds = tasks.map((task) => task.taskId);
const duplicateTaskIds = taskIds.filter(
  (id, index) => taskIds.indexOf(id) !== index
);

if (duplicateTaskIds.length) {
  failed = true;
  console.error(
    "Duplicate runtime task IDs: " + [...new Set(duplicateTaskIds)].join(", ")
  );
}

if (!tasks.length) {
  failed = true;
  console.error("No runtime tasks are defined.");
}

for (const task of tasks) {
  if (!task.contractVersion || task.contractVersion < 1) {
    failed = true;
    console.error("Runtime task is missing a valid contractVersion: " + task.taskId);
  }

  if (!task.lessonId || !task.verificationLevel) {
    failed = true;
    console.error("Runtime task identity/verification level is incomplete: " + task.taskId);
  }

  if (!Array.isArray(task.steps) || task.steps.length === 0) {
    failed = true;
    console.error("Runtime task has no steps: " + task.taskId);
    continue;
  }

  for (const step of task.steps) {
    if (!step.id || !step.kind || !step.purpose || !step.commands) {
      failed = true;
      console.error("Runtime step is incomplete: " + task.taskId + "/" + step.id);
    }

    for (const platform of ["macos", "linux", "windows"]) {
      const command = step.commands[platform];
      if (!command) {
        failed = true;
        console.error(
          "Runtime step lacks " + platform + " mapping: " + task.taskId + "/" + step.id
        );
      }
      if (command?.destructive) {
        failed = true;
        console.error(
          "Default runtime catalog must not expose destructive steps: " +
            task.taskId +
            "/" +
            step.id
        );
      }
    }
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
    tasks.length +
    " task(s) and " +
    tasks.reduce((count, task) => count + task.steps.length, 0) +
    " runtime step(s) are structurally valid."
);
