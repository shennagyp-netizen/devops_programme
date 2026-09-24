import { lessonsByCourse } from "../../data/courseLessons";
import { projectsByCourse } from "../../data/projects";
import type { LearningItemType } from "../progress-contract";

export type PublishedLearningItem = {
  itemType: LearningItemType;
  itemId: string;
  course: "beginner" | "intermediate" | "advanced";
  projectId: string;
};

const courses = ["beginner", "intermediate", "advanced"] as const;

const lessonIndex = new Map<string, PublishedLearningItem>();
const projectIndex = new Map<string, PublishedLearningItem>();

for (const course of courses) {
  for (const lesson of lessonsByCourse[course]) {
    lessonIndex.set(lesson.id, {
      itemType: "lesson",
      itemId: lesson.id,
      course,
      projectId: lesson.projectId
    });
  }

  for (const project of projectsByCourse[course]) {
    projectIndex.set(project.id, {
      itemType: "project",
      itemId: project.id,
      course,
      projectId: project.id
    });
  }
}

export function resolvePublishedLearningItem(input: {
  itemType: LearningItemType;
  itemId: string;
}): PublishedLearningItem {
  if (input.itemType === "lesson") {
    const item = lessonIndex.get(input.itemId);
    if (!item) throw new Error("Published learning item not found.");
    return item;
  }

  if (input.itemType === "project") {
    const item = projectIndex.get(input.itemId);
    if (!item) throw new Error("Published learning item not found.");
    return item;
  }

  throw new Error(
    `Learning item type ${input.itemType} is not currently published.`
  );
}
