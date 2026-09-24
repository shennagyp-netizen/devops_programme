import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import process from "node:process";
import {
  runtimeTaskForLesson,
  type MachineVerificationEnvelope,
  type RuntimeCommand,
  type RuntimeTask,
  type RuntimeStepResult
} from "../app/src/data/runtimeVerification.ts";
import type { PlatformId } from "../app/src/data/programme.ts";

const RUNNER_VERSION = "0.1.0";

function platformId(): PlatformId {
  if (process.platform === "win32") return "windows";
  if (process.platform === "darwin") return "macos";
  if (process.platform === "linux") return "linux";
  throw new Error(\`Unsupported host platform: \${process.platform}\`);
}

function hash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function environmentFingerprint(platform: PlatformId) {
  return hash(
    JSON.stringify({
      platform,
      architecture: os.arch(),
      nodeMajor: process.versions.node.split(".")[0]
    })
  );
}

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();

  for (let index = 2; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      throw new Error(\`Unexpected argument: \${token}\`);
    }

    const key = token.slice(2);
    const value = argv[index + 1];

    if (!value || value.startsWith("--")) {
      throw new Error(\`Missing value for --\${key}\`);
    }

    args.set(key, value);
    index += 1;
  }

  const lessonId = args.get("lesson");

  if (!lessonId) {
    throw new Error("Usage: node scripts/run-runtime-task.mjs --lesson B1.2 [--output path]");
  }

  return {
    lessonId,
    output: args.get("output")
  };
}

function execute(command: RuntimeCommand) {
  return new Promise<{
    exitCode: number;
    stdout: string;
    stderr: string;
  }>((resolve) => {
    const child = spawn(command.program, command.args, {
      cwd: process.cwd(),
      shell: false,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let settled = false;

    const finish = (result: {
      exitCode: number;
      stdout: string;
      stderr: string;
    }) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      finish({
        exitCode: 124,
        stdout,
        stderr: \`\${stderr}\nCommand timed out after \${command.timeoutMs} ms.\`
      });
    }, command.timeoutMs);

    child.stdout.on("data", (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      clearTimeout(timeout);
      finish({
        exitCode: 127,
        stdout,
        stderr: \`\${stderr}\n\${error.message}\`
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

function commandForTask(task: RuntimeTask, stepIndex: number, platform: PlatformId) {
  const step = task.steps[stepIndex];
  if (!step) throw new Error(\`Task has no step at index \${stepIndex}.\`);

  const runtimeCommand = step.commands[platform];

  if (!runtimeCommand) {
    throw new Error(\`No \${platform} command exists for step \${step.id}.\`);
  }

  if (runtimeCommand.destructive) {
    throw new Error(
      \`Task step \${step.id} is marked destructive and cannot run through this default local runner.\`
    );
  }

  return runtimeCommand;
}

async function main() {
  const { lessonId, output } = parseArgs(process.argv);
  const platform = platformId();
  const task = runtimeTaskForLesson(lessonId);

  if (!task) {
    throw new Error(\`No machine-verification task is defined for lesson \${lessonId}.\`);
  }

  const startedAt = new Date().toISOString();
  const stepResults: RuntimeStepResult[] = [];

  for (let index = 0; index < task.steps.length; index += 1) {
    const step = task.steps[index];
    const command = commandForTask(task, index, platform);
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
      for (let remaining = index + 1; remaining < task.steps.length; remaining += 1) {
        const skipped = task.steps[remaining];
        const timestamp = new Date().toISOString();
        stepResults.push({
          stepId: skipped.id,
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
  const envelope: MachineVerificationEnvelope = {
    schemaVersion: 1,
    taskId: task.taskId,
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
      \`\${task.taskId}-\${startedAt.replace(/[:.]/g, "-")}.json\`
    );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, JSON.stringify(envelope, null, 2) + "\n", "utf8");

  console.log(JSON.stringify({
    taskId: task.taskId,
    lessonId: task.lessonId,
    platform,
    outputPath,
    passed: stepResults.every((step) => step.result === "passed"),
    stepResults
  }, null, 2));

  if (!stepResults.every((step) => step.result === "passed")) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
