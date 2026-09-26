import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(path) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("MVP public learning boundary", () => {
  it("lets the public site enter the learner app directly", () => {
    const page = read("src/app/page.tsx");
    const learn = read("src/app/learn/page.tsx");

    expect(page).toContain('href="/learn"');
    expect(page).not.toContain("/sign-in");
    expect(page).not.toContain("/sign-up");
    expect(learn).toContain("return <App />");
    expect(learn).not.toContain("requireCurrentUser");
  });

  it("has no request-boundary authentication layer", () => {
    expect(() => read("src/proxy.ts")).toThrow();
  });

  it("keeps learner state browser-local and non-authoritative", () => {
    const app = read("src/App.tsx");
    const progress = read("src/data/localProgress.ts");

    expect(app).toContain("completeLocalLearningItem");
    expect(progress).toContain("localStorage");
    expect(progress).toContain('verificationLevel: "structured"');
    expect(progress).not.toMatch(/session|token|userId|learnerId/i);
  });
});
