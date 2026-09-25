import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  new URL("../../src/components/LessonPanel.tsx", import.meta.url),
  "utf8"
);

describe("mastery remediation integration contract", () => {
  it("routes failed hands-on validation into adaptive remediation", () => {
    expect(source).toContain('from "./RemediationPanel"');
    expect(source).toContain("classifyHandsOnFailure");
    expect(source).toContain("buildRemediationPlan");
    expect(source).toContain("setRemediationFailure(failure)");
    expect(source).toContain("Retry the original assignment");
  });

  it("does not mark a failed assignment as exercise-complete", () => {
    const failureBlockStart = source.indexOf(
      "if (!validation.valid) {"
    );
    const failureBlockEnd = source.indexOf(
      "return;",
      failureBlockStart
    );

    expect(failureBlockStart).toBeGreaterThanOrEqual(0);
    expect(source.slice(failureBlockStart, failureBlockEnd)).toContain(
      "setExerciseRecorded(false)"
    );
  });
});
