import type { LearningItemDefinition } from "../framework/contracts";
import type { LearningItemType } from "../lib/progress-contract";
import { courseLessons } from "./courseLessons";
import { courses } from "./programme";
import { projects } from "./projects";

export type ProgrammeLearningItem = LearningItemDefinition & {
  itemType: LearningItemType;
  course: (typeof courses)[number]["id"];
  projectId: string | null;
};

const lessonItems: ProgrammeLearningItem[] = courseLessons.map((lesson) => ({
  id: lesson.id,
  itemType: "lesson",
  kind: "lesson",
  programmeId: "devops",
  course: lesson.course,
  projectId: lesson.projectId,
  completion: {
    mode: "evidence",
    requiredEvidence: ["exercise"]
  }
}));

const projectItems: ProgrammeLearningItem[] = projects.map((project) => ({
  id: project.id,
  itemType: "project",
  kind: "project",
  programmeId: "devops",
  course: project.course,
  projectId: project.id,
  completion: {
    mode: "evidence",
    requiredEvidence: ["exercise", "failure", "recovery"]
  }
}));

export const programmeLearningItems = [...lessonItems, ...projectItems];

const itemsById = new Map(
  programmeLearningItems.map((item) => [item.id, item] as const)
);

export function findProgrammeLearningItem(
  itemId: string
): ProgrammeLearningItem | undefined {
  return itemsById.get(itemId);
}
