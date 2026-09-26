import {
  createHash,
  createPublicKey,
  randomBytes,
  verify as verifySignature
} from "node:crypto";
import { and, eq, isNull } from "drizzle-orm";
import { getDb } from "./db";
import {
  learnerVerifiedEvidence,
  verificationAttempts,
  verificationProviderKeys
} from "./schema";
import { findProgrammeLearningItem } from "./programmeAuthority";
import {
  recordTrustedVerifiedEvidenceWithinTransaction
} from "./evidenceAuthority";
import {
  validateVerificationAttestation,
  verificationSigningPayload,
  type VerificationAttestation,
  type VerificationChallenge
} from "../../framework/verification";
import type {
  VerificationAttestationCommand,
  VerificationChallengeCommand
} from "../../framework/verificationRequest";

const MAX_CHALLENGE_TTL_MS = 5 * 60 * 1000;
const DEFAULT_CHALLENGE_TTL_MS = 2 * 60 * 1000;

type TrustedProviderKeyInput = {
  learnerId: string;
  providerId: string;
  keyId: string;
  publicKey: string;
};

function requireString(value: string, name: string, maxLength: number) {
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
  return requireString(value, "learnerId", 200);
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function base64UrlToBuffer(value: string) {
  return Buffer.from(value, "base64url");
}

function publicKeyForVerification(publicKey: string) {
  const normalized = publicKey.trim();
  if (!normalized.startsWith("-----BEGIN PUBLIC KEY-----") || !normalized.endsWith("-----END PUBLIC KEY-----")) {
    throw new Error("Trusted provider key must be an Ed25519 public-key PEM.");
  }

  const key = createPublicKey(normalized);
  if (key.asymmetricKeyType !== "ed25519") {
    throw new Error("Trusted provider key must use Ed25519.");
  }

  return key;
}

function challengeFromRow(
  row: typeof verificationAttempts.$inferSelect
): VerificationChallenge {
  return {
    id: row.id,
    learnerId: row.userId,
    itemId: row.itemId,
    evidenceKind: row.evidenceKind,
    providerId: row.providerId,
    issuedAt: row.issuedAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    nonce: row.nonce
  };
}

function ensureItemAcceptsEvidence(itemId: string) {
  const item = findProgrammeLearningItem(itemId);
  if (!item) {
    throw new Error("Unknown learning item.");
  }

  if (item.completion.mode !== "evidence") {
    throw new Error("This learning item does not use evidence completion.");
  }

  return item;
}

/**
 * Server/deployment provisioning boundary only.
 *
 * There is intentionally no Server Action exposing this function. A provider
 * key must be installed by a trusted server-side provisioning path.
 */
export async function registerTrustedProviderKey(
  input: TrustedProviderKeyInput
) {
  const learnerId = requireLearnerId(input.learnerId);
  const providerId = requireString(input.providerId, "providerId", 128);
  const keyId = requireString(input.keyId, "keyId", 128);
  const key = publicKeyForVerification(
    requireString(input.publicKey, "publicKey", 16384)
  );
  const canonicalPublicKey = key.export({
    type: "spki",
    format: "pem"
  }).toString();

  const db = getDb();
  const [row] = await db
    .insert(verificationProviderKeys)
    .values({
      userId: learnerId,
      providerId,
      keyId,
      algorithm: "ed25519",
      publicKey: canonicalPublicKey
    })
    .onConflictDoNothing({
      target: [
        verificationProviderKeys.userId,
        verificationProviderKeys.providerId,
        verificationProviderKeys.keyId
      ]
    })
    .returning();

  if (!row) {
    const [existing] = await db
      .select()
      .from(verificationProviderKeys)
      .where(
        and(
          eq(verificationProviderKeys.userId, learnerId),
          eq(verificationProviderKeys.providerId, providerId),
          eq(verificationProviderKeys.keyId, keyId)
        )
      )
      .limit(1);

    if (!existing) {
      throw new Error("Trusted provider key could not be stored.");
    }

    return existing;
  }

  return row;
}

export async function issueVerificationChallengeForUser(
  learnerId: string,
  command: VerificationChallengeCommand,
  ttlMs = DEFAULT_CHALLENGE_TTL_MS
): Promise<VerificationChallenge> {
  const safeLearnerId = requireLearnerId(learnerId);
  const itemId = requireString(command.itemId, "itemId", 200);
  const providerId = requireString(command.providerId, "providerId", 128);
  const evidenceKind = requireString(command.evidenceKind, "evidenceKind", 128);
  const item = ensureItemAcceptsEvidence(itemId);

  if (!Number.isInteger(ttlMs) || ttlMs < 1 || ttlMs > MAX_CHALLENGE_TTL_MS) {
    throw new Error("Verification challenge TTL is outside the allowed range.");
  }

  const db = getDb();
  const [key] = await db
    .select()
    .from(verificationProviderKeys)
    .where(
      and(
        eq(verificationProviderKeys.userId, safeLearnerId),
        eq(verificationProviderKeys.providerId, providerId),
        isNull(verificationProviderKeys.revokedAt)
      )
    )
    .orderBy(verificationProviderKeys.createdAt)
    .limit(1);

  if (!key) {
    throw new Error("No active trusted provider key is registered.");
  }

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ttlMs);
  const nonce = randomBytes(32).toString("base64url");

  const [row] = await db
    .insert(verificationAttempts)
    .values({
      userId: safeLearnerId,
      itemId: item.id,
      evidenceKind,
      providerId,
      nonce,
      nonceHash: `sha256:${sha256(nonce)}`,
      issuedAt,
      expiresAt
    })
    .returning();

  if (!row) {
    throw new Error("Verification challenge could not be created.");
  }

  return challengeFromRow(row);
}

