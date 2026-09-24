export type AssessmentFamily = "conceptual" | "diagnostic" | "hands-on";

export type DifficultyBand = "foundation" | "applied" | "difficult" | "challenge";

export type CognitiveLevel =
  | "mechanism"
  | "application"
  | "diagnosis"
  | "design";

export type AssessmentItem = {
  id: string;
  sectionId: string;
  competencyId: string;
  family: AssessmentFamily;
  difficulty: DifficultyBand;
  cognitiveLevel: CognitiveLevel;
  expectedMinutes: number;
};

export type AssessmentBlueprint = {
  sectionId: string;
  family: AssessmentFamily;
  targetDifficultyMix: Record<DifficultyBand, number>;
  requiredCognitiveLevels: CognitiveLevel[];
  minimumCompetencies: string[];
};

export const defaultDifficultyMix: Record<DifficultyBand, number> = {
  foundation: 0.15,
  applied: 0.35,
  difficult: 0.35,
  challenge: 0.15
};

export const sectionAssessmentBlueprints: AssessmentBlueprint[] = [];
