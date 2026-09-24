#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const RUNNER_VERSION = "0.1.0";

function platformId() {
  if (process.platform === "win32") return "windows";
  if (process.platform === "darwin") return "macos";
  if (process.platform === "linux") return "linux";
  throw new Error("Unsupported host platform: " + process.platform);
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function environmentFingerprint(platform) {
  return hash(
    JSON.stringify({
      platform,
      architecture: os.arch(),
      nodeMajor: process.versions.node.split(".")[0]
    })
  );
}

function parseArgs(argv) {
  const args = new Map();
  const valueOptions = new Set(["lesson", "output"]);
  const flagOptions = new Set(["dry-run", "execute"]);

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error("Unexpected argument: " + token);
    }

    const key = token.slice(2);

    if (flagOptions.has(key)) {
      args.set(key, "true");
      continue;
    }

    if (!valueOptions.has(key)) {
      throw new Error("Unknown option: --" + key);
    }

    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error("Missing value for --" + key);
    }

    args.set(key, value);
    index += 1;
  }

  if (args.has("dry-run") && args.has("execute")) {
    throw new Error("Use either --dry-run or --execute, not both.");
  }

  const lessonId = args.get("lesson");

  if (!lessonId) {
    throw new Error(
      "Usage: node scripts/run-runtime-task.mjs --lesson B1.2 [--dry-run|--execute] [--output path]"
    );
  }

  return {
    lessonId,
    dryRun: !args.has("execute"),
    output: args.get("output")
  };
}

async function loadCatalog() {
  const file = path.resolve(
    new URL("../app/src/data/runtimeTasks.json", import.meta.url).pathname
  );
  const source = await readFile(file, "utf8");
  return JSON.parse(source);
}

function commandForTask(task, step, platform) {
  const runtimeCommand = step.commands[platform];

  if (!runtimeCommand) {
    throw new Error("No " + platform + " command exists for step " + step.id + ".");
  }

  if (runtimeCommand.destructive) {
    throw new Error(
      "Task step " +
        step.id +
        " is marked destructive and cannot run through this default runner."
    );
  }

  return runtimeCommand;
}

function execute(command) {
  return new Promise((resolve) => {
    const child = spawn(command.program, command.args, {
      cwd: process.cwd(),
      shell: false,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      finish({
        exitCode: 124,
        stdout,
        stderr:
          stderr +
          "\nCommand timed out after " +
          command.timeoutMs +
          " ms."
      });
    }, command.timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      finish({
        exitCode: 127,
        stdout,
        stderr: stderr + "\n" + error.message
      });
    });

    child.on("close", (code) => {
      clearTimeout(timeout);
      finish({
        exitCode: code ?? 1,
        stdout,
        stderr
      });
    });
  });
}

function dryRunOutput(task, platform) {
  return {
    mode: "dry-run",
    taskId: task.taskId,
    contractVersion: task.contractVersion,
    lessonId: task.lessonId,
    platform,
    steps: task.steps.map((step) => {
      const runtimeCommand = commandForTask(task, step, platform);
      return {
        id: step.id,
        kind: step.kind,
        purpose: step.purpose,
        program: runtimeCommand.program,
        args: runtimeCommand.args,
        timeoutMs: runtimeCommand.timeoutMs,
        destructive: runtimeCommand.destructive
      };
    })
  };
}

async function main() {
  const { lessonId, dryRun, output } = parseArgs(process.argv);
  const platform = platformId();
  const catalog = await loadCatalog();
  const task = catalog.runtimeTasks.find((item) => item.lessonId === lessonId);

  if (!task) {
    throw new Error("No machine-verification task is defined for lesson " + lessonId + ".");
  }

  for (const step of task.steps) {
    commandForTask(task, step, platform);
  }

  if (dryRun) {
    console.log(JSON.stringify(dryRunOutput(task, platform), null, 2));
    return;
  }

  const startedAt = new Date().toISOString();
  const stepResults = [];

  for (const step of task.steps) {
    const command = commandForTask(task, step, platform);
    const stepStarted = new Date().toISOString();
    const result = await execute(command);
    const stepCompleted = new Date().toISOString();

    stepResults.push({
      stepId: step.id,
      startedAt: stepStarted,
      completedAt: stepCompleted,
      exitCode: result.exitCode,
      stdoutHash: hash(result.stdout),
      stderrHash: hash(result.stderr),
      result: result.exitCode === 0 ? "passed" : "failed"
    });

    if (result.exitCode !== 0 && step.required) {
      for (const remaining of task.steps.slice(stepResults.length)) {
        const timestamp = new Date().toISOString();
        stepResults.push({
          stepId: remaining.id,
          startedAt: timestamp,
          completedAt: timestamp,
          exitCode: -1,
          stdoutHash: hash(""),
          stderrHash: hash(""),
          result: "not-run"
        });
      }
      break;
    }
  }

  const completedAt = new Date().toISOString();
  const envelope = {
    schemaVersion: 1,
    taskId: task.taskId,
    contractVersion: task.contractVersion,
    lessonId: task.lessonId,
    platform,
    verificationLevel: "machine-verified",
    runnerVersion: RUNNER_VERSION,
    environmentFingerprint: environmentFingerprint(platform),
    startedAt,
    completedAt,
    stepResults,
    resetPerformed: !task.resetRequired
  };

  const outputPath =
    output ??
    path.join(
      process.cwd(),
      ".runtime-evidence",
      task.taskId + "-" + startedAt.replace(/[:.]/g, "-") + ".json"
    );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(envelope, null, 2) + "\n", "utf8");

  console.log(
    JSON.stringify(
      {
        taskId: task.taskId,
        lessonId: task.lessonId,
        platform,
        outputPath,
        passed: stepResults.every((step) => step.result === "passed"),
        stepResults
      },
      null,
      2
    )
  );

  if (!stepResults.every((step) => step.result === "passed")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
