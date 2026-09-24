import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { runtimeTasks, runtimeTaskForLesson } from "../../src/data/runtimeVerification.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../");

function runNode(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, {
      cwd: repoRoot,
      shell: false
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

describe("runtime runner integration", () => {
  it("uses the same runtime catalog as the TypeScript verifier", async () => {
    const catalog = JSON.parse(
      await readFile(path.join(repoRoot, "app/src/data/runtimeTasks.json"), "utf8")
    );

    expect(runtimeTasks).toEqual(catalog.runtimeTasks);
    expect(runtimeTaskForLesson("B1.2").taskId).toBe("runtime-probe-B1.2");
  });

  it("dry-runs the allowlisted task without executing network commands", async () => {
    const result = await runNode([
      "scripts/run-runtime-task.mjs",
      "--lesson",
      "B1.2",
      "--dry-run"
    ]);

    expect(result.code).toBe(0);
    expect(result.stderr).toBe("");

    const output = JSON.parse(result.stdout);
    expect(output.mode).toBe("dry-run");
    expect(output.taskId).toBe("runtime-probe-B1.2");
    expect(output.steps).toHaveLength(2);
    expect(output.steps.every((step) => step.destructive === false)).toBe(true);
  });

  it("rejects an unsupported lesson before execution", async () => {
    const result = await runNode([
      "scripts/run-runtime-task.mjs",
      "--lesson",
      "A3.2",
      "--dry-run"
    ]);

    expect(result.code).toBe(1);
    expect(result.stderr).toContain(
      "No machine-verification task is defined for lesson A3.2."
    );
  });
});
