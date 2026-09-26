import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = () =>
  readFileSync(
    resolve(process.cwd(), "src/components/LessonPanel.tsx"),
    "utf8"
  );

describe("lesson panel integration contract", () => {
  it("keeps the continuous co-teacher outside the mode switch", () => {
    const code = source();
    const coach = code.indexOf("<PodcastCoach lesson={lesson} />");
    const tabs = code.indexOf('className="mode-tabs"');

    expect(coach).toBeGreaterThanOrEqual(0);
    expect(tabs).toBeGreaterThan(coach);
  });

  it("keeps the content feed attached to Learn without making it the voice owner", () => {
    const code = source();

    expect(code).toContain(
      "<LessonContentFeed blocks={lesson.content.blocks} />"
    );
    expect(code).toContain('mode === "learn"');
    expect(code).toContain("<PodcastCoach lesson={lesson} />");
  });

  it("exposes exactly the intended lesson modes and no legacy Listen mode", () => {
    const code = source();

    expect(code).toContain(
      'export type LessonMode = "learn" | "do" | "recall" | "design" | "assessment"'
    );
    expect(code).toContain(
      '["learn", "do", "recall", "design", "assessment"] as LessonMode[]'
    );
    expect(code).not.toContain('"listen"');
  });

  it("keeps completion gated by the required exercise", () => {
    const code = source();

    expect(code).toContain("!authoritativeEvidenceReady && !mastered");
    expect(code).toContain("Waiting for server verification");
    expect(code).toContain("Complete the required exercise first");
    expect(code).toContain("Validate and record evidence");
    expect(code).toContain("setExerciseRecorded(true)");
  });

  it("scopes local evidence by lesson identity", () => {
    const code = source();
    const lessonEvidenceKey = "devops-programme-hands-on-evidence:" + "$" + "{lesson.id}";

    expect(code).toContain(lessonEvidenceKey);
    expect(code).toContain("localStorage.getItem(evidenceKey)");
    expect(code).toContain("localStorage.setItem(");
  });

  it("clears locally cached evidence state when stored JSON is invalid", () => {
    const code = source();

    expect(code).toContain("JSON.parse(stored)");
    expect(code).toContain("catch {");
    expect(code).toContain("setHandsOnEvidence({})");
    expect(code).toContain("setExerciseRecorded(false)");
    expect(code).toContain("setMachineResults([])");
  });

  it("does not let diagnostic adaptation remove the required hands-on exercise", () => {
    const code = source();

    expect(code).toContain('diagnosticRecommendation === "skip-theory"');
    expect(code).toContain('diagnosticRecommendation === "condense-theory"');
    expect(code).toContain('diagnosticRecommendation === "remediate"');
    expect(code).toContain("getHandsOnTask(lesson)");
    expect(code).toContain("validateHandsOnEvidence");
    expect(code).toContain("handsOnTask.steps.map");
  });

  it("keeps machine verification advisory until the declared exercise scope is satisfied", () => {
    const code = source();

    expect(code).toContain('runtimeTask.scope === "exercise"');
    expect(code).toContain(
      "Complete the required hands-on exercise below to unlock the lesson."
    );
    expect(code).toContain(
      "This task is structurally validated locally. Completion remains locked"
    );
  });
  it("requires a conceptual proof check before accepting hands-on evidence", () => {
    const code = source();

    expect(code).toContain("masteryCheckpoint");
    expect(code).toContain("Predict before you submit");
    expect(code).toContain("exerciseCheckpointAnswer === null");
    expect(code).toContain("answered incorrectly");
    expect(code).toContain("startMasteryRemediation");
  });

  it("routes machine-verification failure into the same remediation loop", () => {
    const code = source();

    expect(code).toContain('startMasteryRemediation([message], "mechanism-reteach")');
    expect(code).toContain("Laptop terminal execution failed");
    expect(code).toContain("Laptop terminal execution failed");
  });


  it("does not accept unsigned imported machine evidence as trusted proof", () => {
    const code = source();

    expect(code).toContain("Signed SSH execution was verified by the learning server.");
    expect(code).toContain("Unsigned machine evidence is not accepted.");
    expect(code).not.toContain("recordMachineVerification({");
  });

  it("keeps authenticated mastery history visible to the lesson model", () => {
    const code = source();

    expect(code).toContain("initialMasteryHistory");
    expect(code).toContain("serverAttemptsForLesson");
    expect(code).toContain("Math.max(readMasteryAttempts(lesson.id), serverAttemptsForLesson)");
  });

});
