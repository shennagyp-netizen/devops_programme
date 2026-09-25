import { describe, expect, it } from "vitest";
import {
  buildDefaultIllustrationBinding,
  validateLessonIllustrationBindings
} from "../../src/data/illustrationBindings.ts";
import { lessonsByCourse } from "../../src/data/courseLessons.ts";
import { animationLibrary } from "../../src/animations/library.ts";
import { curriculumIllustrationBindings } from "../../src/data/curriculumIllustrationBindings.ts";

describe("curriculum illustration binding integration", () => {
  it("resolves every illustration block in the authored programme", () => {
    const result = validateLessonIllustrationBindings(
      Object.values(lessonsByCourse).flat(),
      {
        bindings: curriculumIllustrationBindings,
        animationDefinitions: animationLibrary
      }
    );

    expect(result.valid).toBe(true);
    expect(result.failures).toEqual([]);
    expect(result.bindings).toHaveLength(
      Object.values(lessonsByCourse)
        .flat()
        .reduce(
          (count, lesson) =>
            count +
            lesson.content.blocks.filter(
              (block) =>
                block.type === "illustration" ||
                block.type === "interactive-illustration"
            ).length,
          0
        )
    );
  });

  it("uses the content block binding id as the exact lookup identity", () => {
    const lesson = Object.values(lessonsByCourse)
      .flat()
      .find((candidate) => candidate.id === "B1.4");

    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toBeDefined();

    const binding = buildDefaultIllustrationBinding(
      lesson.id,
      illustration,
      lesson.content.blocks.indexOf(illustration)
    );

    expect(binding.id).toBe(illustration.bindingId);
    expect(binding.contentBlockId).toBe(illustration.id);
  });
  it("fails closed when the curriculum binding registry is incomplete", () => {
    const result = validateLessonIllustrationBindings(
      Object.values(lessonsByCourse).flat(),
      {
        bindings: [],
        animationDefinitions: animationLibrary
      }
    );

    expect(result.valid).toBe(false);
    expect(result.failures.some((failure) =>
      failure.includes("has no authored curriculum binding")
    )).toBe(true);
  });

});
