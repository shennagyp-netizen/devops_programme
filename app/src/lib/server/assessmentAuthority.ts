import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb } from "./db";
import { assessmentAttempts, assessmentInstances } from "./schema";
import { courses } from "../../data/programme";
import {
  assessmentBlueprints,
  type AssessmentBlueprint,
  type AssessmentFamily,
  type AssessmentItem
} from "../../data/assessment";
import { generateAssessmentForm } from "../../assessment/formGenerator";
import { assessmentItemPool } from "./assessmentBankAuthority";
import type {
  IssueAssessmentCommand,
  SubmitAssessmentCommand
} from "../../framework/assessmentRequest";

const ASSESSMENT_TTL_MS = 2 * 60 * 60 * 1000;

export type AssessmentSafeQuestion = {
  id: string;
  family: AssessmentFamily;
  difficulty: AssessmentItem["difficulty"];
  cognitiveLevel: AssessmentItem["cognitiveLevel"];
  itemType: AssessmentItem["itemType"];
  expectedMinutes: number;
  competencyId: string;
  prompt: string;
  options?: string[];
};

export type AssessmentInstance = {
  id: string;
  courseId: string;
  sectionId: string;
  family: AssessmentFamily;
  formId: string;
  expiresAt: string;
  questions: AssessmentSafeQuestion[];
};

export type AssessmentAttemptRecord = {
  id: string;
  instanceId: string;
  autoScore: number;
  autoScorableCount: number;
  outcome: "scored" | "pending-review";
  submittedAt: string;
};

function requireUserId(value: string) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Authentication required.");
  }
  return value.trim();
}

function findBlueprint(command: IssueAssessmentCommand): AssessmentBlueprint {
  const course = courses.find((candidate) => candidate.id === command.courseId);
  if (!course || !course.sections.some((section) => section.id === command.sectionId)) {
    throw new Error("Unknown assessment course or section.");
  }

  const blueprint = assessmentBlueprints.find(
    (candidate) =>
      candidate.courseId === command.courseId &&
      candidate.sectionId === command.sectionId &&
      candidate.family === command.family
  );

  if (!blueprint) {
    throw new Error("Assessment blueprint is unavailable.");
  }

  return blueprint;
}

function safeQuestion(item: AssessmentItem): AssessmentSafeQuestion {
  return {
    id: item.id,
    family: item.family,
    difficulty: item.difficulty,
    cognitiveLevel: item.cognitiveLevel,
    itemType: item.itemType,
    expectedMinutes: item.expectedMinutes,
    competencyId: item.competencyId,
    prompt: item.prompt,
    ...(item.options ? { options: item.options } : {})
  };
}

function toInstance(
  row: typeof assessmentInstances.$inferSelect
): AssessmentInstance {
  const items = JSON.parse(row.itemSnapshotJson) as AssessmentItem[];
  return {
    id: row.id,
    courseId: row.courseId,
    sectionId: row.sectionId,
    family: row.family as AssessmentFamily,
    formId: row.formId,
    expiresAt: row.expiresAt.toISOString(),
    questions: items.map(safeQuestion)
  };
}

function scoreSubmission(
  items: AssessmentItem[],
  answers: SubmitAssessmentCommand["answers"]
) {
  let autoScore = 0;
  let autoScorableCount = 0;
  let requiresReview = false;

  for (const item of items) {
    if (item.options && Number.isInteger(item.correctOption)) {
      autoScorableCount += 1;
      if (answers[item.id] === item.correctOption) {
        autoScore += 1;
      }
      continue;
    }

    requiresReview = true;
  }

  return {
    autoScore,
    autoScorableCount,
    outcome: requiresReview ? "pending-review" as const : "scored" as const
  };
}

export async function issueAssessmentForUser(
  userId: string,
  command: IssueAssessmentCommand
): Promise<AssessmentInstance> {
  const learnerId = requireUserId(userId);
  const blueprint = findBlueprint(command);

  if (!["pilot", "calibrated", "operational"].includes(blueprint.status)) {
    throw new Error("Assessment form is not available for delivery.");
  }

  const seed = randomUUID();
  const pool = assessmentItemPool(command.courseId, command.sectionId);
  const form = generateAssessmentForm(blueprint, pool, seed);
  const expiresAt = new Date(Date.now() + ASSESSMENT_TTL_MS);

  const db = getDb();
  const [row] = await db
    .insert(assessmentInstances)
    .values({
      userId: learnerId,
      courseId: command.courseId,
      sectionId: command.sectionId,
      family: command.family,
      formId: form.formId,
      seed,
      itemSnapshotJson: JSON.stringify(form.items),
      status: "active",
      expiresAt
    })
    .returning();

  if (!row) {
    throw new Error("Assessment instance could not be created.");
  }

  return toInstance(row);
}

export async function submitAssessmentForUser(
  userId: string,
  command: SubmitAssessmentCommand
): Promise<AssessmentAttemptRecord> {
  const learnerId = requireUserId(userId);
  const db = getDb();

  return db.transaction(async (tx) => {
    const [instance] = await tx
      .select()
      .from(assessmentInstances)
      .where(
        and(
          eq(assessmentInstances.id, command.instanceId),
          eq(assessmentInstances.userId, learnerId)
        )
      )
      .limit(1);

    if (!instance) {
      throw new Error("Assessment instance was not found.");
    }

    if (instance.status !== "active") {
      throw new Error("Assessment instance has already been submitted.");
    }

    if (Date.now() > instance.expiresAt.getTime()) {
      await tx
        .update(assessmentInstances)
        .set({ status: "expired" })
        .where(
          and(
            eq(assessmentInstances.id, instance.id),
            eq(assessmentInstances.userId, learnerId),
            eq(assessmentInstances.status, "active")
          )
        );
      throw new Error("Assessment instance has expired.");
    }

    const items = JSON.parse(instance.itemSnapshotJson) as AssessmentItem[];
    const knownIds = new Set(items.map((item) => item.id));

    for (const questionId of Object.keys(command.answers)) {
      if (!knownIds.has(questionId)) {
        throw new Error("Assessment submission contains an item outside the issued form.");
      }
    }

    const score = scoreSubmission(items, command.answers);

    const [consumed] = await tx
      .update(assessmentInstances)
      .set({
        status: "submitted",
        submittedAt: new Date()
      })
      .where(
        and(
          eq(assessmentInstances.id, instance.id),
          eq(assessmentInstances.userId, learnerId),
          eq(assessmentInstances.status, "active")
        )
      )
      .returning();

    if (!consumed) {
      throw new Error("Assessment submission replay detected.");
    }

    const [row] = await tx
      .insert(assessmentAttempts)
      .values({
        instanceId: instance.id,
        userId: learnerId,
        answersJson: JSON.stringify(command.answers),
        autoScore: score.autoScore,
        autoScorableCount: score.autoScorableCount,
        outcome: score.outcome
      })
      .returning();

    if (!row) {
      throw new Error("Assessment attempt could not be stored.");
    }

    return {
      id: row.id,
      instanceId: row.instanceId,
      autoScore: row.autoScore,
      autoScorableCount: row.autoScorableCount,
      outcome: row.outcome as AssessmentAttemptRecord["outcome"],
      submittedAt: row.submittedAt.toISOString()
    };
  });
}
