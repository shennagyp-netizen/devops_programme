#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { platform as osPlatform, arch } from "node:os";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const args = process.argv.slice(2);
const dryRun = !args.includes("--execute");
const requestedTask = args.find((value) => value.startsWith("--task="))?.split("=")[1] ?? "hands-on-B1.2";

const task = {
  taskId: "hands-on-B1.2",
  lessonId: "B1.2",
  verificationLevel: "machine-verified",
  resetRequired: false,
  steps: [
    {
      id: "resolve-name",
      kind: "observe",
      purpose: "Resolve the service name before testing the connection path.",
      commands: {
        darwin: ["dig", ["example.com"]],
        linux: ["dig", ["example.com"]],
        win32: ["powershell.exe", ["-NoProfile", "-Command", "Resolve-DnsName example.com"]]
      }
    },
    {
      id: "test-https-port",
      kind: "verify",
      purpose: "Test whether the target HTTPS port is reachable.",
      commands: {
        darwin: ["nc", ["-z", "example.com", "443"]],
        linux: ["nc", ["-z", "example.com", "443"]],
        win32: ["powershell.exe", ["-NoProfile", "-Command", "Test-NetConnection example.com -Port 443"]]
      }
    }
  ]
};

if (requestedTask !== task.taskId) {
  console.error(\`Unsupported runtime task: \${requestedTask}\`);
  process.exit(2);
}

const currentPlatform = osPlatform();
if (!task.steps.every((step) => step.commands[currentPlatform])) {
  console.error(\`No allowlisted runtime command exists for platform \${currentPlatform}.\`);
  process.exit(2);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function environmentFingerprint() {
  return sha256(
    JSON.stringify({
      platform: currentPlatform,
      arch: arch(),
      node: process.version
    })
  );
}

if (dryRun) {
  console.log(
    JSON.stringify(
      {
        mode: "dry-run",
        taskId: task.taskId,
        lessonId: task.lessonId,
        platform: currentPlatform,
        steps: task.steps.map((step) => ({
          id: step.id,
          kind: step.kind,
          purpose: step.purpose,
          program: step.commands[currentPlatform][0],
          args: step.commands[currentPlatform][1]
        }))
      },
      null,
      2
    )
  );
  process.exit(0);
}

const startedAt = new Date().toISOString();
const stepResults = [];

for (const step of task.steps) {
  const [program, commandArgs] = step.commands[currentPlatform];
  const stepStartedAt = new Date().toISOString();

  try {
    const result = await execFileAsync(program, commandArgs, {
      timeout: 30_000,
      windowsHide: true,
      maxBuffer: 2 * 1024 * 1024
    });

    const stepCompletedAt = new Date().toISOString();
    stepResults.push({
      stepId: step.id,
      startedAt: stepStartedAt,
      completedAt: stepCompletedAt,
      exitCode: 0,
      stdoutHash: sha256(result.stdout ?? ""),
      stderrHash: sha256(result.stderr ?? ""),
      result: "passed"
    });
  } catch (error) {
    const stepCompletedAt = new Date().toISOString();
    const stdout = typeof error.stdout === "string" ? error.stdout : "";
    const stderr = typeof error.stderr === "string" ? error.stderr : String(error.message ?? error);

    stepResults.push({
      stepId: step.id,
      startedAt: stepStartedAt,
      completedAt: stepCompletedAt,
      exitCode: typeof error.code === "number" ? error.code : 1,
      stdoutHash: sha256(stdout),
      stderrHash: sha256(stderr),
      result: "failed"
    });
    break;
  }
}

const completedAt = new Date().toISOString();
const envelope = {
  schemaVersion: 1,
  taskId: task.taskId,
  lessonId: task.lessonId,
  platform: currentPlatform,
  verificationLevel: "machine-verified",
  verificationSource: "local-runner",
  runnerVersion: "0.1.0",
  environmentFingerprint: environmentFingerprint(),
  startedAt,
  completedAt,
  stepResults,
  resetPerformed: true
};

process.stdout.write(JSON.stringify(envelope, null, 2) + "\n");

if (stepResults.some((step) => step.result !== "passed")) {
  process.exit(1);
}
