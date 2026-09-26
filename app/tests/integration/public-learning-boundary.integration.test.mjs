import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(path) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("public marketing site and first-party authenticated learner gateway boundary", () => {
  it("keeps the root route public and sends learners to an explicit gateway", () => {
    const page = read("src/app/page.tsx");
    const learn = read("src/app/learn/page.tsx");

    expect(page).not.toContain("await auth()");
    expect(page).toContain('href="/learn"');
    expect(page).toContain('href="/sign-up"');
    expect(learn).toContain("requireCurrentUser");
    expect(learn).toContain('redirect("/sign-in")');
    expect(learn).toContain("listCompletionHistoryForUser");
  });

  it("keeps the public shell independent of first-party session state", () => {
    const layout = read("src/app/layout.tsx");
    const learnLayout = read("src/app/learn/layout.tsx");

    expect(layout).not.toContain("getCurrentUser");
    expect(learnLayout).not.toContain("@clerk");
  });

  it("protects only the learner gateway in the request boundary", () => {
    const proxy = read("src/proxy.ts");

    expect(proxy).toContain('"/learn(.*)"');
    expect(proxy).toContain("devops_session");
    expect(proxy).not.toContain("clerk");
  });

  it("uses first-party auth routes", () => {
    const signIn = read("src/app/sign-in/[[...sign-in]]/page.tsx");
    const signUp = read("src/app/sign-up/[[...sign-up]]/page.tsx");

    expect(signIn).toContain("<AuthForm");
    expect(signUp).toContain("<AuthForm");
    expect(signIn).not.toContain("Clerk");
    expect(signUp).not.toContain("Clerk");
  });
});
