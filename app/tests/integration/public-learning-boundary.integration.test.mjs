import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function read(path) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

describe("public marketing site and authenticated learner gateway boundary", () => {
  it("keeps the root route public and sends learners to an explicit gateway", () => {
    const page = read("src/app/page.tsx");
    const learn = read("src/app/learn/page.tsx");
    
    expect(page).not.toContain("await auth()");
    expect(page).toContain("href=\"/learn\"");
    expect(page).toContain("DevOps");
    expect(learn).toContain("await auth()");
    expect(learn).toContain("redirect(\"/sign-in\")");
    expect(learn).toContain("listCompletionHistoryForUser");
  });

  it("keeps Clerk scoped to authenticated surfaces instead of the public shell", () => {
    const layout = read("src/app/layout.tsx");
    const learnLayout = read("src/app/learn/layout.tsx");
    const signIn = read("src/app/sign-in/[[...sign-in]]/page.tsx");
    const signUp = read("src/app/sign-up/[[...sign-up]]/page.tsx");

    expect(layout).not.toContain("ClerkProvider");
    expect(learnLayout).toContain("<ClerkProvider>");
    expect(signIn).toContain("<ClerkProvider>");
    expect(signUp).toContain("<ClerkProvider>");
  });

  it("protects only authenticated application paths in the request boundary", () => {
    const proxy = read("src/proxy.ts");

    expect(proxy).toContain('"/learn(.*)"');
    expect(proxy).toContain('"/sign-in(.*)"');
    expect(proxy).toContain('"/sign-up(.*)"');
    expect(proxy).not.toContain('"/((?!_next');
  });

  it("uses the learner gateway as the authentication destination", () => {
    const signIn = read("src/app/sign-in/[[...sign-in]]/page.tsx");
    const signUp = read("src/app/sign-up/[[...sign-up]]/page.tsx");

    expect(signIn).toContain('fallbackRedirectUrl="/learn"');
    expect(signUp).toContain('fallbackRedirectUrl="/learn"');
  });
});
