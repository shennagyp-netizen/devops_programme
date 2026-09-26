import { and, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import {
  learnerCompletionEvidence,
  learnerProgressHistory,
  learnerVerifiedEvidence
} from "./schema";
import { findProgrammeLearningItem } from "./programmeAuthority";
import { evaluateLearningTransition } from "../../framework/authority";
import type {
  LearningTransitionFailure,
  VerifiedEvidenceRecord
} from "../../framework/contracts";
import type { CompletionRecord } from "../progress-contract";

export type AuthoritativeCompletionCommand = {
  itemId: string;
  evidenceRefs?: string[];
};

const AUTHORITY_VERIFICATION_LEVEL = "authoritative-evidence";

const messages: Record<LearningTransitionFailure, string> = {
  UNKNOWN_LEARNING_ITEM: "Unknown learning item.",
  UNSUPPORTED_COMPLETION_MODE: "This learning item does not support evidence completion.",
  EVIDENCE_NOT_VERIFIED: "Required evidence was not verified.",
  EVIDENCE_LEARNER_MISMATCH: "Required evidence belongs to another learner.",
  EVIDENCE_ITEM_MISMATCH: "Required evidence belongs to another learning item.",
  REQUIRED_EVIDENCE_MISSING: "Required verified evidence is missing."
};

export class LearningAuthorityError extends Error {
  constructor(public readonly reason: LearningTransitionFailure) {
    super(messages[reason]);
    this.name = "LearningAuthorityError";
  }
}

function requireUserId(userId: string) {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    throw new Error("Authentication required.");
  }

  return userId.trim();
}

function normalizeEvidenceRefs(refs: string[] | undefined) {
  return [
    ...new Set(
      (refs ?? [])
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ];
}

function toVerifiedEvidenceRecord(
  row: typeof learnerVerifiedEvidence.$inferSelect
): VerifiedEvidenceRecord {
  return {
    id: row.id,
    learnerId: row.userId,
    itemId: row.itemId,
    kind: row.kind,
    verifierId: row.verifierId,
    verificationRef: row.verificationRef,
    attestationDigest: row.attestationDigest,
    verifiedAt: row.verifiedAt.toISOString()
  };
}

function toCompletionRecord(
  row: typeof learnerProgressHistory.$inferSelect
): CompletionRecord {
  return {
    itemType: row.itemType as CompletionRecord["itemType"],
    itemId: row.itemId,
    completedAt: row.completedAt.toISOString(),
    verificationLevel: row.verificationLevel,
    course: row.course,
    projectId: row.projectId
  };
}

function reject(reason: LearningTransitionFailure): never {
  throw new LearningAuthorityError(reason);
}

export async function completeLearningItemForUser(
  userId: string,
  command: AuthoritativeCompletionCommand
): Promise<CompletionRecord> {
  const learnerId = requireUserId(userId);
  const item = findProgrammeLearningItem(command.itemId);

  if (!item) {
    return reject("UNKNOWN_LEARNING_ITEM");
  }

  const evidenceRefs = normalizeEvidenceRefs(command.evidenceRefs);
  const resolveAllServerEvidence = command.evidenceRefs === undefined;
  const db = getDb();

  return db.transaction(async (tx) => {
    const evidenceRows = resolveAllServerEvidence
      ? await tx
          .select()
          .from(learnerVerifiedEvidence)
          .where(
            and(
              eq(learnerVerifiedEvidence.userId, learnerId),
              eq(learnerVerifiedEvidence.itemId, item.id)
            )
          )
      : evidenceRefs.length
        ? await tx
            .select()
            .from(learnerVerifiedEvidence)
            .where(
              and(
                eq(learnerVerifiedEvidence.userId, learnerId),
                inArray(learnerVerifiedEvidence.id, evidenceRefs)
              )
            )
        : [];

    const evidence = new Map(
      evidenceRows.map((row) => [row.id, toVerifiedEvidenceRecord(row)] as const)
    );

    const resolvedEvidenceRefs = resolveAllServerEvidence
      ? evidenceRows.map((row) => row.id)
      : evidenceRefs;

    const decision = evaluateLearningTransition(
      {
        learnerId,
        items: new Map([[item.id, item]]),
        verifiedEvidence: evidence
      },
      {
        itemId: item.id,
        evidenceRefs: resolvedEvidenceRefs
      }
    );

    if (!decision.accepted) {
      return reject(decision.reason);
    }

    await tx
      .insert(learnerProgressHistory)
      .values({
        userId: learnerId,
        itemType: item.itemType,
        itemId: item.id,
        course: item.course,
        projectId: item.projectId,
        verificationLevel: AUTHORITY_VERIFICATION_LEVEL
      })
      .onConflictDoNothing({
        target: [
          learnerProgressHistory.userId,
          learnerProgressHistory.itemType,
          learnerProgressHistory.itemId
        ]
      });

    const [row] = await tx
      .select()
      .from(learnerProgressHistory)
      .where(
        and(
          eq(learnerProgressHistory.userId, learnerId),
          eq(learnerProgressHistory.itemType, item.itemType),
          eq(learnerProgressHistory.itemId, item.id)
        )
      )
      .limit(1);

    if (!row) {
      throw new Error("Authoritative completion could not be stored.");
    }

    const authoritativeMetadata = {
      itemType: item.itemType,
      itemId: item.id,
      course: item.course,
      projectId: item.projectId,
      verificationLevel: AUTHORITY_VERIFICATION_LEVEL
    };

    if (
      row.itemType !== authoritativeMetadata.itemType ||
      row.itemId !== authoritativeMetadata.itemId ||
      row.course !== authoritativeMetadata.course ||
      row.projectId !== authoritativeMetadata.projectId ||
      row.verificationLevel !== authoritativeMetadata.verificationLevel
    ) {
      await tx
        .update(learnerProgressHistory)
        .set(authoritativeMetadata)
        .where(eq(learnerProgressHistory.id, row.id));

      row.itemType = authoritativeMetadata.itemType;
      row.itemId = authoritativeMetadata.itemId;
      row.course = authoritativeMetadata.course;
      row.projectId = authoritativeMetadata.projectId;
      row.verificationLevel = authoritativeMetadata.verificationLevel;
    }

    await tx
      .insert(learnerCompletionEvidence)
      .values(
        decision.satisfiedEvidence.map((evidenceId) => ({
          completionId: row.id,
          evidenceId
        }))
      )
      .onConflictDoNothing();

    return toCompletionRecord(row);
  });
}
