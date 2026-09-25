import type { AssessmentItem } from "./assessment";

import BA1 from "../../../exams/items/beginner/B-A1.json";
import BA2 from "../../../exams/items/beginner/B-A2.json";
import BA3 from "../../../exams/items/beginner/B-A3.json";
import BA4 from "../../../exams/items/beginner/B-A4.json";
import BA5 from "../../../exams/items/beginner/B-A5.json";
import BF1 from "../../../exams/items/beginner/B-F1.json";
import BF2 from "../../../exams/items/beginner/B-F2.json";

import IA1 from "../../../exams/items/intermediate/I-A1.json";
import IA2 from "../../../exams/items/intermediate/I-A2.json";
import IA3 from "../../../exams/items/intermediate/I-A3.json";
import IA4 from "../../../exams/items/intermediate/I-A4.json";
import IA5 from "../../../exams/items/intermediate/I-A5.json";
import IA6 from "../../../exams/items/intermediate/I-A6.json";
import IF1 from "../../../exams/items/intermediate/I-F1.json";
import IF2 from "../../../exams/items/intermediate/I-F2.json";

import AA1 from "../../../exams/items/advanced/A-A1.json";
import AA2 from "../../../exams/items/advanced/A-A2.json";
import AA3 from "../../../exams/items/advanced/A-A3.json";
import AF1 from "../../../exams/items/advanced/A-F1.json";
import AF2 from "../../../exams/items/advanced/A-F2.json";
import AF3 from "../../../exams/items/advanced/A-F3.json";

type Bank = { items: AssessmentItem[] };

const banks: Bank[] = [
  BA1, BA2, BA3, BA4, BA5, BF1, BF2,
  IA1, IA2, IA3, IA4, IA5, IA6, IF1, IF2,
  AA1, AA2, AA3, AF1, AF2, AF3
] as Bank[];

const allAssessmentItems = banks.flatMap((bank) => bank.items);

export function getGradableAssessmentItems(sectionId: string, family: string) {
  return allAssessmentItems.filter(
    (item) =>
      item.sectionId === sectionId &&
      item.family === family &&
      Array.isArray(item.options) &&
      item.options.length >= 2 &&
      Number.isInteger(item.correctOption)
  );
}

function bandRank(band: string) {
  return {
    foundation: 0,
    applied: 1,
    difficult: 2,
    challenge: 3
  }[band] ?? 99;
}

export function getPracticeForm(sectionId: string, family: string) {
  return getGradableAssessmentItems(sectionId, family)
    .slice()
    .sort((a, b) => {
      const byDifficulty = bandRank(a.difficulty) - bandRank(b.difficulty);
      return byDifficulty || a.id.localeCompare(b.id);
    })
    .filter((item, index, items) => {
      const firstOfDifficulty =
        items.findIndex((candidate) => candidate.difficulty === item.difficulty) === index;
      return firstOfDifficulty || index < 4;
    })
    .slice(0, 6);
}

export function findAlternateAssessmentItem(
  current: AssessmentItem,
  usedIds: Set<string>
) {
  return getGradableAssessmentItems(current.sectionId, current.family).find(
    (item) =>
      item.id !== current.id &&
      !usedIds.has(item.id) &&
      item.competencyId === current.competencyId
  ) ?? getGradableAssessmentItems(current.sectionId, current.family).find(
    (item) => item.id !== current.id && !usedIds.has(item.id)
  );
}

export function assessmentExplanation(item: AssessmentItem) {
  if (item.scoringNote) return item.scoringNote;

  if (item.expectedElements?.length) {
    return Array.isArray(item.expectedElements)
      ? "A strong answer should include: " + item.expectedElements.join("; ") + "."
      : "A strong answer should contain the required reasoning elements for this competency.";
  }

  if (Array.isArray(item.scoring?.full) && item.scoring.full.length) {
    return item.scoring.full.join(" ");
  }

  return "Review the lesson mechanism, then answer the same competency in a new form.";
}
