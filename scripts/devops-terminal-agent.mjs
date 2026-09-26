#!/usr/bin/env node

import { randomBytes } from "node:crypto";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import {
  loadOrCreateEd25519ProviderKey,
  signVerificationAttestation,
  sha256Hex
} from "./verification-provider-core.mjs";

const HOST = "127.0.0.1";
const PORT = Number(process.env.DEVOPS_TERMINAL_PORT ?? "4317");
const RUNNER_VERSION = "0.2.0-local-agent";
const MAX_OUTPUT = 64 * 1024;
const TOKEN = process.env.DEVOPS_TERMINAL_TOKEN ?? randomBytes(24).toString("base64url");
const PROVIDER_ID = process.env.DEVOPS_TERMINAL_PROVIDER_ID ?? "local-terminal";
const KEY_ID = process.env.DEVOPS_TERMINAL_KEY_ID ?? "local-key-v1";
const KEY_DIR = process.env.DEVOPS_TERMINAL_KEY_DIR ?? path.join(process.cwd(), ".devops-terminal");
const ALLOWED_ORIGINS = new Set(
  (process.env.DEVOPS_TERMINAL_ALLOWED_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);

function hash(value) {
  return sha256Hex(value);
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

function allowedOrigin(origin) {
  return origin && ALLOWED_ORIGINS.has(origin) ? origin : "";
}

function send(res, status, body, origin) {
  const permittedOrigin = allowedOrigin(origin);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (permittedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", permittedOrigin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

async function loadOrCreateProviderKey() {
  return loadOrCreateEd25519ProviderKey({ directory: KEY_DIR });
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
  const providerKey = await loadOrCreateProviderKey();
  const server = http.createServer(async (req, res) => {
    const origin = req.headers.origin ?? "";
    if (req.method === "OPTIONS" && !allowedOrigin(origin)) {
      res.statusCode = 403;
      res.end();
      return;
    }

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/health") {
      send(res, 200, {
        service: "devops-terminal-agent",
        version: RUNNER_VERSION,
        platform: platformId(),
        providerId: PROVIDER_ID,
        providerKeyId: KEY_ID,
        providerPublicKey: providerKey.publicKey,
        authenticatedExecution: true
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

        if (body.challenge) {
          const challenge = body.challenge;
          if (
            challenge.providerId !== PROVIDER_ID ||
            challenge.itemId !== task.lessonId ||
            challenge.targetRef !== task.taskId ||
            challenge.learnerId === undefined ||
            !challenge.nonce
          ) {
            send(res, 409, { error: "Verification challenge does not match this provider/task." }, origin);
            return;
          }

          const executionEnvelope = await executeTask(task, platform);
          const attestation = signVerificationAttestation({
            challenge,
            envelope: executionEnvelope,
            providerId: PROVIDER_ID,
            keyId: KEY_ID,
            privateKey: providerKey.privateKey,
            verificationRef:
              challenge.id + ":" + executionEnvelope.completedAt
          });

          send(res, 200, {
            envelope: executionEnvelope,
            attestation
          }, origin);
          return;
        }

        send(res, 400, {
          error: "A server-issued verification challenge is required for machine verification."
        }, origin);
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
    console.log(`Provider ID: ${PROVIDER_ID}`);
    console.log(`Provider key ID: ${KEY_ID}`);
    console.log("Register the public provider key with the trusted server provisioning path before using authoritative verification.");
    console.log(`Address: http://${HOST}:${PORT}`);
    console.log(`Pairing token: ${TOKEN}`);
    console.log("Keep this terminal process running while using verified exercises.");
  });
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
