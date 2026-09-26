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

  it("keeps completion gated by the required structured evidence", () => {
    const code = source();

    expect(code).toContain("!exerciseRecorded && !mastered");
    expect(code).toContain("Complete the required exercise first");
    expect(code).toContain("Validate and record evidence");
    expect(code).toContain("setExerciseRecorded(true)");
    expect(code).toContain("browser-local evidence");
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

  it("keeps the verified laptop terminal path connected to the lesson", () => {
    const code = source();

    expect(code).toContain("VERIFIED LAPTOP TERMINAL");
    expect(code).toContain("runtimeTaskForLesson");
    expect(code).toContain("localTerminalAgent");
    expect(code).toContain("runOnLaptop");
    expect(code).toContain("setLocalTerminalToken");
    expect(code).toContain("recordMachineVerification");
    expect(code).toContain("Pair this browser with the local agent");
  });

  it("requires a conceptual proof check before accepting hands-on evidence", () => {
    const code = source();

    expect(code).toContain("masteryCheckpoint");
    expect(code).toContain("Predict before you submit");
    expect(code).toContain("exerciseCheckpointAnswer === null");
    expect(code).toContain("answered incorrectly");
    expect(code).toContain("startMasteryRemediation");
  });

  it("keeps authenticated mastery history separate from local remediation state", () => {
    const code = source();

    expect(code).toContain("readMasteryAttempts(lesson.id)");
    expect(code).toContain("initialMasteryHistory");
    expect(code).not.toContain("serverAttemptsForLesson");
    expect(code).toContain("recordMasteryAttemptAction");
  });
});
