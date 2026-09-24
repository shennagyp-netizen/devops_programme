#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import {
  REMOTE_RUNNER_VERSION,
  SUPPORTED_REMOTE_PLATFORMS,
  commandPlan,
  environmentFingerprint,
  parseRemoteArgs,
  sshArguments
} from "./remote-runtime-core.mjs";

const execFileAsync = promisify(execFile);

const MAX_CAPTURED_OUTPUT = 64 * 1024;

function capture(value) {
  const text = String(value ?? "");
  return text.length <= MAX_CAPTURED_OUTPUT ? text : text.slice(0, MAX_CAPTURED_OUTPUT);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

async function loadCatalog() {
  const source = await readFile(
    path.resolve(new URL("../app/src/data/runtimeTasks.json", import.meta.url).pathname),
    "utf8"
  );
  return JSON.parse(source);
}

async function runStep({ task, step, options }) {
  const args = sshArguments({
    host: options.host,
    user: options.user,
    port: options.port,
    identity: options.identity,
    knownHostsFile: options.knownHostsFile,
    task,
    step,
    platform: options.platform
  });

  const startedAt = new Date().toISOString();

  try {
    const result = await execFileAsync("ssh", args, {
      cwd: process.cwd(),
      shell: false,
      timeout: step.commands[options.platform].timeoutMs,
      maxBuffer: 4 * 1024 * 1024
    });

    const stdout = capture(result.stdout ?? "");
    const stderr = capture(result.stderr ?? "");

    return {
      stepId: step.id,
      startedAt,
      completedAt: new Date().toISOString(),
      exitCode: 0,
      stdout,
      stderr,
      stdout,
      stderr,
      stdoutHash: sha256(stdout),
      stderrHash: sha256(stderr),
      result: "passed"
    };
  } catch (error) {
    const stdout = capture(typeof error.stdout === "string" ? error.stdout : "");
    const stderr = capture(
      typeof error.stderr === "string"
        ? error.stderr
        : String(error.message ?? error);
    const exitCode = typeof error.code === "number" ? error.code : 1;

    return {
      stepId: step.id,
      startedAt,
      completedAt: new Date().toISOString(),
      exitCode,
      stdoutHash: sha256(stdout),
      stderrHash: sha256(stderr),
      result: "failed"
    };
  }
}

async function main() {
  const options = parseRemoteArgs(process.argv);
  const catalog = await loadCatalog();
  const task = catalog.runtimeTasks.find((item) => item.lessonId === options.lessonId);

  if (!task) {
    throw new Error(
      "No machine-verification task is defined for lesson " + options.lessonId + "."
    );
  }

  if (task.verificationLevel !== "machine-verified") {
    throw new Error("The selected task is not machine-verifiable.");
  }

  if (task.resetRequired) {
    throw new Error(
      "This task requires reset verification; the SSH runner has no reset adapter yet."
    );
  }

  const plan = commandPlan(task, options.platform);

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          executionMode: "remote-machine",
          transport: "ssh",
          taskId: task.taskId,
          contractVersion: task.contractVersion,
          lessonId: task.lessonId,
          platform: options.platform,
          host: options.host ?? null,
          user: options.user ?? null,
          port: options.port,
          hostKeyPolicy: "strict-known-hosts",
          steps: plan
        },
        null,
        2
      )
    );
    return;
  }

  const startedAt = new Date().toISOString();
  const stepResults = [];

  for (const step of task.steps) {
    const result = await runStep({ task, step, options });
    stepResults.push(result);

    if (result.result !== "passed" && step.required) {
      for (const remaining of task.steps.slice(stepResults.length)) {
        const timestamp = new Date().toISOString();
        stepResults.push({
          stepId: remaining.id,
          startedAt: timestamp,
          completedAt: timestamp,
          exitCode: -1,
          stdout: "",
          stderr: "",
          stdoutHash: sha256(""),
          stderrHash: sha256(""),
          result: "not-run"
        });
      }
      break;
    }
  }

  const target = {
    kind: "ssh",
    host: options.host,
    port: options.port,
    user: options.user,
    hostKeyPolicy: "strict-known-hosts"
  };

  const envelope = {
    schemaVersion: 1,
    taskId: task.taskId,
    contractVersion: task.contractVersion,
    lessonId: task.lessonId,
    platform: options.platform,
    verificationLevel: "machine-verified",
    verificationSource: "ssh-runner",
    executionMode: "remote-machine",
    target,
    runnerVersion: REMOTE_RUNNER_VERSION,
    environmentFingerprint: environmentFingerprint({
      platform: options.platform,
      arch: "remote-target",
      nodeVersion: process.versions.node
    }),
    startedAt,
    completedAt: new Date().toISOString(),
    stepResults,
    resetPerformed: !task.resetRequired,
    metadata: {
      transport: "ssh",
      commandPlan: plan.map(({ id, kind, program, args }) => ({
        id,
        kind,
        program,
        args
      }))
    }
  };

  const outputPath =
    options.output ??
    path.join(
      process.cwd(),
      ".runtime-evidence",
      task.taskId + "-ssh-" + startedAt.replace(/[:.]/g, "-") + ".json"
    );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(envelope, null, 2) + "\n", "utf8");

  console.log(
    JSON.stringify(
      {
        taskId: task.taskId,
        lessonId: task.lessonId,
        executionMode: "remote-machine",
        verificationSource: "ssh-runner",
        target,
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
