import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("standalone animation page integration contract", () => {
  it("provides a gallery route independent from the curriculum", () => {
    const code = source("src/app/animations/page.tsx");
    expect(code).toContain("animationLibrary");
    expect(code).toContain("/animations/");
    expect(code).not.toContain("lessonContent");
    expect(code).not.toContain("curriculumIllustrationBindings");
    expect(code).not.toContain("CourseLesson");
    expect(code).not.toContain("auth(");
    expect(code).not.toContain("redirect(");
  });

  it("provides an animation-id route with fail-closed lookup", () => {
    const code = source("src/app/animations/[animationId]/page.tsx");
    expect(code).toContain("getAnimation");
    expect(code).toContain("notFound");
    expect(code).toContain("<AnimationPlayground");
    expect(code).not.toContain("LessonPanel");
    expect(code).not.toContain("PodcastCoach");
    expect(code).not.toContain("auth(");
    expect(code).not.toContain("redirect(");
  });

  it("keeps route-level preview metadata separate from animation definitions", () => {
    const code = source("src/app/animations/[animationId]/page.tsx");
    expect(code).toContain("generateMetadata");
    expect(code).not.toContain("animationDefinition.lessonId");
  });
});

  it("keeps the preview host outside the reusable animation library", () => {
    const library = source("src/animations/library.ts");
    const stage = source("src/animations/AnimationStage.tsx");
    expect(library).not.toContain("AnimationPlayground");
    expect(stage).not.toContain("AnimationPlayground");
  });
