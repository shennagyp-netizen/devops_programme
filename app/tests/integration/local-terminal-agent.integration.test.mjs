import { describe, expect, it } from "vitest";
import { spawn } from "node:child_process";

function startAgent(port, token) {
  const child = spawn(
    process.execPath,
    ["scripts/devops-terminal-agent.mjs"],
    {
      cwd: new URL("../../", import.meta.url),
      shell: false,
      env: {
        ...process.env,
        DEVOPS_TERMINAL_PORT: String(port),
        DEVOPS_TERMINAL_TOKEN: token
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  return child;
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
    const child = startAgent(port, token);

    try {
      await waitForServer(child);

      const health = await fetch(`http://127.0.0.1:${port}/health`);
      expect(health.status).toBe(200);

      const body = await health.json();
      expect(body.service).toBe("devops-terminal-agent");
      expect(body.authenticatedExecution).toBe(true);
    } finally {
      child.kill("SIGTERM");
    }
  });

  it("rejects terminal execution without the pairing token", async () => {
    const token = "test-token-456";
    const port = 43872;
    const child = startAgent(port, token);

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
});
