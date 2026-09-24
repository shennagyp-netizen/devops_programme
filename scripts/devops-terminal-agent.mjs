#!/usr/bin/env node

import { createHash, generateKeyPairSync, randomBytes, sign } from "node:crypto";
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
const TOKEN = process.env.DEVOPS_TERMINAL_TOKEN ?? randomBytes(24).toString("base64url");
const { publicKey: ATTESTATION_PUBLIC_KEY, privateKey: ATTESTATION_PRIVATE_KEY } =
  generateKeyPairSync("ed25519");
const ATTESTATION_PUBLIC_KEY_B64 = ATTESTATION_PUBLIC_KEY
  .export({ type: "spki", format: "der" })
  .toString("base64url");

const ALLOWED_ORIGINS = new Set(
  (process.env.DEVOPS_TERMINAL_ALLOWED_ORIGINS ??
    "http://localhost:3000,http://127.0.0.1:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function capture(value) {
  const text = String(value ?? "");
  return text.length <= MAX_OUTPUT ? text : text.slice(0, MAX_OUTPUT);
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

async function loadCatalog() {
  const file = path.resolve(
    new URL("../app/src/data/runtimeTasks.json", import.meta.url).pathname
  );
  return JSON.parse(await readFile(file, "utf8"));
}

function isAllowedOrigin(origin) {
  return !origin || ALLOWED_ORIGINS.has(origin);
}

function applyCors(res, origin) {
  if (!origin) return;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Vary", "Origin");
}

function send(res, status, body, origin) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  applyCors(res, origin);
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
      if (body.length > 256 * 1024) {
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
        stderr: stderr + `\nCommand timed out after ${command.timeoutMs} ms.`
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

function attestationPayload(envelope) {
  return JSON.stringify({
    schemaVersion: envelope.schemaVersion,
    taskId: envelope.taskId,
    contractVersion: envelope.contractVersion,
    lessonId: envelope.lessonId,
    platform: envelope.platform,
    verificationLevel: envelope.verificationLevel,
    verificationSource: envelope.verificationSource,
    executionMode: envelope.executionMode,
    target: envelope.target,
    runnerVersion: envelope.runnerVersion,
    environmentFingerprint: envelope.environmentFingerprint,
    challenge: envelope.challenge ?? "",
    startedAt: envelope.startedAt,
    completedAt: envelope.completedAt,
    stepResults: envelope.stepResults,
    resetPerformed: envelope.resetPerformed
  });
}

function attachAttestation(envelope) {
  return {
    ...envelope,
    attestation: {
      algorithm: "Ed25519",
      publicKey: ATTESTATION_PUBLIC_KEY_B64,
      signature: sign(
        null,
        Buffer.from(attestationPayload(envelope), "utf8"),
        ATTESTATION_PRIVATE_KEY
      ).toString("base64url")
    }
  };
}

async function executeTask(task, platform, challenge) {
  if (task.verificationLevel !== "machine-verified") {
    throw new Error("This task is not machine-verifiable.");
  }
  if (task.resetRequired) {
    throw new Error("This task requires reset verification and is not supported by the local agent yet.");
  }

  if (!/^[a-f0-9]{64}$/i.test(challenge)) {
    throw new Error("Execution challenge is invalid.");
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
    const stdout = capture(result.stdout);
    const stderr = capture(result.stderr);

    stepResults.push({
      stepId: step.id,
      startedAt: stepStarted,
      completedAt: new Date().toISOString(),
      exitCode: result.exitCode,
      stdout,
      stderr,
      stdoutHash: hash(stdout),
      stderrHash: hash(stderr),
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

  const envelope = {
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
    challenge,
    startedAt,
    completedAt: new Date().toISOString(),
    stepResults,
    resetPerformed: !task.resetRequired
  };

  return attachAttestation(envelope);
}

async function main() {
  const catalog = await loadCatalog();
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin ?? "*";

    if (req.method === "OPTIONS") {
      if (!isAllowedOrigin(origin === "*" ? "" : origin)) {
        res.statusCode = 403;
        res.end();
        return;
      }
      res.statusCode = 204;
      applyCors(res, origin === "*" ? "" : origin);
      res.end();
      return;
    }

    if (!isAllowedOrigin(origin === "*" ? "" : origin)) {
      send(res, 403, { error: "Origin is not allowed." }, "");
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      send(res, 200, {
        service: "devops-terminal-agent",
        version: RUNNER_VERSION,
        platform: platformId(),
        authenticatedExecution: true,
        attestation: {
          algorithm: "Ed25519",
          publicKey: ATTESTATION_PUBLIC_KEY_B64
        }
      }, origin);
      return;
    }

    if (req.method === "POST" && req.url === "/execute") {
      if (!authorized(req)) {
        send(res, 401, { error: "Invalid or missing pairing token." }, origin);
        return;
      }

      try {
        const body = await readJson(req);
        const task = catalog.runtimeTasks.find((item) => item.taskId === body.taskId);
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

        const challenge = String(body.challenge ?? "");
        if (!/^[a-f0-9]{64}$/i.test(challenge)) {
          send(res, 400, { error: "Invalid execution challenge." }, origin);
          return;
        }

        const envelope = await executeTask(task, platform, challenge);
        send(res, 200, envelope, origin);
      } catch (error) {
        send(res, 400, {
          error: error instanceof Error ? error.message : String(error)
        }, origin);
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
