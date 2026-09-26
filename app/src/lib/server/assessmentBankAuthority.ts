import type { AssessmentItem } from "../../data/assessment";

import beginner_B_F1 from "../../../../exams/items/beginner/B-F1.json" with { type: "json" };
import beginner_B_F2 from "../../../../exams/items/beginner/B-F2.json" with { type: "json" };
import beginner_B_A1 from "../../../../exams/items/beginner/B-A1.json" with { type: "json" };
import beginner_B_A2 from "../../../../exams/items/beginner/B-A2.json" with { type: "json" };
import beginner_B_A3 from "../../../../exams/items/beginner/B-A3.json" with { type: "json" };
import beginner_B_A4 from "../../../../exams/items/beginner/B-A4.json" with { type: "json" };
import beginner_B_A5 from "../../../../exams/items/beginner/B-A5.json" with { type: "json" };
import intermediate_I_F1 from "../../../../exams/items/intermediate/I-F1.json" with { type: "json" };
import intermediate_I_F2 from "../../../../exams/items/intermediate/I-F2.json" with { type: "json" };
import intermediate_I_A1 from "../../../../exams/items/intermediate/I-A1.json" with { type: "json" };
import intermediate_I_A2 from "../../../../exams/items/intermediate/I-A2.json" with { type: "json" };
import intermediate_I_A3 from "../../../../exams/items/intermediate/I-A3.json" with { type: "json" };
import intermediate_I_A4 from "../../../../exams/items/intermediate/I-A4.json" with { type: "json" };
import intermediate_I_A5 from "../../../../exams/items/intermediate/I-A5.json" with { type: "json" };
import intermediate_I_A6 from "../../../../exams/items/intermediate/I-A6.json" with { type: "json" };
import advanced_A_F1 from "../../../../exams/items/advanced/A-F1.json" with { type: "json" };
import advanced_A_F2 from "../../../../exams/items/advanced/A-F2.json" with { type: "json" };
import advanced_A_F3 from "../../../../exams/items/advanced/A-F3.json" with { type: "json" };
import advanced_A_A1 from "../../../../exams/items/advanced/A-A1.json" with { type: "json" };
import advanced_A_A2 from "../../../../exams/items/advanced/A-A2.json" with { type: "json" };
import advanced_A_A3 from "../../../../exams/items/advanced/A-A3.json" with { type: "json" };

type AssessmentBankFile = {
  sectionId: string;
  items: Array<Omit<AssessmentItem, "sectionId">>;
};

const banks: Record<string, AssessmentBankFile> = {
  "beginner/B-F1": beginner_B_F1 as AssessmentBankFile,
  "beginner/B-F2": beginner_B_F2 as AssessmentBankFile,
  "beginner/B-A1": beginner_B_A1 as AssessmentBankFile,
  "beginner/B-A2": beginner_B_A2 as AssessmentBankFile,
  "beginner/B-A3": beginner_B_A3 as AssessmentBankFile,
  "beginner/B-A4": beginner_B_A4 as AssessmentBankFile,
  "beginner/B-A5": beginner_B_A5 as AssessmentBankFile,
  "intermediate/I-F1": intermediate_I_F1 as AssessmentBankFile,
  "intermediate/I-F2": intermediate_I_F2 as AssessmentBankFile,
  "intermediate/I-A1": intermediate_I_A1 as AssessmentBankFile,
  "intermediate/I-A2": intermediate_I_A2 as AssessmentBankFile,
  "intermediate/I-A3": intermediate_I_A3 as AssessmentBankFile,
  "intermediate/I-A4": intermediate_I_A4 as AssessmentBankFile,
  "intermediate/I-A5": intermediate_I_A5 as AssessmentBankFile,
  "intermediate/I-A6": intermediate_I_A6 as AssessmentBankFile,
  "advanced/A-F1": advanced_A_F1 as AssessmentBankFile,
  "advanced/A-F2": advanced_A_F2 as AssessmentBankFile,
  "advanced/A-F3": advanced_A_F3 as AssessmentBankFile,
  "advanced/A-A1": advanced_A_A1 as AssessmentBankFile,
  "advanced/A-A2": advanced_A_A2 as AssessmentBankFile,
  "advanced/A-A3": advanced_A_A3 as AssessmentBankFile,
};

export function assessmentItemPool(courseId: string, sectionId: string): AssessmentItem[] {
  const bank = banks[`${courseId}/${sectionId}`];
  if (!bank || bank.sectionId !== sectionId) {
    throw new Error("Assessment item bank is unavailable for this section.");
  }
  return bank.items.map((item) => ({
    ...item,
    sectionId
  }));
}
