import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("standalone animation preview red-team contract", () => {
  it("does not import curriculum or lesson data", () => {
    const code = source("src/components/AnimationPlayground.tsx");
    expect(code).not.toMatch(/(?:from|import\()(?:\s*)["'][^"']*\/data\//);
    expect(code).not.toContain("lessonContent");
    expect(code).not.toContain("curriculumIllustrationBindings");
    expect(code).not.toContain("CourseLesson");
  });

  it("does not create audio, persistence or course progression", () => {
    const code = source("src/components/AnimationPlayground.tsx");
    expect(code).not.toContain("new Audio");
    expect(code).not.toContain("AudioContext");
    expect(code).not.toContain("localStorage");
    expect(code).not.toContain("completeLesson");
    expect(code).not.toContain("PodcastCoach");
  });

  it("owns only a preview clock and passes the clock into AnimationStage", () => {
    const code = source("src/components/AnimationPlayground.tsx");
    expect(code).toContain("requestAnimationFrame");
    expect(code).toContain("cancelAnimationFrame");
    expect(code).toContain("currentTimeMs");
    expect(code).toContain("<AnimationStage");
  });

  it("exposes explicit play, pause, restart and seek controls", () => {
    const code = source("src/components/AnimationPlayground.tsx");
    expect(code).toContain("Play");
    expect(code).toContain("Pause");
    expect(code).toContain("Restart");
    expect(code).toContain('type="range"');
    expect(code).toContain('aria-label="Animation timeline"');
  });

  it("fails closed for unknown animation routes", () => {
    const page = source("src/app/animations/[animationId]/page.tsx");
    expect(page).toContain("notFound");
    expect(page).toContain("getAnimation");
  });
});
