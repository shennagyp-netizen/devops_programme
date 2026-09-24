import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");

describe("red-team repository boundaries", () => {
  it("uses a real environment-file ignore rule", async () => {
    const gitignore = await readFile(path.join(root, ".gitignore"), "utf8");
    expect(gitignore).toMatch(/^\.env$/m);
    expect(gitignore).toMatch(/^\.env\*$/m);
    expect(gitignore).toMatch(/^!\.env\.example$/m);
    expect(gitignore).not.toContain("\\n");
  });

  it("does not require the removed Vite React plugin for the Vitest runner", async () => {
    const config = await readFile(
      path.join(root, "app", "vitest.config.ts"),
      "utf8"
    );
    expect(config).not.toContain("@vitejs/plugin-react");
  });

  it("pins the supported Node major away from EOL Node 20", async () => {
    const packageJson = JSON.parse(
      await readFile(path.join(root, "app", "package.json"), "utf8")
    );
    expect(packageJson.engines.node).toBe(">=22.0.0");
  });

  it("does not reflect arbitrary browser origins from the local terminal agent", async () => {
    const source = await readFile(
      path.join(root, "scripts", "devops-terminal-agent.mjs"),
      "utf8"
    );
    expect(source).toContain("DEVOPS_TERMINAL_ALLOWED_ORIGINS");
    expect(source).toContain("isAllowedOrigin");
    expect(source).not.toContain('res.setHeader("Access-Control-Allow-Origin", origin || "*")');
  });

  it("does not expose GitHub credentials through traced CI checkout commands", async () => {
    const workflow = await readFile(
      path.join(root, ".github", "workflows", "app.yml"),
      "utf8"
    );
    expect(workflow).not.toContain("git remote add origin \"https://x-access-token:${GH_TOKEN}");
    expect(workflow).toContain("http.extraheader=AUTHORIZATION: bearer ${GH_TOKEN}");
  });

  it("keeps the pairing token out of persistent browser storage", async () => {
    const source = await readFile(
      path.join(root, "app", "src", "data", "localTerminalAgent.ts"),
      "utf8"
    );
    expect(source).toContain("sessionStorage");
    expect(source).not.toContain("localStorage.setItem(TOKEN_KEY");
  });

  it("caps local runner output and rejects overlapping executions", async () => {
    const source = await readFile(
      path.join(root, "scripts", "devops-terminal-agent.mjs"),
      "utf8"
    );
    expect(source).toContain("MAX_OUTPUT");
    expect(source).toContain("executing");
    expect(source).toContain("429");
    expect(source).toContain("SIGKILL");
    expect(source).toContain("MAX_COMMAND_TIMEOUT");
  });
});
