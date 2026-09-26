import { describe, expect, it } from "vitest";
import {
  validateVerificationAttestation
} from "../../src/framework/verification.ts";

const challenge = {
  id: "challenge-1",
  learnerId: "user_1",
  itemId: "B1.2",
  evidenceKind: "exercise",
  providerId: "local-terminal",
  issuedAt: "2026-09-26T12:00:00.000Z",
  expiresAt: "2026-09-26T12:05:00.000Z",
  nonce: "nonce-1"
};

const validAttestation = {
  challengeId: "challenge-1",
  learnerId: "user_1",
  itemId: "B1.2",
  evidenceKind: "exercise",
  providerId: "local-terminal",
  verificationRef: "run-1",
  attestationDigest: "sha256:" + "a".repeat(64),
  nonce: "nonce-1",
  signatureAlgorithm: "ed25519",
  signature: "A".repeat(86),
  issuedAt: "2026-09-26T12:01:00.000Z",
  expiresAt: "2026-09-26T12:04:00.000Z"
};

describe("framework verification attestation contract", () => {
  it("accepts an attestation bound to the exact challenge and learner/item", () => {
    expect(
      validateVerificationAttestation(
        challenge,
        validAttestation,
        new Date("2026-09-26T12:02:00.000Z")
      )
    ).toEqual({ accepted: true });
  });

  it("rejects learner, item, evidence-kind, or provider substitution", () => {
    for (const patch of [
      { learnerId: "attacker" },
      { itemId: "B1.3" },
      { evidenceKind: "failure" },
      { providerId: "other-provider" }
    ]) {
      const result = validateVerificationAttestation(
        challenge,
        { ...validAttestation, ...patch },
        new Date("2026-09-26T12:02:00.000Z")
      );

      expect(result.accepted).toBe(false);
    }
  });

  it("rejects attestations outside their challenge validity window", () => {
    const before = validateVerificationAttestation(
      challenge,
      { ...validAttestation, issuedAt: "2026-09-26T11:59:59.000Z" },
      new Date("2026-09-26T12:02:00.000Z")
    );

    const after = validateVerificationAttestation(
      challenge,
      { ...validAttestation, expiresAt: "2026-09-26T12:04:00.000Z" },
      new Date("2026-09-26T12:06:00.000Z")
    );

    expect(before).toMatchObject({ accepted: false, reason: "ATTESTATION_NOT_WITHIN_CHALLENGE" });
    expect(after).toMatchObject({ accepted: false, reason: "ATTESTATION_EXPIRED" });
  });

  it("rejects malformed or non-canonical digests", () => {
    for (const digest of ["", "sha256:abc", "md5:" + "a".repeat(32)]) {
      const result = validateVerificationAttestation(
        challenge,
        { ...validAttestation, attestationDigest: digest },
        new Date("2026-09-26T12:02:00.000Z")
      );

      expect(result).toMatchObject({
        accepted: false,
        reason: "INVALID_ATTESTATION_DIGEST"
      });
    }
  });


  it("rejects nonce substitution even when every other field matches", () => {
    const result = validateVerificationAttestation(
      challenge,
      { ...validAttestation, nonce: "attacker-nonce" },
      new Date("2026-09-26T12:02:00.000Z")
    );

    expect(result).toMatchObject({
      accepted: false,
      reason: "NONCE_MISMATCH"
    });
  });

  it("rejects an invalid provider signature envelope before cryptographic verification", () => {
    const result = validateVerificationAttestation(
      challenge,
      { ...validAttestation, signature: "too-short" },
      new Date("2026-09-26T12:02:00.000Z")
    );

    expect(result).toMatchObject({
      accepted: false,
      reason: "INVALID_SIGNATURE_FORMAT"
    });
  });

  it("rejects challenge-id substitution even when the rest of the payload matches", () => {
    const result = validateVerificationAttestation(
      challenge,
      { ...validAttestation, challengeId: "challenge-evil" },
      new Date("2026-09-26T12:02:00.000Z")
    );

    expect(result).toMatchObject({
      accepted: false,
      reason: "CHALLENGE_MISMATCH"
    });
  });
});
