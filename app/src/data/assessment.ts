import { courses, type CourseLevel, type CourseSection } from "./programme";

export type AssessmentFamily = "conceptual" | "diagnostic" | "hands-on";
export type DifficultyBand = "foundation" | "applied" | "difficult" | "challenge";
export type CognitiveLevel = "mechanism" | "application" | "diagnosis" | "design";
export type AssessmentStatus = "blueprint-ready" | "items-authoring";

export type AssessmentBlueprint = {
  courseId: CourseLevel;
  sectionId: string;
  family: AssessmentFamily;
  targetDifficultyMix: Record<DifficultyBand, number>;
  requiredCognitiveLevels: CognitiveLevel[];
  minimumCompetencies: string[];
  expectedMinutes: number;
  status: AssessmentStatus;
  targetItemCount: number;
};

export const defaultDifficultyMix: Record<DifficultyBand, number> = {
  foundation: 0.15,
  applied: 0.35,
  difficult: 0.35,
  challenge: 0.15
};

const familyRules: Record<
  AssessmentFamily,
  { levels: CognitiveLevel[]; minutes: number }
> = {
  conceptual: {
    levels: ["mechanism", "application", "design"],
    minutes: 25
  },
  diagnostic: {
    levels: ["application", "diagnosis"],
    minutes: 25
  },
  "hands-on": {
    levels: ["application", "diagnosis", "design"],
    minutes: 45
  }
};

function competenciesFor(section: CourseSection, family: AssessmentFamily) {
  return [`${section.id}.core`, `${section.id}.${family}`];
}

export const assessmentBlueprints: AssessmentBlueprint[] = courses.flatMap(
  (course) =>
    course.sections.flatMap((section) =>
      (["conceptual", "diagnostic", "hands-on"] as AssessmentFamily[]).map(
        (family) => ({
          courseId: course.id,
          sectionId: section.id,
          family,
          targetDifficultyMix: defaultDifficultyMix,
          requiredCognitiveLevels: familyRules[family].levels,
          minimumCompetencies: competenciesFor(section, family),
          expectedMinutes: familyRules[family].minutes,
          status: "items-authoring" as const,
          targetItemCount: family === "conceptual" ? 20 : family === "diagnostic" ? 12 : 8
        })
      )
    )
);

export function getSectionAssessments(courseId: CourseLevel, sectionId: string) {
  return assessmentBlueprints.filter(
    (item) => item.courseId === courseId && item.sectionId === sectionId
  );
}

export function difficultyLabel(value: number) {
  return `${Math.round(value * 100)}%`;
}
