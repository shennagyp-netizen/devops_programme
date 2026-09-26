import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("lesson voice, content and animation boundary", () => {
  it("shares the actual PodcastCoach clock with the curriculum-owned interactive visual", () => {
    expect(source("src/components/LessonPanel.tsx")).toContain("<LessonVoiceClockProvider>");
    expect(source("src/components/PodcastCoach.tsx")).toContain("publishVoiceClock?.({ timeMs, manifest: audioManifest })");
    expect(source("src/components/InteractiveLessonIllustration.tsx")).toContain("animationCuesForVoice(binding, clock?.manifest)");
  });

  it("keeps an interactive sequence curriculum-bound and fail-closed", () => {
    const content = source("src/data/lessonContent.ts");
    const bindings = source("src/data/curriculumIllustrationBindings.ts");
    const visual = source("src/components/InteractiveLessonIllustration.tsx");

    expect(content).toContain('type: "interactive-illustration"');
    expect(content).toContain('id: "b1-2-request-replay"');
    expect(bindings).toContain('id: "B1.2:b1-2-request-replay"');
    expect(bindings).toContain('interactionMode: "sequential"');
    expect(visual).toContain("This interactive illustration is unavailable because its curriculum binding is invalid.");
  });
});
