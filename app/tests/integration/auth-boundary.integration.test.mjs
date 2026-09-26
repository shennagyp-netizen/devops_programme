import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(path) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("self-hosted authentication boundary", () => {
  it("has no Clerk dependency or Clerk runtime configuration", () => {
    const packageJson = read("package.json");
    const env = read(".env.example");
    const proxy = read("src/proxy.ts");

    expect(packageJson).not.toContain("@clerk/nextjs");
    expect(env).not.toContain("CLERK_");
    expect(env).not.toContain("NEXT_PUBLIC_CLERK_");
    expect(proxy).not.toContain("clerk");
  });

  it("protects the learner gateway with the first-party session cookie", () => {
    const learn = read("src/app/learn/page.tsx");
    const auth = read("src/lib/server/auth.ts");
    const proxy = read("src/proxy.ts");

    expect(learn).toContain("requireCurrentUser");
    expect(learn).not.toContain("auth()");
    expect(auth).toContain("devops_session");
    expect(auth).toContain("httpOnly");
    expect(auth).toContain("sameSite");
    expect(proxy).toContain("/learn(.*)");
  });

  it("uses the database user identity as the only progress identity", () => {
    const progressAction = read("src/app/actions/progress.ts");
    const progress = read("src/lib/server/progress.ts");

    expect(progressAction).toContain("requireCurrentUser");
    expect(progressAction).not.toContain("learnerId");
    expect(progressAction).not.toContain("@clerk");
    expect(progress).toContain("userId");
  });
});
