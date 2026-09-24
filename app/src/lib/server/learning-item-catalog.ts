import { assessmentBlueprints } from "../../data/assessment";
import { lessonsByCourse } from "../../data/courseLessons";
import { projects } from "../../data/projects";
import type { CourseLevel } from "../../data/programme";
import type { LearningItemType } from "../progress-contract";

export type AuthoritativeLearningItem = {
  itemType: LearningItemType;
  itemId: string;
  course: CourseLevel;
  projectId: string | null;
};

const FAMILY_PREFIX: Record<"conceptual" | "diagnostic" | "hands-on", string> = {
  conceptual: "C",
  diagnostic: "D",
  "hands-on": "H"
};

const FAMILY_COUNTS: Record<"conceptual" | "diagnostic" | "hands-on", number> = {
  conceptual: 20,
  diagnostic: 12,
  "hands-on": 8
};

function sectionCourse(sectionId: string): CourseLevel | undefined {
  return assessmentBlueprints.find((item) => item.sectionId === sectionId)?.courseId;
}

function sectionProject(sectionId: string, course: CourseLevel): string | null {
  return lessonsByCourse[course].find((lesson) => lesson.sectionId === sectionId)?.projectId ?? null;
}

function resolveQuestion(itemId: string): AuthoritativeLearningItem | undefined {
  for (const blueprint of assessmentBlueprints) {
    const course = blueprint.courseId;
    const prefix = blueprint.sectionId.replaceAll("-", "");
    const familyPrefix = FAMILY_PREFIX[blueprint.family];
    const expected = FAMILY_COUNTS[blueprint.family];
    const pattern = new RegExp("^" + prefix + "-" + familyPrefix + "-(\\d{3})$");
    const match = itemId.match(pattern);

    if (!match) continue;

    const sequence = Number(match[1]);
    if (!Number.isInteger(sequence) || sequence < 1 || sequence > expected) {
      return undefined;
    }

    return {
      itemType: "question",
      itemId,
      course,
      projectId: sectionProject(blueprint.sectionId, course)
    };
  }

  return undefined;
}

export function resolveLearningItem(
  itemType: LearningItemType,
  itemId: string
): AuthoritativeLearningItem {
  if (itemType === "lesson") {
    for (const course of Object.keys(lessonsByCourse) as CourseLevel[]) {
      const lesson = lessonsByCourse[course].find((item) => item.id === itemId);
      if (lesson) {
        return {
          itemType,
          itemId,
          course: lesson.course,
          projectId: lesson.projectId
        };
      }
    }
  }

  if (itemType === "assignment") {
    const assignmentPrefix = "hands-on-";
    if (itemId.startsWith(assignmentPrefix)) {
      const lessonId = itemId.slice(assignmentPrefix.length);
      const lesson = resolveLearningItem("lesson", lessonId);
      return {
        itemType,
        itemId,
        course: lesson.course,
        projectId: lesson.projectId
      };
    }
  }

  if (itemType === "project") {
    const project = projects.find((item) => item.id === itemId);
    if (project) {
      return {
        itemType,
        itemId,
        course: project.course,
        projectId: project.id
      };
    }
  }

  if (itemType === "question") {
    const question = resolveQuestion(itemId);
    if (question) return question;
  }

  throw new Error("Learning item does not exist.");
}

export function learningItemCompletionMetadata(
  itemType: LearningItemType,
  itemId: string
) {
  const item = resolveLearningItem(itemType, itemId);

  return {
    course: item.course,
    projectId: item.projectId,
    verificationLevel: "self-report" as const
  };
}
