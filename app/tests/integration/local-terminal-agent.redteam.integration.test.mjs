import { describe, expect, it } from "vitest";
import { spawn } from "node:child_process";

function startAgent(port, token) {
  return spawn(process.execPath, ["scripts/devops-terminal-agent.mjs"], {
    cwd: new URL("../../../", import.meta.url),
    shell: false,
    env: {
      ...process.env,
      DEVOPS_TERMINAL_PORT: String(port),
      DEVOPS_TERMINAL_TOKEN: token
    },
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function waitForServer(child) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("terminal agent did not start")), 5000);
    const handler = (chunk) => {
      if (chunk.toString().includes("DevOps terminal agent is running.")) {
        clearTimeout(timeout);
        child.stdout.off("data", handler);
        resolve(undefined);
      }
    };
    child.stdout.on("data", handler);
    child.on("exit", () => clearTimeout(timeout));
  });
}

describe("local terminal agent red-team boundary", () => {
  it("does not reflect arbitrary origins in CORS headers", async () => {
    const child = startAgent(43881, "redteam-token");
    try {
      await waitForServer(child);
      const response = await fetch("http://127.0.0.1:43881/execute", {
        method: "OPTIONS",
        headers: { Origin: "https://attacker.example" }
      });

      expect(response.status).toBe(403);
      expect(response.headers.get("access-control-allow-origin")).toBeNull();
    } finally {
      child.kill("SIGTERM");
    }
  });

  it("rejects execution requests without a fresh execution challenge", async () => {
    const child = startAgent(43883, "redteam-token");
    try {
      await waitForServer(child);

      const response = await fetch("http://127.0.0.1:43883/execute", {
        method: "POST",
        headers: {
          "Origin": "http://localhost:3000",
          "Content-Type": "application/json",
          "Authorization": "Bearer redteam-token"
        },
        body: JSON.stringify({
          taskId: "runtime-probe-B1.2",
          platform: "linux"
        })
      });

      expect(response.status).toBe(400);
      expect((await response.json()).error).toContain("challenge");
    } finally {
      child.kill("SIGTERM");
    }
  });

  it("allows the configured application origin", async () => {
    const child = startAgent(43882, "redteam-token");
    try {
      await waitForServer(child);
      const response = await fetch("http://127.0.0.1:43882/health", {
        headers: { Origin: "http://localhost:3000" }
      });

      expect(response.status).toBe(200);
      expect(response.headers.get("access-control-allow-origin")).toBe("http://localhost:3000");
    } finally {
      child.kill("SIGTERM");
    }
  });
});
