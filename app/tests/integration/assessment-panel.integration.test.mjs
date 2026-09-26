import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = () =>
  readFileSync(
    resolve(process.cwd(), "src/components/AssessmentPanel.tsx"),
    "utf8"
  );

describe("assessment panel trust boundary", () => {
  it("uses server actions for issuance and submission", () => {
    const code = source();

    expect(code).toContain('from "../app/actions/assessment"');
    expect(code).toContain("issueAssessmentAction");
    expect(code).toContain("submitAssessmentAction");
  });

  it("does not render server-owned answer keys or rubrics", () => {
    const code = source();

    expect(code).not.toContain("correctOption");
    expect(code).not.toContain("expectedElements");
    expect(code).not.toContain("scoringNote");
    expect(code).not.toContain('item.scoring');
  });

  it("does not use browser storage for authoritative assessment state", () => {
    const code = source();

    expect(code).not.toContain("localStorage");
    expect(code).not.toContain("sessionStorage");
  });

  it("does not invent a universal pass percentage", () => {
    const code = source();

    expect(code).not.toMatch(/(?:70|80|90)\s*%/);
    expect(code).not.toMatch(/pass(?:ed)?\s*(?:if|at)\s*score/i);
  });

  it("reports pending review instead of pretending open-response scoring is complete", () => {
    const code = source();

    expect(code).toContain("pending-review");
    expect(code).toContain("manual review");
  });
});
