import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("animation stage integration contract", () => {
  it("renders SVG directly and consumes deterministic runtime state", () => {
    const code = source("src/animations/AnimationStage.tsx");

    expect(code).toContain("<svg");
    expect(code).toContain('viewBox="0 0 1200 675"');
    expect(code).toContain("animationTimelineAt");
    expect(code).toContain("currentTimeMs");
    expect(code).not.toContain("new Audio");
    expect(code).not.toContain("AudioContext");
    expect(code).not.toContain("setTimeout");
    expect(code).not.toContain("setInterval");
  });

  it("does not create course or persistence dependencies", () => {
    const code = source("src/animations/AnimationStage.tsx");

    expect(code).not.toContain("courseLessons");
    expect(code).not.toContain("LessonPanel");
    expect(code).not.toContain("PodcastCoach");
    expect(code).not.toContain("localStorage");
    expect(code).not.toContain("fetch(");
  });

  it("supports reduced motion without removing the diagram meaning", () => {
    const code = source("src/animations/AnimationStage.tsx");
    expect(code).toContain("prefersReducedMotion");
    expect(code).toContain("reducedMotion");
    expect(code).toContain("aria-label");
  });

  it("uses semantic status classes instead of arbitrary per-animation colors", () => {
    const code = source("src/animations/AnimationStage.tsx");
    expect(code).toContain("animation-status-");
    expect(code).not.toMatch(/fill\s*=\s*["']#/);
    expect(code).not.toMatch(/stroke\s*=\s*["']#/);
  });
});
