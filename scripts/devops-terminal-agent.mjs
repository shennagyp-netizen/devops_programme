#!/usr/bin/env node

import { createHash, randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const HOST = "127.0.0.1";
const PORT = Number(process.env.DEVOPS_TERMINAL_PORT ?? "4317");
const RUNNER_VERSION = "0.2.0-local-agent";
const MAX_OUTPUT = 64 * 1024;
const MAX_REQUEST_BODY = 256 * 1024;
const MAX_COMMAND_TIMEOUT = 120_000;
const configuredToken = process.env.DEVOPS_TERMINAL_TOKEN?.trim();

if (configuredToken && configuredToken.length < 24) {
  throw new Error("DEVOPS_TERMINAL_TOKEN must contain at least 24 characters.");
}

const TOKEN = configuredToken || randomBytes(24).toString("base64url");
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];
const ALLOWED_ORIGINS = new Set(
  (process.env.DEVOPS_TERMINAL_ALLOWED_ORIGINS
    ? process.env.DEVOPS_TERMINAL_ALLOWED_ORIGINS.split(",")
    : DEFAULT_ALLOWED_ORIGINS
  )
    .map((origin) => origin.trim())
    .filter(Boolean)
);

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function capture(value) {
  const text = String(value ?? "");
  return text.length <= MAX_OUTPUT ? text : text.slice(0, MAX_OUTPUT) + "\n[output truncated]";
}

function platformId() {
  if (process.platform === "win32") return "windows";
  if (process.platform === "darwin") return "macos";
  if (process.platform === "linux") return "linux";
  throw new Error("Unsupported host platform: " + process.platform);
}

function fingerprint(platform) {
  return hash(
    JSON.stringify({
      platform,
      architecture: os.arch(),
      nodeMajor: process.versions.node.split(".")[0],
      hostnameHash: hash(os.hostname())
    })
  );
}

function isAllowedOrigin(origin) {
  return !origin || ALLOWED_ORIGINS.has(origin);
}

function setCorsHeaders(res, origin) {
  if (!origin) return true;
  if (!isAllowedOrigin(origin)) return false;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Private-Network", "true");
  res.setHeader("Vary", "Origin");
  return true;
}

function send(res, status, body, origin) {
  if (!setCorsHeaders(res, origin)) {
    res.statusCode = 403;
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Origin is not allowed." }));
    return;
  }

  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function authorized(req) {
  const header = req.headers.authorization ?? "";
  return header === `Bearer ${TOKEN}`;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");

    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > MAX_REQUEST_BODY) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });

    req.on("error", reject);
  });
}

