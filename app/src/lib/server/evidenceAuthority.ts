import { and, asc, eq, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { learnerVerifiedEvidence } from "./schema";
import type { VerifiedEvidenceRecord } from "../../framework/contracts";

export type TrustedVerifiedEvidenceInput = {
  learnerId: string;
  itemId: string;
  kind: string;
  verifierId: string;
  verificationRef: string;
  attestationDigest: string;
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

/**
 * Trusted server/provider boundary only.
 *
 * There is deliberately no browser-facing action for this function.
 * A caller must already have authenticated provider provenance and produced
 * a server-validated attestation digest before inserting evidence here.
 */
export async function recordTrustedVerifiedEvidence(
  input: TrustedVerifiedEvidenceInput
): Promise<VerifiedEvidenceRecord> {
  const learnerId = requireLearnerId(input.learnerId);
  const itemId = requireNonEmpty(input.itemId, "itemId", 200);
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

  const db = getDb();

  const [row] = await db
    .insert(learnerVerifiedEvidence)
    .values({
      userId: learnerId,
      itemId,
      kind,
      verifierId,
      verificationRef,
      attestationDigest
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
        eq(learnerVerifiedEvidence.userId, learnerId),
        eq(learnerVerifiedEvidence.itemId, itemId),
        eq(learnerVerifiedEvidence.verificationRef, verificationRef)
      )
    )
    .limit(1);

  if (!existing) {
    throw new Error("Verified evidence could not be stored.");
  }

  return toVerifiedEvidenceRecord(existing);
}

export async function listVerifiedEvidenceForUser(
  learnerId: string,
  evidenceRefs?: string[]
): Promise<VerifiedEvidenceRecord[]> {
  const safeLearnerId = requireLearnerId(learnerId);
  const refs = [
    ...new Set(
      evidenceRefs
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ];

  const db = getDb();
  const rows = await db
    .select()
    .from(learnerVerifiedEvidence)
    .where(
      refs.length
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
