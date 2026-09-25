import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const schema = readFileSync(
  new URL("../../src/lib/server/schema.ts", import.meta.url),
  "utf8"
);
const server = readFileSync(
  new URL("../../src/lib/server/mastery.ts", import.meta.url),
  "utf8"
);
const action = readFileSync(
  new URL("../../src/app/actions/mastery.ts", import.meta.url),
  "utf8"
);

describe("mastery ledger security boundary", () => {
  it("binds mastery rows to the authenticated user", () => {
    expect(schema).toContain('references(() => authUsers.id, { onDelete: "cascade" })');
    expect(server).toContain("eq(learnerMasteryAttempts.userId, userId)");
  });

  it("does not accept a client learnerId", () => {
    expect(action).not.toContain("learnerId");
    expect(server).not.toContain("rawLearnerId");
  });

  it("scopes updates by both attempt identity and authenticated user", () => {
    expect(server).toContain("eq(learnerMasteryAttempts.id, attemptId)");
    expect(server).toContain("eq(learnerMasteryAttempts.userId, userId)");
  });
});
