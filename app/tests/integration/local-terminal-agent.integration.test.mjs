import { describe, expect, it } from "vitest";
import { createPublicKey, verify as verifySignature } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import {
  canonicalVerificationSigningPayload,
  digestExecutionEnvelope
} from "../../scripts/verification-provider-core.mjs";

async function startAgent(port, token, extraEnv = {}) {
  const keyDir = await mkdtemp(path.join(os.tmpdir(), "devops-terminal-agent-"));

  const child = spawn(
    process.execPath,
    ["scripts/devops-terminal-agent.mjs"],
    {
      cwd: new URL("../../../", import.meta.url),
      shell: false,
      env: {
        ...process.env,
        DEVOPS_TERMINAL_PORT: String(port),
        DEVOPS_TERMINAL_TOKEN: token,
        DEVOPS_TERMINAL_KEY_DIR: keyDir,
        DEVOPS_TERMINAL_ALLOWED_ORIGINS: "http://localhost:3000",
        ...extraEnv
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  return { child, keyDir };
}

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("terminal agent did not start"));
    }, 5000);

    const handle = (chunk) => {
      if (chunk.toString().includes("DevOps terminal agent is running.")) {
        clearTimeout(timeout);
        child.stdout.off("data", handle);
        resolve(undefined);
      }
    };

    child.stdout.on("data", handle);
    child.on("exit", () => {
      clearTimeout(timeout);
    });
    child.stderr.on("data", (chunk) => {
      if (chunk.toString()) {
        // Preserve stderr for actual process failures without failing on normal output.
      }
    });
  });
}

describe("local terminal agent", () => {
  it("starts a loopback execution service", async () => {
    const token = "test-token-123";
    const port = 43871;
    const { child, keyDir } = await startAgent(port, token);

    try {
      await waitForServer(child);

      const health = await fetch(`http://127.0.0.1:${port}/health`);
      expect(health.status).toBe(200);

      const body = await health.json();
      expect(body.service).toBe("devops-terminal-agent");
      expect(body.authenticatedExecution).toBe(true);
    } finally {
      child.kill("SIGTERM");
      await rm(keyDir, { recursive: true, force: true });
    }
  });

  it("rejects terminal execution without the pairing token", async () => {
    const token = "test-token-456";
    const port = 43872;
    const { child, keyDir } = await startAgent(port, token);

    try {
      await waitForServer(child);

      const response = await fetch(`http://127.0.0.1:${port}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId: "runtime-probe-B1.2",
          platform: "linux"
        })
      });

      expect(response.status).toBe(401);
      expect((await response.json()).error).toContain("pairing token");
    } finally {
      child.kill("SIGTERM");
      await rm(keyDir, { recursive: true, force: true });
    }
  });

  it("rejects unknown runtime tasks before execution", async () => {
    const token = "test-token-789";
    const port = 43873;
    const child = startAgent(port, token);

    try {
      await waitForServer(child);

      const response = await fetch(`http://127.0.0.1:${port}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          taskId: "not-a-real-task",
          platform: "linux"
        })
      });

      expect(response.status).toBe(404);
      expect((await response.json()).error).toBe("Unknown runtime task.");
    } finally {
      child.kill("SIGTERM");
    }
  });
  it("denies unapproved origins and permits the explicit development origin", async () => {
    const token = "test-token-cors";
    const port = 43874;
    const { child, keyDir } = await startAgent(port, token);

    try {
      await waitForServer(child);

      const denied = await fetch(`http://127.0.0.1:${port}/health`, {
        headers: { Origin: "https://evil.example" }
      });
      expect(denied.status).toBe(200);
      expect(denied.headers.get("access-control-allow-origin")).toBeNull();

      const preflight = await fetch(`http://127.0.0.1:${port}/execute`, {
        method: "OPTIONS",
        headers: {
          Origin: "https://evil.example",
          "Access-Control-Request-Method": "POST"
        }
      });
      expect(preflight.status).toBe(403);

      const allowed = await fetch(`http://127.0.0.1:${port}/health`, {
        headers: { Origin: "http://localhost:3000" }
      });
      expect(allowed.status).toBe(200);
      expect(allowed.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
    } finally {
      child.kill("SIGTERM");
      await rm(keyDir, { recursive: true, force: true });
    }
  });

  it("returns a challenge-bound signed attestation for provider-authorized execution", async () => {
    const token = "test-token-signed";
    const port = 43875;
    const { child, keyDir } = await startAgent(port, token);

    try {
      await waitForServer(child);

      const health = await fetch(`http://127.0.0.1:${port}/health`);
      const healthBody = await health.json();

      const challenge = {
        id: "challenge-agent-1",
        learnerId: "user_1",
        itemId: "B1.1",
        evidenceKind: "exercise",
        providerId: healthBody.providerId,
        issuedAt: new Date(Date.now() - 1000).toISOString(),
        expiresAt: new Date(Date.now() + 120000).toISOString(),
        nonce: "nonce-agent-1"
      };

      const response = await fetch(`http://127.0.0.1:${port}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Origin: "http://localhost:3000"
        },
        body: JSON.stringify({
          taskId: "runtime-exercise-B1.1",
          platform: "linux",
          challenge
        })
      });

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body.envelope.taskId).toBe("runtime-exercise-B1.1");
      expect(body.attestation).toMatchObject({
        challengeId: challenge.id,
        learnerId: challenge.learnerId,
        itemId: challenge.itemId,
        evidenceKind: challenge.evidenceKind,
        providerId: challenge.providerId,
        keyId: healthBody.providerKeyId,
        nonce: challenge.nonce,
        signatureAlgorithm: "ed25519"
      });

      expect(body.attestation.attestationDigest).toBe(
        digestExecutionEnvelope(body.envelope)
      );

      const publicKey = createPublicKey(healthBody.providerPublicKey);
      const signingPayload = canonicalVerificationSigningPayload(
        challenge,
        body.attestation
      );
      expect(
        verifySignature(
          null,
          Buffer.from(signingPayload, "utf8"),
          publicKey,
          Buffer.from(body.attestation.signature, "base64url")
        )
      ).toBe(true);
    } finally {
      child.kill("SIGTERM");
      await rm(keyDir, { recursive: true, force: true });
    }
  });

});
