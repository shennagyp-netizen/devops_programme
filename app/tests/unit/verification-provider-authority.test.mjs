import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash, generateKeyPairSync, sign as signPayload } from "node:crypto";
import {
  verificationSigningPayload
} from "../../src/framework/verification.ts";

const { getDbMock, insertMock, selectMock, updateMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  updateMock: vi.fn()
}));

vi.mock("../../src/lib/server/db.ts", () => ({
  getDb: getDbMock
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...parts) => ({ type: "and", parts })),
  asc: vi.fn(() => "asc"),
  desc: vi.fn(() => "desc"),
  eq: vi.fn((left, right) => ({ type: "eq", left, right })),
  inArray: vi.fn((left, values) => ({ type: "inArray", left, values })),
  isNull: vi.fn((value) => ({ type: "isNull", value }))
}));

vi.mock("../../src/lib/server/schema.ts", () => ({
  verificationProviderKeys: {
    id: "providerKey.id",
    userId: "providerKey.userId",
    providerId: "providerKey.providerId",
    keyId: "providerKey.keyId",
    algorithm: "providerKey.algorithm",
    publicKey: "providerKey.publicKey",
    revokedAt: "providerKey.revokedAt",
    createdAt: "providerKey.createdAt"
  },
  verificationAttempts: {
    id: "attempt.id",
    userId: "attempt.userId",
    itemId: "attempt.itemId",
    targetRef: "attempt.targetRef",
    evidenceKind: "attempt.evidenceKind",
    providerId: "attempt.providerId",
    providerKeyId: "attempt.providerKeyId",
    nonce: "attempt.nonce",
    nonceHash: "attempt.nonceHash",
    issuedAt: "attempt.issuedAt",
    expiresAt: "attempt.expiresAt",
    consumedAt: "attempt.consumedAt"
  },
  learnerVerifiedEvidence: {
    id: "evidence.id",
    userId: "evidence.userId",
    itemId: "evidence.itemId",
    kind: "evidence.kind",
    verifierId: "evidence.verifierId",
    providerKeyId: "evidence.providerKeyId",
    verificationAttemptId: "evidence.verificationAttemptId",
    verificationRef: "evidence.verificationRef",
    attestationDigest: "evidence.attestationDigest",
    signature: "evidence.signature",
    verifiedAt: "evidence.verifiedAt"
  }
}));

const {
  registerTrustedProviderKey,
  issueVerificationChallengeForUser,
  acceptVerificationAttestationForUser
} = await import("../../src/lib/server/verificationProviderAuthority.ts");

const now = new Date("2026-09-26T12:02:00.000Z");
const nonceHash = (nonce) =>
  "sha256:" + createHash("sha256").update(nonce).digest("hex");

function keyPair() {
  return generateKeyPairSync("ed25519");
}

function buildAttestation(privateKey) {
  const challenge = {
    id: "challenge-1",
    learnerId: "user_1",
    itemId: "B1.1",
    targetRef: "runtime-exercise-B1.1",
    evidenceKind: "exercise",
    providerId: "local-terminal",
    providerKeyId: "key-1",
    issuedAt: "2026-09-26T12:00:00.000Z",
    expiresAt: "2026-09-26T12:05:00.000Z",
    nonce: "nonce-1"
  };

  const unsigned = {
    challengeId: challenge.id,
    learnerId: challenge.learnerId,
    itemId: challenge.itemId,
    targetRef: challenge.targetRef,
    evidenceKind: challenge.evidenceKind,
    providerId: challenge.providerId,
    keyId: "key-1",
    verificationRef: "run-1",
    attestationDigest: "sha256:" + "a".repeat(64),
    nonce: challenge.nonce,
    signatureAlgorithm: "ed25519",
    signature: "",
    issuedAt: "2026-09-26T12:01:00.000Z",
    expiresAt: "2026-09-26T12:04:00.000Z"
  };

  const payload = verificationSigningPayload(challenge, unsigned);
  const signature = signPayload(null, Buffer.from(payload, "utf8"), privateKey)
    .toString("base64url");

  return { challenge, attestation: { ...unsigned, signature } };
}

