export type VerificationChallenge = {
  id: string;
  learnerId: string;
  itemId: string;
  targetRef: string;
  evidenceKind: string;
  providerId: string;
  providerKeyId: string;
  issuedAt: string;
  expiresAt: string;
  nonce: string;
};

export type VerificationAttestation = {
  challengeId: string;
  learnerId: string;
  itemId: string;
  targetRef: string;
  evidenceKind: string;
  providerId: string;
  keyId: string;
  verificationRef: string;
  attestationDigest: string;
  nonce: string;
  signatureAlgorithm: "ed25519";
  signature: string;
  issuedAt: string;
  expiresAt: string;
};

export type VerificationFailure =
  | "CHALLENGE_MISMATCH"
  | "LEARNER_MISMATCH"
  | "ITEM_MISMATCH"
  | "EVIDENCE_KIND_MISMATCH"
  | "TARGET_MISMATCH"
  | "PROVIDER_MISMATCH"
  | "NONCE_MISMATCH"
  | "ATTESTATION_NOT_WITHIN_CHALLENGE"
  | "ATTESTATION_NOT_YET_VALID"
  | "ATTESTATION_EXPIRED"
  | "INVALID_ATTESTATION_DIGEST"
  | "INVALID_SIGNATURE_FORMAT";

export type VerificationResult =
  | { accepted: true }
  | { accepted: false; reason: VerificationFailure };

function validIso(value: string) {
  return !Number.isNaN(Date.parse(value));
}

function reject(reason: VerificationFailure): VerificationResult {
  return { accepted: false, reason };
}

function validSignature(value: string) {
  return /^[A-Za-z0-9_-]{86,}$/u.test(value);
}

export function verificationSigningPayload(
  challenge: VerificationChallenge,
  attestation: VerificationAttestation
) {
  return JSON.stringify([
    challenge.id,
    challenge.learnerId,
    challenge.itemId,
    challenge.targetRef,
    challenge.evidenceKind,
    challenge.providerId,
    challenge.providerKeyId,
    attestation.keyId,
    challenge.nonce,
    attestation.verificationRef,
    attestation.attestationDigest,
    attestation.issuedAt,
    attestation.expiresAt
  ]);
}

/**
 * Structural and temporal validation only.
 *
 * Cryptographic signature verification, provider authentication, and replay
 * persistence belong to the provider/server adapter boundary.
 */
export function validateVerificationAttestation(
  challenge: VerificationChallenge,
  attestation: VerificationAttestation,
  now: Date
): VerificationResult {
  if (attestation.challengeId !== challenge.id) {
    return reject("CHALLENGE_MISMATCH");
  }

  if (attestation.learnerId !== challenge.learnerId) {
    return reject("LEARNER_MISMATCH");
  }

  if (attestation.itemId !== challenge.itemId) {
    return reject("ITEM_MISMATCH");
  }

  if (attestation.evidenceKind !== challenge.evidenceKind) {
    return reject("EVIDENCE_KIND_MISMATCH");
  }

  if (attestation.targetRef !== challenge.targetRef) {
    return reject("TARGET_MISMATCH");
  }

  if (attestation.providerId !== challenge.providerId) {
    return reject("PROVIDER_MISMATCH");
  }

  if (!attestation.keyId.trim()) {
    return reject("PROVIDER_MISMATCH");
  }

  if (attestation.nonce !== challenge.nonce) {
    return reject("NONCE_MISMATCH");
  }

  if (attestation.signatureAlgorithm !== "ed25519" || !validSignature(attestation.signature)) {
    return reject("INVALID_SIGNATURE_FORMAT");
  }

  if (
    !validIso(challenge.issuedAt) ||
    !validIso(challenge.expiresAt) ||
    !validIso(attestation.issuedAt) ||
    !validIso(attestation.expiresAt)
  ) {
    return reject("ATTESTATION_NOT_WITHIN_CHALLENGE");
  }

  const challengeIssuedAt = Date.parse(challenge.issuedAt);
  const challengeExpiresAt = Date.parse(challenge.expiresAt);
  const attestationIssuedAt = Date.parse(attestation.issuedAt);
  const attestationExpiresAt = Date.parse(attestation.expiresAt);
  const nowMs = now.getTime();

  if (
    attestationIssuedAt < challengeIssuedAt ||
    attestationExpiresAt > challengeExpiresAt ||
    attestationExpiresAt < attestationIssuedAt
  ) {
    return reject("ATTESTATION_NOT_WITHIN_CHALLENGE");
  }

  if (nowMs < attestationIssuedAt) {
    return reject("ATTESTATION_NOT_YET_VALID");
  }

  if (nowMs > attestationExpiresAt) {
    return reject("ATTESTATION_EXPIRED");
  }

  if (!/^sha256:[0-9a-f]{64}$/i.test(attestation.attestationDigest)) {
    return reject("INVALID_ATTESTATION_DIGEST");
  }

  return { accepted: true };
}
