import { generatedAssessmentBanks } from "./generatedAssessmentBanks";
import type { AssessmentItem } from "./assessment";

type RawBank = {
  sectionId: string;
  items: readonly unknown[];
};

export const assessmentBanks: Record<string, RawBank> =
  generatedAssessmentBanks;

export function assessmentPool(sectionId: string): AssessmentItem[] {
  const bank = assessmentBanks[sectionId];

  if (!bank || bank.sectionId !== sectionId) {
    throw new Error("Assessment bank section mismatch.");
  }

  return bank.items.map((item) => ({
    ...(item as Omit<AssessmentItem, "sectionId">),
    sectionId
  }));
}
