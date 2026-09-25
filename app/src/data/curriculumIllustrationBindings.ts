import { lessonsByCourse } from "./courseLessons";
import {
  buildDefaultIllustrationBinding,
  type CurriculumIllustrationBindingV1
} from "./illustrationBindings";

export const authoredCurriculumIllustrationBindings: readonly CurriculumIllustrationBindingV1[] = [];

const lessons = Object.values(lessonsByCourse).flat();

export const curriculumIllustrationBindings: readonly CurriculumIllustrationBindingV1[] =
  lessons.flatMap((lesson) =>
    lesson.content.blocks.flatMap((block, contentIndex) => {
      if (
        block.type !== "illustration" &&
        block.type !== "interactive-illustration"
      ) {
        return [];
      }

      if (block.type === "interactive-illustration") {
        return authoredCurriculumIllustrationBindings.filter(
          (binding) =>
            binding.id === block.bindingId &&
            binding.lessonId === lesson.id &&
            binding.contentBlockId === block.id
        );
      }

      const authored = authoredCurriculumIllustrationBindings.find(
        (binding) =>
          binding.id === block.bindingId &&
          binding.lessonId === lesson.id &&
          binding.contentBlockId === block.id
      );

      return [
        authored ??
          buildDefaultIllustrationBinding(
            lesson.id,
            block,
            contentIndex
          )
      ];
    })
  );
