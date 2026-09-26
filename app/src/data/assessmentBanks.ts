import bank0 from "../../../exams/items/beginner/B-F1.json";
import bank1 from "../../../exams/items/beginner/B-F2.json";
import bank2 from "../../../exams/items/beginner/B-A1.json";
import bank3 from "../../../exams/items/beginner/B-A2.json";
import bank4 from "../../../exams/items/beginner/B-A3.json";
import bank5 from "../../../exams/items/beginner/B-A4.json";
import bank6 from "../../../exams/items/beginner/B-A5.json";
import bank7 from "../../../exams/items/intermediate/I-F1.json";
import bank8 from "../../../exams/items/intermediate/I-F2.json";
import bank9 from "../../../exams/items/intermediate/I-A1.json";
import bank10 from "../../../exams/items/intermediate/I-A2.json";
import bank11 from "../../../exams/items/intermediate/I-A3.json";
import bank12 from "../../../exams/items/intermediate/I-A4.json";
import bank13 from "../../../exams/items/intermediate/I-A5.json";
import bank14 from "../../../exams/items/intermediate/I-A6.json";
import bank15 from "../../../exams/items/advanced/A-F1.json";
import bank16 from "../../../exams/items/advanced/A-F2.json";
import bank17 from "../../../exams/items/advanced/A-F3.json";
import bank18 from "../../../exams/items/advanced/A-A1.json";
import bank19 from "../../../exams/items/advanced/A-A2.json";
import bank20 from "../../../exams/items/advanced/A-A3.json";

import type { AssessmentItem } from "../data/assessment";

type RawBank = {
  sectionId: string;
  items: unknown[];
};

export const assessmentBanks: Record<string, RawBank> = {
  "B-F1": bank0,
  "B-F2": bank1,
  "B-A1": bank2,
  "B-A2": bank3,
  "B-A3": bank4,
  "B-A4": bank5,
  "B-A5": bank6,
  "I-F1": bank7,
  "I-F2": bank8,
  "I-A1": bank9,
  "I-A2": bank10,
  "I-A3": bank11,
  "I-A4": bank12,
  "I-A5": bank13,
  "I-A6": bank14,
  "A-F1": bank15,
  "A-F2": bank16,
  "A-F3": bank17,
  "A-A1": bank18,
  "A-A2": bank19,
  "A-A3": bank20
};

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
