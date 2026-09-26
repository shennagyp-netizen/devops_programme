import type { AssessmentItem } from "../data/assessment";

export type AssessmentAnswer = {
  itemId: string;
  value: number | string;
};

export type AssessmentResult = {
  itemCount: number;
  answeredCount: number;
  autoScoredCount: number;
  correctCount: number;
  autoScorePercent: number | null;
  reviewRequiredCount: number;
  status: "scored" | "submitted-review-required";
};

const MAX_TEXT_ANSWER_CHARS = 8_000;

export function publicAssessmentItem(item: AssessmentItem) {
  const { correctOption: _correctOption, ...publicItem } = item;
  return publicItem;
}

export function validateAssessmentAnswers(
  items: AssessmentItem[],
  answers: AssessmentAnswer[]
) {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const seen = new Set<string>();

  if (answers.length > items.length) {
    throw new Error("Too many answers.");
  }

  for (const answer of answers) {
    if (seen.has(answer.itemId)) {
      throw new Error("Duplicate assessment answer.");
    }

    const item = itemMap.get(answer.itemId);
    if (!item) {
      throw new Error("Unknown assessment item.");
    }

    seen.add(answer.itemId);

    if (item.options?.length) {
      if (
        typeof answer.value !== "number" ||
        !Number.isInteger(answer.value) ||
        answer.value < 0 ||
        answer.value >= item.options.length
      ) {
        throw new Error("Invalid selected-response answer.");
      }
      continue;
    }

    if (
      typeof answer.value !== "string" ||
      answer.value.trim().length === 0 ||
      answer.value.length > MAX_TEXT_ANSWER_CHARS
    ) {
      throw new Error("Invalid constructed response.");
    }
  }
}

export function scoreAssessment(
  items: AssessmentItem[],
  answers: AssessmentAnswer[]
): AssessmentResult {
  validateAssessmentAnswers(items, answers);

  const answerMap = new Map(answers.map((answer) => [answer.itemId, answer.value]));
  let autoScoredCount = 0;
  let correctCount = 0;
  let reviewRequiredCount = 0;

  for (const item of items) {
    const value = answerMap.get(item.id);

    if (item.options?.length && typeof item.correctOption === "number") {
      autoScoredCount += 1;
      if (value === item.correctOption) correctCount += 1;
    } else if (value !== undefined) {
      reviewRequiredCount += 1;
    }
  }

  return {
    itemCount: items.length,
    answeredCount: answers.length,
    autoScoredCount,
    correctCount,
    autoScorePercent:
      autoScoredCount > 0
        ? Math.round((correctCount / autoScoredCount) * 100)
        : null,
    reviewRequiredCount,
    status: reviewRequiredCount > 0 ? "submitted-review-required" : "scored"
  };
}

export function attemptExpiresAt(startedAt: Date, minutes: number) {
  return new Date(startedAt.getTime() + minutes * 60_000);
}