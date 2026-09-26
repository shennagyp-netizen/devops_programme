import { describe, expect, it } from "vitest";
import {
  parseVerificationAttestationCommand,
  parseVerificationChallengeCommand
} from "../../src/framework/verificationRequest.ts";

const attestation = {
  challengeId: "challenge-1",
  learnerId: "user-1",
  itemId: "B1.2",
  evidenceKind: "exercise",
  providerId: "local-terminal",
  keyId: "key-1",
  verificationRef: "run-1",
  attestationDigest: "sha256:" + "a".repeat(64),
  nonce: "nonce-1",
  signatureAlgorithm: "ed25519",
  signature: "A".repeat(86),
  issuedAt: "2026-09-26T12:01:00.000Z",
  expiresAt: "2026-09-26T12:04:00.000Z"
};

describe("verification request contracts", () => {
  it("accepts the minimal challenge request", () => {
    expect(
      parseVerificationChallengeCommand({
        itemId: "B1.2",
        providerId: "local-terminal",
        targetRef: "runtime-exercise-B1.2"
      })
    ).toEqual({
      itemId: "B1.2",
      providerId: "local-terminal",
      targetRef: "runtime-exercise-B1.2"
    });
  });

  it("rejects browser identity/trust fields in challenge requests", () => {
    expect(() =>
      parseVerificationChallengeCommand({
        itemId: "B1.2",
        providerId: "local-terminal",
        evidenceKind: "exercise",
        learnerId: "attacker"
      })
    ).toThrow(/unsupported field/i);
  });

  it("accepts a structurally bounded attestation command", () => {
    expect(parseVerificationAttestationCommand(attestation)).toEqual(attestation);
  });

  it("rejects unknown attestation fields", () => {
    expect(() =>
      parseVerificationAttestationCommand({
        ...attestation,
        trusted: true
      })
    ).toThrow(/unsupported field/i);
  });

  it("rejects non-Ed25519 algorithm substitution", () => {
    expect(() =>
      parseVerificationAttestationCommand({
        ...attestation,
        signatureAlgorithm: "rsa"
      })
    ).toThrow(/ed25519/i);
  });
});
