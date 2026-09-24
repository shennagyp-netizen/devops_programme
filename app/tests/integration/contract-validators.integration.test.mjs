import { describe, expect, it } from "vitest";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../");

function runNode(script) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(repoRoot, "scripts", script)], {
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

describe("contract validator integration", () => {
  const validators = [
    "check-podcast-language.mjs",
    "check-assessment-item-banks.mjs",
    "check-diagnostics.mjs",
    "check-project-contract.mjs",
    "check-platform-adapters.mjs",
    "check-hands-on-contract.mjs",
    "check-beginner-completeness.mjs",
    "check-intermediate-completeness.mjs",
    "check-advanced-completeness.mjs",
    "check-programme-completeness.mjs",
    "check-runtime-verification-contract.mjs"
  ];

  it.each(validators)("passes validator %s", async (script) => {
    const result = await runNode(script);

    expect(
      result.code,
      script + "\\nstdout:\\n" + result.stdout + "\\nstderr:\\n" + result.stderr
    ).toBe(0);
  });
});
