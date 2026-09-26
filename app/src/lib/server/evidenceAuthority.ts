import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb, type DbTransaction } from "./db";
import { learnerVerifiedEvidence } from "./schema";
import { findProgrammeLearningItem } from "./programmeAuthority";
import type { VerifiedEvidenceRecord } from "../../framework/contracts";

export type TrustedVerifiedEvidenceInput = {
  learnerId: string;
  itemId: string;
  kind: string;
  verifierId: string;
  verificationRef: string;
  attestationDigest: string;
  providerKeyId?: string;
  verificationAttemptId?: string;
  signature?: string;
};

function requireNonEmpty(value: string, name: string, maxLength: number) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > maxLength
  ) {
    throw new Error(
      `${name} must be a non-empty string up to ${maxLength} characters.`
    );
  }

  return value.trim();
}

function requireLearnerId(value: string) {
  return requireNonEmpty(value, "learnerId", 200);
}

function validateTrustedInput(input: TrustedVerifiedEvidenceInput) {
  const learnerId = requireLearnerId(input.learnerId);
  const itemId = requireNonEmpty(input.itemId, "itemId", 200);

  if (!findProgrammeLearningItem(itemId)) {
    throw new Error("Unknown learning item.");
  }

  const kind = requireNonEmpty(input.kind, "kind", 128);
  const verifierId = requireNonEmpty(input.verifierId, "verifierId", 128);
  const verificationRef = requireNonEmpty(
    input.verificationRef,
    "verificationRef",
    512
  );
  const attestationDigest = requireNonEmpty(
    input.attestationDigest,
    "attestationDigest",
    256
  );

  if (!/^sha256:[0-9a-f]{64}$/i.test(attestationDigest)) {
    throw new Error(
      "attestationDigest must use the sha256:<64 hex characters> format."
    );
  }

  if (input.providerKeyId !== undefined) {
    requireNonEmpty(input.providerKeyId, "providerKeyId", 128);
  }

  if (input.verificationAttemptId !== undefined) {
    requireNonEmpty(input.verificationAttemptId, "verificationAttemptId", 128);
  }

  if (input.signature !== undefined) {
    requireNonEmpty(input.signature, "signature", 1024);
  }

  return {
    learnerId,
    itemId,
    kind,
    verifierId,
    verificationRef,
    attestationDigest,
    providerKeyId: input.providerKeyId,
    verificationAttemptId: input.verificationAttemptId,
    signature: input.signature
  };
}

