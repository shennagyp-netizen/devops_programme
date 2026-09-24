import { courses, type CourseLevel, type CourseSection } from "./programme";

export type AssessmentFamily = "conceptual" | "diagnostic" | "hands-on";
export type DifficultyBand = "foundation" | "applied" | "difficult" | "challenge";
export type CognitiveLevel = "mechanism" | "application" | "diagnosis" | "design";
export type AssessmentStatus =
  | "blueprint-ready"
  | "items-authoring"
  | "pilot"
  | "calibrated"
  | "operational";

export type AssessmentItem = {
  id: string;
  sectionId: string;
  family: AssessmentFamily;
  difficulty: DifficultyBand;
  cognitiveLevel: CognitiveLevel;
  itemType: string;
  expectedMinutes: number;
  competencyId: string;
  prompt: string;
  options?: string[];
  correctOption?: number;
  expectedElements?: string[];
  scoring?: {
    full?: string[];
    partial?: string[];
    zero?: string[];
  };
  scoringNote?: string;
  environment?: string[];
  initialState?: string;
  allowedOperations?: string[];
  success?: string[];
  evidence?: string[];
  failureConditions?: string[];
  recoveryRequirements?: string[];
  resetStrategy?: string;
};

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
    minutes: 60
  },
  diagnostic: {
    levels: ["application", "diagnosis"],
    minutes: 45
  },
  "hands-on": {
    levels: ["application", "diagnosis", "design"],
    minutes: 90
  }
};

function competenciesFor(section: CourseSection, family: AssessmentFamily) {
  if (family === "conceptual") return [`${section.id}.core`];
  return [`${section.id}.${family}`];
}

const pilotSections = new Set(["B-F1", "B-F2", "B-A1"]);

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
          status: pilotSections.has(section.id) ? "pilot" as const : "items-authoring" as const,
          targetItemCount:
            family === "conceptual" ? 20 : family === "diagnostic" ? 12 : 8
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