export async function acceptVerificationAttestationForUser(
  learnerId: string,
  command: VerificationAttestationCommand,
  now = new Date()
) {
  const safeLearnerId = requireLearnerId(learnerId);
  const db = getDb();

  return db.transaction(async (tx) => {
    const [attempt] = await tx
      .select()
      .from(verificationAttempts)
      .where(
        and(
          eq(verificationAttempts.id, command.challengeId),
          eq(verificationAttempts.userId, safeLearnerId)
        )
      )
      .limit(1);

    if (!attempt) {
      throw new Error("Verification challenge was not found.");
    }

    if (attempt.consumedAt) {
      throw new Error("Verification challenge has already been consumed.");
    }

    const [providerKey] = await tx
      .select()
      .from(verificationProviderKeys)
      .where(
        and(
          eq(verificationProviderKeys.userId, safeLearnerId),
          eq(verificationProviderKeys.providerId, attempt.providerId),
          eq(verificationProviderKeys.keyId, command.keyId),
          isNull(verificationProviderKeys.revokedAt)
        )
      )
      .limit(1);

    if (!providerKey) {
      throw new Error("Trusted provider key is not registered or has been revoked.");
    }

    if (providerKey.algorithm !== "ed25519") {
      throw new Error("Trusted provider key algorithm is invalid.");
    }

    if (attempt.nonceHash !== `sha256:${sha256(attempt.nonce)}`) {
      throw new Error("Verification challenge integrity check failed.");
    }

    const challenge = challengeFromRow(attempt);
    const attestation: VerificationAttestation = command;
    const structural = validateVerificationAttestation(
      challenge,
      attestation,
      now
    );

    if (!structural.accepted) {
      throw new Error(
        `Verification attestation rejected: ${structural.reason}.`
      );
    }

    const key = publicKeyForVerification(providerKey.publicKey);
    const validSignature = verifySignature(
      null,
      Buffer.from(verificationSigningPayload(challenge, attestation), "utf8"),
      key,
      base64UrlToBuffer(attestation.signature)
    );

    if (!validSignature) {
      throw new Error("Verification attestation signature is invalid.");
    }

    const [consumed] = await tx
      .update(verificationAttempts)
      .set({ consumedAt: now })
      .where(
        and(
          eq(verificationAttempts.id, attempt.id),
          eq(verificationAttempts.userId, safeLearnerId),
          isNull(verificationAttempts.consumedAt)
        )
      )
      .returning();

    if (!consumed) {
      throw new Error("Verification challenge replay detected.");
    }

    ensureItemAcceptsEvidence(command.itemId);

    return recordTrustedVerifiedEvidenceWithinTransaction(tx, {
      learnerId: safeLearnerId,
      itemId: command.itemId,
      kind: command.evidenceKind,
      verifierId: command.providerId,
      providerKeyId: command.keyId,
      verificationAttemptId: attempt.id,
      verificationRef: command.verificationRef,
      attestationDigest: command.attestationDigest,
      signature: command.signature
    });
  });
}