export function toVerifiedEvidenceRecord(
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

/**
 * Transaction-safe trusted provider persistence.
 *
 * This function is intentionally not a browser-facing action. Callers must
 * have already authenticated provider provenance and validated the attestation.
 */
export async function recordTrustedVerifiedEvidenceWithinTransaction(
  tx: DbTransaction,
  input: TrustedVerifiedEvidenceInput
): Promise<VerifiedEvidenceRecord> {
  const validated = validateTrustedInput(input);

  const [row] = await tx
    .insert(learnerVerifiedEvidence)
    .values({
      userId: validated.learnerId,
      itemId: validated.itemId,
      kind: validated.kind,
      verifierId: validated.verifierId,
      verificationRef: validated.verificationRef,
      attestationDigest: validated.attestationDigest,
      providerKeyId: validated.providerKeyId ?? null,
      verificationAttemptId: validated.verificationAttemptId ?? null,
      signature: validated.signature ?? null
    })
    .onConflictDoNothing({
      target: [
        learnerVerifiedEvidence.userId,
        learnerVerifiedEvidence.itemId,
        learnerVerifiedEvidence.verificationRef
      ]
    })
    .returning();

  if (!row) {
    const [existing] = await tx
      .select()
      .from(learnerVerifiedEvidence)
      .where(
        and(
          eq(learnerVerifiedEvidence.userId, validated.learnerId),
          eq(learnerVerifiedEvidence.itemId, validated.itemId),
          eq(
            learnerVerifiedEvidence.verificationRef,
            validated.verificationRef
          )
        )
      )
      .limit(1);

    if (!existing) {
      throw new Error("Verified evidence could not be stored.");
    }

    const sameAttestation =
      existing.attestationDigest === validated.attestationDigest &&
      existing.verifierId === validated.verifierId &&
      (existing.providerKeyId ?? null) ===
        (validated.providerKeyId ?? null) &&
      (existing.verificationAttemptId ?? null) ===
        (validated.verificationAttemptId ?? null) &&
      (existing.signature ?? null) === (validated.signature ?? null);

    if (!sameAttestation) {
      throw new Error(
        "Verification reference conflict: an existing evidence record has different attestation provenance."
      );
    }

    return toVerifiedEvidenceRecord(existing);
  }

  return toVerifiedEvidenceRecord(row);
}

export async function recordTrustedVerifiedEvidence(
  input: TrustedVerifiedEvidenceInput
): Promise<VerifiedEvidenceRecord> {
  const validated = validateTrustedInput(input);
  const db = getDb();

  const [row] = await db
    .insert(learnerVerifiedEvidence)
    .values({
      userId: validated.learnerId,
      itemId: validated.itemId,
      kind: validated.kind,
      verifierId: validated.verifierId,
      verificationRef: validated.verificationRef,
      attestationDigest: validated.attestationDigest,
      providerKeyId: validated.providerKeyId ?? null,
      verificationAttemptId: validated.verificationAttemptId ?? null,
      signature: validated.signature ?? null
    })
    .onConflictDoNothing({
      target: [
        learnerVerifiedEvidence.userId,
        learnerVerifiedEvidence.itemId,
        learnerVerifiedEvidence.verificationRef
      ]
    })
    .returning();

  if (row) {
    return toVerifiedEvidenceRecord(row);
  }

  const [existing] = await db
    .select()
    .from(learnerVerifiedEvidence)
    .where(
      and(
        eq(learnerVerifiedEvidence.userId, validated.learnerId),
        eq(learnerVerifiedEvidence.itemId, validated.itemId),
        eq(
          learnerVerifiedEvidence.verificationRef,
          validated.verificationRef
        )
      )
    )
    .limit(1);

if (!existing) {
      throw new Error("Verified evidence could not be stored.");
    }

    const sameAttestation =
      existing.attestationDigest === validated.attestationDigest &&
      existing.verifierId === validated.verifierId &&
      (existing.providerKeyId ?? null) ===
        (validated.providerKeyId ?? null) &&
      (existing.verificationAttemptId ?? null) ===
        (validated.verificationAttemptId ?? null) &&
      (existing.signature ?? null) === (validated.signature ?? null);

    if (!sameAttestation) {
      throw new Error(
        "Verification reference conflict: an existing evidence record has different attestation provenance."
      );
    }

    return toVerifiedEvidenceRecord(existing);
}

export async function listVerifiedEvidenceForUser(
  learnerId: string,
  evidenceRefs?: string[]
): Promise<VerifiedEvidenceRecord[]> {
  const safeLearnerId = requireLearnerId(learnerId);
  const refs =
    evidenceRefs === undefined
      ? undefined
      : [
          ...new Set(
            evidenceRefs
              .filter((value): value is string => typeof value === "string")
              .map((value) => value.trim())
              .filter(Boolean)
          )
        ];

  if (refs && !refs.length) return [];

  const db = getDb();
  const rows = await db
    .select()
    .from(learnerVerifiedEvidence)
    .where(
      refs
        ? and(
            eq(learnerVerifiedEvidence.userId, safeLearnerId),
            inArray(learnerVerifiedEvidence.id, refs)
          )
        : eq(learnerVerifiedEvidence.userId, safeLearnerId)
    )
    .orderBy(
      asc(learnerVerifiedEvidence.verifiedAt),
      asc(learnerVerifiedEvidence.id)
    );

  return rows.map(toVerifiedEvidenceRecord);
}