function configureTransaction({ attempt, providerKey, updateRow, evidenceRow }) {
  let selectCall = 0;
  selectMock.mockImplementation(() => {
    const index = selectCall++;
    const row =
      index === 0
        ? attempt
        : providerKey && !providerKey.revokedAt
          ? providerKey
          : null;
    return {
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue(row ? [row] : [])
        })
      })
    };
  });

  updateMock.mockReturnValue({
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue(updateRow ? [updateRow] : [])
    })
  });

  insertMock.mockReturnValue({
    values: vi.fn().mockReturnThis(),
    onConflictDoNothing: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(evidenceRow ? [evidenceRow] : [])
  });

  const transaction = vi.fn(async (callback) =>
    callback({
      select: selectMock,
      update: updateMock,
      insert: insertMock
    })
  );

  getDbMock.mockReturnValue({ transaction });
  return transaction;
}

describe("verification provider authority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects unsupported provider keys before persistence", async () => {
    const { publicKey: rsaPublicKey } = generateKeyPairSync("rsa", {
      modulusLength: 2048
    });

    await expect(
      registerTrustedProviderKey({
        learnerId: "user_1",
        providerId: "local-terminal",
        keyId: "key-rsa",
        publicKey: rsaPublicKey.export({ type: "spki", format: "pem" }).toString()
      })
    ).rejects.toThrow(/Ed25519/i);

    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("creates a short-lived challenge only for an active trusted provider", async () => {
    const providerKey = {
      id: "provider-key-1",
      userId: "user_1",
      providerId: "local-terminal",
      providerKeyId: "key-1",
      keyId: "key-1",
      algorithm: "ed25519",
      publicKey: "unused-in-challenge-test",
      createdAt: now,
      revokedAt: null
    };

    const challengeRow = {
      id: "challenge-2",
      userId: "user_1",
      itemId: "B1.2",
      targetRef: "runtime-probe-B1.2",
      evidenceKind: "probe",
      providerId: "local-terminal",
      providerKeyId: "key-1",
      nonce: "nonce-2",
      nonceHash: "sha256:" + "b".repeat(64),
      issuedAt: now,
      expiresAt: new Date(now.getTime() + 120000),
      consumedAt: null,
      createdAt: now
    };

    const keyFromSelect = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([providerKey])
          })
        })
      })
    });
    const returning = vi.fn().mockResolvedValue([challengeRow]);
    insertMock.mockReturnValue({
      values: vi.fn().mockReturnThis(),
      returning
    });
    selectMock.mockImplementation(keyFromSelect);
    getDbMock.mockReturnValue({ select: selectMock, insert: insertMock });

    const challenge = await issueVerificationChallengeForUser("user_1", {
      itemId: "B1.2",
      providerId: "local-terminal",
      targetRef: "runtime-probe-B1.2"
    });

    expect(challenge).toMatchObject({
      id: "challenge-2",
      learnerId: "user_1",
      itemId: "B1.2",
      targetRef: "runtime-probe-B1.2",
      providerId: "local-terminal",
      nonce: "nonce-2"
    });
    expect(returning).toHaveBeenCalledTimes(1);
  });


  it("rejects attestations signed by a revoked provider key", async () => {
    const { publicKey, privateKey } = keyPair();
    const { challenge, attestation } = buildAttestation(privateKey);

    const attempt = {
      id: challenge.id,
      userId: "user_1",
      itemId: challenge.itemId,
      targetRef: challenge.targetRef,
      evidenceKind: challenge.evidenceKind,
      providerId: challenge.providerId,
      providerKeyId: "key-1",
      nonce: challenge.nonce,
      nonceHash: nonceHash(challenge.nonce),
      issuedAt: new Date(challenge.issuedAt),
      expiresAt: new Date(challenge.expiresAt),
      consumedAt: null
    };

    const providerKey = {
      id: "provider-key-1",
      userId: "user_1",
      providerId: "local-terminal",
      providerKeyId: "key-1",
      keyId: "key-1",
      algorithm: "ed25519",
      publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
      createdAt: now,
      revokedAt: new Date("2026-09-26T12:01:00.000Z")
    };

    configureTransaction({ attempt, providerKey: null });

    await expect(
      acceptVerificationAttestationForUser("user_1", attestation, now)
    ).rejects.toThrow(/not registered or has been revoked/i);

    expect(updateMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects a valid provider signature when the target reference is substituted", async () => {
    const { publicKey, privateKey } = keyPair();
    const { challenge, attestation } = buildAttestation(privateKey);
    const originalPayload = verificationSigningPayload(challenge, attestation);
    expect(originalPayload).toContain(challenge.targetRef);

    attestation.targetRef = "runtime-exercise-B1.3";

    const attempt = {
      id: challenge.id,
      userId: "user_1",
      itemId: challenge.itemId,
      targetRef: challenge.targetRef,
      evidenceKind: challenge.evidenceKind,
      providerId: challenge.providerId,
      providerKeyId: challenge.providerKeyId,
      nonce: challenge.nonce,
      nonceHash: nonceHash(challenge.nonce),
      issuedAt: new Date(challenge.issuedAt),
      expiresAt: new Date(challenge.expiresAt),
      consumedAt: null
    };

    const providerKey = {
      id: "provider-key-1",
      userId: "user_1",
      providerId: "local-terminal",
      keyId: "key-1",
      algorithm: "ed25519",
      publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
      createdAt: now,
      revokedAt: null
    };

    configureTransaction({ attempt, providerKey });

    await expect(
      acceptVerificationAttestationForUser("user_1", attestation, now)
    ).rejects.toThrow(/TARGET_MISMATCH/i);

    expect(updateMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("accepts a correctly signed attestation and atomically consumes the challenge", async () => {
    const { publicKey, privateKey } = keyPair();
    const { challenge, attestation } = buildAttestation(privateKey);

    const attempt = {
      id: challenge.id,
      userId: challenge.learnerId,
      itemId: challenge.itemId,
      targetRef: challenge.targetRef,
      evidenceKind: challenge.evidenceKind,
      providerId: challenge.providerId,
      providerKeyId: challenge.providerKeyId,
      nonce: challenge.nonce,
      nonceHash: nonceHash(challenge.nonce),
      issuedAt: new Date(challenge.issuedAt),
      expiresAt: new Date(challenge.expiresAt),
      consumedAt: null
    };

    const providerKey = {
      id: "provider-key-1",
      userId: "user_1",
      providerId: "local-terminal",
      keyId: "key-1",
      algorithm: "ed25519",
      publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
      createdAt: now,
      revokedAt: null
    };

    const updateRow = { ...attempt, consumedAt: now };
    const evidenceRow = {
      id: "evidence-1",
      userId: "user_1",
      itemId: "B1.1",
      kind: "exercise",
      verifierId: "local-terminal",
      providerKeyId: "key-1",
      verificationAttemptId: "challenge-1",
      verificationRef: "run-1",
      attestationDigest: attestation.attestationDigest,
      signature: attestation.signature,
      verifiedAt: now
    };

    configureTransaction({
      attempt,
      providerKey,
      updateRow,
      evidenceRow
    });

    const result = await acceptVerificationAttestationForUser(
      "user_1",
      attestation,
      now
    );

    expect(result).toMatchObject({
      id: "evidence-1",
      learnerId: "user_1",
      itemId: "B1.1",
      kind: "exercise",
      verificationRef: "run-1"
    });

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(insertMock).toHaveBeenCalledTimes(1);
  });

  it("rejects forged signatures without consuming the challenge", async () => {
    const { publicKey, privateKey } = keyPair();
    const { challenge, attestation } = buildAttestation(privateKey);
    const { privateKey: attackerKey } = keyPair();

    attestation.signature = signPayload(
      null,
      Buffer.from(
        verificationSigningPayload(challenge, attestation),
        "utf8"
      ),
      attackerKey
    ).toString("base64url");

    const attempt = {
      id: challenge.id,
      userId: "user_1",
      itemId: "B1.1",
      targetRef: "runtime-exercise-B1.1",
      evidenceKind: "exercise",
      providerId: "local-terminal",
      providerKeyId: challenge.providerKeyId,
      nonce: "nonce-1",
      nonceHash: nonceHash(challenge.nonce),
      issuedAt: new Date(challenge.issuedAt),
      expiresAt: new Date(challenge.expiresAt),
      consumedAt: null
    };
    const providerKey = {
      id: "provider-key-1",
      userId: "user_1",
      providerId: "local-terminal",
      keyId: "key-1",
      algorithm: "ed25519",
      publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
      createdAt: now,
      revokedAt: null
    };

    configureTransaction({ attempt, providerKey });

    await expect(
      acceptVerificationAttestationForUser("user_1", attestation, now)
    ).rejects.toThrow(/signature is invalid/i);

    expect(updateMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects replay after challenge consumption", async () => {
    const { privateKey } = keyPair();
    const { attestation } = buildAttestation(privateKey);

    const attempt = {
      id: "challenge-1",
      userId: "user_1",
      itemId: "B1.1",
      targetRef: "runtime-exercise-B1.1",
      evidenceKind: "exercise",
      providerId: "local-terminal",
      nonce: "nonce-1",
      nonceHash: nonceHash("nonce-1"),
      issuedAt: new Date("2026-09-26T12:00:00.000Z"),
      expiresAt: new Date("2026-09-26T12:05:00.000Z"),
      consumedAt: new Date("2026-09-26T12:01:00.000Z")
    };

    const keyPairValue = keyPair();
    const providerKey = {
      id: "provider-key-1",
      userId: "user_1",
      providerId: "local-terminal",
      keyId: "key-1",
      algorithm: "ed25519",
      publicKey: keyPairValue.publicKey.export({ type: "spki", format: "pem" }).toString(),
      createdAt: now,
      revokedAt: null
    };

    configureTransaction({ attempt, providerKey });

    await expect(
      acceptVerificationAttestationForUser("user_1", attestation, now)
    ).rejects.toThrow(/already been consumed/i);

    expect(updateMock).not.toHaveBeenCalled();
  });

  it("rejects a concurrent replay when the compare-and-set update consumes zero rows", async () => {
    const { publicKey, privateKey } = keyPair();
    const { challenge, attestation } = buildAttestation(privateKey);

    const attempt = {
      id: challenge.id,
      userId: "user_1",
      itemId: "B1.1",
      targetRef: "runtime-exercise-B1.1",
      evidenceKind: "exercise",
      providerId: "local-terminal",
      providerKeyId: challenge.providerKeyId,
      nonce: challenge.nonce,
      nonceHash: nonceHash(challenge.nonce),
      issuedAt: new Date(challenge.issuedAt),
      expiresAt: new Date(challenge.expiresAt),
      consumedAt: null
    };
    const providerKey = {
      id: "provider-key-1",
      userId: "user_1",
      providerId: "local-terminal",
      keyId: "key-1",
      algorithm: "ed25519",
      publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
      createdAt: now,
      revokedAt: null
    };

    configureTransaction({
      attempt,
      providerKey,
      updateRow: null
    });

    await expect(
      acceptVerificationAttestationForUser("user_1", attestation, now)
    ).rejects.toThrow(/replay detected/i);

    expect(insertMock).not.toHaveBeenCalled();
  });
});
