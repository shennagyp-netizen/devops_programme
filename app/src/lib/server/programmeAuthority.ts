import type { LearningItemDefinition, LearningItemKind } from "../../framework/contracts";
import { courseLessons } from "../../data/courseLessons";
import { courses } from "../../data/programme";
import { projects } from "../../data/projects";

export type ProgrammeLearningItem = LearningItemDefinition & {
  itemType: LearningItemKind;
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
    requiredEvidence: []
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
    requiredEvidence: []
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
