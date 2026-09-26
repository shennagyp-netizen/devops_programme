import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = () => readFileSync(resolve(process.cwd(), "../scripts/devops-terminal-agent.mjs"), "utf8");

describe("local terminal agent red team", () => {
  it("never enables shell execution for browser-supplied tasks", () => {
    const code = source();
    expect(code).toContain("shell: false");
    expect(code).toContain("taskId");
    expect(code).toContain("runtimeTasks");
    expect(code).toContain("Unknown runtime task.");
    expect(code).not.toContain("spawn(body.command");
    expect(code).not.toContain("exec(body.command");
  });

  it("requires a bearer pairing token before execution", () => {
    const code = source();
    expect(code).toContain("Authorization");
    expect(code).toContain("Bearer ${TOKEN}");
    expect(code).toContain("Invalid or missing pairing token.");
  });

  it("binds the service to loopback and bounds child output", () => {
    const code = source();
    expect(code).toContain('const HOST = "127.0.0.1"');
    expect(code).toContain("MAX_OUTPUT");
    expect(code).toContain("appendBounded");
  });
});