function runCommand(command) {
  return new Promise((resolve) => {
    const timeoutMs = Math.min(
      MAX_COMMAND_TIMEOUT,
      Math.max(
        1_000,
        Number.isInteger(command.timeoutMs) ? command.timeoutMs : 30_000
      )
    );

    const child = spawn(command.program, command.args, {
      cwd: process.cwd(),
      shell: false,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";
    let stdoutTruncated = false;
    let stderrTruncated = false;
    let timedOut = false;
    let settled = false;
    let timeoutHandle;
    let forceKillHandle;

    const appendBounded = (current, chunk, markTruncated) => {
      if (current.length >= MAX_OUTPUT) return [current, true];

      const next = current + chunk.toString();

      if (next.length <= MAX_OUTPUT) {
        return [next, markTruncated];
      }

      return [next.slice(0, MAX_OUTPUT), true];
    };

    const withTruncationMarker = (value, truncated) =>
      truncated ? value + "\n[output truncated]" : value;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    timeoutHandle = setTimeout(() => {
      timedOut = true;
      child.kill("SIGTERM");

      forceKillHandle = setTimeout(() => {
        child.kill("SIGKILL");
        finish({
          exitCode: 124,
          stdout: withTruncationMarker(stdout, stdoutTruncated),
          stderr:
            withTruncationMarker(stderr, stderrTruncated) +
            `\nCommand timed out after ${timeoutMs} ms.`
        });
      }, 2_000);
    }, timeoutMs);

    child.stdout.on("data", (chunk) => {
      [stdout, stdoutTruncated] = appendBounded(
        stdout,
        chunk,
        stdoutTruncated
      );
    });

    child.stderr.on("data", (chunk) => {
      [stderr, stderrTruncated] = appendBounded(
        stderr,
        chunk,
        stderrTruncated
      );
    });

    child.on("error", (error) => {
      clearTimeout(timeoutHandle);
      if (forceKillHandle) clearTimeout(forceKillHandle);
      finish({
        exitCode: 127,
        stdout: withTruncationMarker(stdout, stdoutTruncated),
        stderr:
          withTruncationMarker(stderr, stderrTruncated) +
          "\n" +
          error.message
      });
    });

    child.on("close", (code) => {
      clearTimeout(timeoutHandle);
      if (forceKillHandle) clearTimeout(forceKillHandle);

      finish({
        exitCode: timedOut ? 124 : (code ?? 1),
        stdout: withTruncationMarker(stdout, stdoutTruncated),
        stderr: timedOut
          ? withTruncationMarker(stderr, stderrTruncated) +
            `\nCommand timed out after ${timeoutMs} ms.`
          : withTruncationMarker(stderr, stderrTruncated)
      });
    });
  });
}

async function loadCatalog() {
  const file = path.resolve(
    new URL("../app/src/data/runtimeTasks.json", import.meta.url).pathname
  );
  return JSON.parse(await readFile(file, "utf8"));
}

async function executeTask(task, platform) {
  if (task.verificationLevel !== "machine-verified") {
    throw new Error("This task is not machine-verifiable.");
  }
  if (task.resetRequired) {
    throw new Error("This task requires reset verification and is not supported by the local agent yet.");
  }

  const startedAt = new Date().toISOString();
  const stepResults = [];

  for (const step of task.steps) {
    const command = step.commands?.[platform];
    if (!command) throw new Error(`No ${platform} command exists for step ${step.id}.`);
    if (command.destructive) {
      throw new Error(`Destructive runtime step rejected: ${step.id}`);
    }

    const stepStarted = new Date().toISOString();
    const result = await runCommand(command);

    stepResults.push({
      stepId: step.id,
      startedAt: stepStarted,
      completedAt: new Date().toISOString(),
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      stdoutHash: hash(result.stdout),
      stderrHash: hash(result.stderr),
      result: result.exitCode === 0 ? "passed" : "failed"
    });

    if (result.exitCode !== 0 && step.required) {
      for (const remaining of task.steps.slice(stepResults.length)) {
        const now = new Date().toISOString();
        stepResults.push({
          stepId: remaining.id,
          startedAt: now,
          completedAt: now,
          exitCode: -1,
          stdout: "",
          stderr: "",
          stdoutHash: hash(""),
          stderrHash: hash(""),
          result: "not-run"
        });
      }
      break;
    }
  }

  return {
    schemaVersion: 1,
    taskId: task.taskId,
    contractVersion: task.contractVersion,
    lessonId: task.lessonId,
    platform,
    verificationLevel: "machine-verified",
    verificationSource: "local-runner",
    executionMode: "local-machine",
    target: { kind: "local" },
    runnerVersion: RUNNER_VERSION,
    environmentFingerprint: fingerprint(platform),
    startedAt,
    completedAt: new Date().toISOString(),
    stepResults,
    resetPerformed: !task.resetRequired
  };
}

async function main() {
  const catalog = await loadCatalog();
  let executing = false;

  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin ?? "";

    if (!isAllowedOrigin(origin)) {
      send(res, 403, { error: "Origin is not allowed." }, origin);
      return;
    }

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      setCorsHeaders(res, origin);
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      send(
        res,
        200,
        {
          service: "devops-terminal-agent",
          version: RUNNER_VERSION,
          platform: platformId(),
          authenticatedExecution: true
        },
        origin
      );
      return;
    }

    if (req.method === "POST" && req.url === "/execute") {
      if (!authorized(req)) {
        send(res, 401, { error: "Invalid or missing pairing token." }, origin);
        return;
      }

      if (executing) {
        send(res, 429, { error: "A terminal task is already running." }, origin);
        return;
      }

      executing = true;

      try {
        const body = await readJson(req);
        if (
          !body ||
          typeof body !== "object" ||
          Array.isArray(body) ||
          typeof body.taskId !== "string"
        ) {
          send(res, 400, { error: "taskId is required." }, origin);
          return;
        }

        const task = catalog.runtimeTasks.find(
          (item) => item.taskId === body.taskId
        );
        if (!task) {
          send(res, 404, { error: "Unknown runtime task." }, origin);
          return;
        }

        const actualPlatform = platformId();
        const platform = body.platform || actualPlatform;
        if (!["macos", "linux", "windows"].includes(platform)) {
          send(res, 400, { error: "Unsupported platform." }, origin);
          return;
        }
        if (platform !== actualPlatform) {
          send(res, 409, {
            error: `Selected platform ${platform} does not match this laptop's platform ${actualPlatform}.`
          }, origin);
          return;
        }

        const envelope = await executeTask(task, platform);
        send(res, 200, envelope, origin);
      } catch (error) {
        send(res, 400, {
          error: error instanceof Error ? error.message : String(error)
        }, origin);
      } finally {
        executing = false;
      }

      return;
    }

    send(res, 404, { error: "Not found." }, origin);
  });

  server.listen(PORT, HOST, () => {
    console.log("DevOps terminal agent is running.");
    console.log(`Address: http://${HOST}:${PORT}`);
    console.log(`Pairing token: ${TOKEN}`);
    console.log("Keep this terminal process running while using verified exercises.");
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
