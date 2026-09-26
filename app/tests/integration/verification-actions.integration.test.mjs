import { beforeEach, describe, expect, it, vi } from "vitest";

const currentUserMock = vi.fn();
const issueChallengeMock = vi.fn();
const acceptAttestationMock = vi.fn();

vi.mock("../../src/lib/server/auth.ts", () => ({
  requireCurrentUser: currentUserMock
}));

vi.mock("../../src/lib/server/verificationProviderAuthority.ts", () => ({
  issueVerificationChallengeForUser: issueChallengeMock,
  acceptVerificationAttestationForUser: acceptAttestationMock
}));

const {
  requestVerificationChallengeAction,
  submitVerificationAttestationAction
} = await import("../../src/app/actions/verification.ts");

describe("verification server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("binds challenge issuance to the authenticated learner", async () => {
    currentUserMock.mockResolvedValue({ id: "user_1" });
    issueChallengeMock.mockResolvedValue({
      id: "challenge-1",
      learnerId: "user_1",
      itemId: "B1.1",
      targetRef: "runtime-exercise-B1.1",
      providerId: "local-terminal",
      issuedAt: "2026-09-26T12:00:00.000Z",
      expiresAt: "2026-09-26T12:02:00.000Z",
      nonce: "nonce-1"
    });

    const result = await requestVerificationChallengeAction({
      itemId: "B1.1",
      providerId: "local-terminal",
      targetRef: "runtime-exercise-B1.1"
    });

    expect(issueChallengeMock).toHaveBeenCalledWith("user_1", {
      itemId: "B1.1",
      providerId: "local-terminal",
      targetRef: "runtime-exercise-B1.1"
    });
    expect(result.learnerId).toBe("user_1");
  });

  it("rejects unauthenticated challenge issuance", async () => {
    currentUserMock.mockRejectedValue(new Error("Authentication required."));

    await expect(
      requestVerificationChallengeAction({
        itemId: "B1.1",
        providerId: "local-terminal",
        targetRef: "runtime-exercise-B1.1"
      })
    ).rejects.toThrow("Authentication required.");

    expect(issueChallengeMock).not.toHaveBeenCalled();
  });

  it("does not expose provider-key registration through the action boundary", async () => {
    expect(
      typeof (await import("../../src/app/actions/verification.ts")).registerTrustedProviderKeyAction
    ).toBe("undefined");
  });

  it("passes only parsed attestation commands to the trusted server service", async () => {
    currentUserMock.mockResolvedValue({ id: "user_1" });
    acceptAttestationMock.mockResolvedValue({
      id: "evidence-1",
      learnerId: "user_1",
      itemId: "B1.1",
      kind: "exercise",
      verifierId: "local-terminal",
      verificationRef: "run-1",
      attestationDigest: "sha256:" + "a".repeat(64),
      verifiedAt: "2026-09-26T12:01:00.000Z"
    });

    const attestation = {
      challengeId: "challenge-1",
      learnerId: "user_1",
      itemId: "B1.1",
      targetRef: "runtime-exercise-B1.1",
      evidenceKind: "exercise",
      providerId: "local-terminal",
      keyId: "key-1",
      verificationRef: "run-1",
      attestationDigest: "sha256:" + "a".repeat(64),
      nonce: "nonce-1",
      signatureAlgorithm: "ed25519",
      signature: "A".repeat(86),
      issuedAt: "2026-09-26T12:00:01.000Z",
      expiresAt: "2026-09-26T12:02:00.000Z"
    };

    await submitVerificationAttestationAction(attestation);

    expect(acceptAttestationMock).toHaveBeenCalledWith("user_1", attestation);
  });

  it("rejects client identity substitution in attestation requests", async () => {
    currentUserMock.mockResolvedValue({ id: "user_1" });

    await expect(
      submitVerificationAttestationAction({
        challengeId: "challenge-1",
        learnerId: "attacker",
        itemId: "B1.1",
        targetRef: "runtime-exercise-B1.1",
        evidenceKind: "exercise",
        providerId: "local-terminal",
        keyId: "key-1",
        targetRef: "runtime-exercise-B1.1",
        verificationRef: "run-1",
        attestationDigest: "sha256:" + "a".repeat(64),
        nonce: "nonce-1",
        signatureAlgorithm: "ed25519",
        signature: "A".repeat(86),
        issuedAt: "2026-09-26T12:00:01.000Z",
        expiresAt: "2026-09-26T12:02:00.000Z",
        trusted: true
      })
    ).rejects.toThrow(/unsupported field/i);

    expect(acceptAttestationMock).not.toHaveBeenCalled();
  });
});
