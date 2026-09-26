const MAX_ITEM_ID_LENGTH = 200;
const MAX_PROVIDER_ID_LENGTH = 128;
const MAX_EVIDENCE_KIND_LENGTH = 128;
const MAX_CHALLENGE_ID_LENGTH = 128;
const MAX_KEY_ID_LENGTH = 128;
const MAX_VERIFICATION_REF_LENGTH = 512;
const MAX_NONCE_LENGTH = 256;
const MAX_SIGNATURE_LENGTH = 1024;
const MAX_TIMESTAMP_LENGTH = 64;

export type VerificationChallengeCommand = {
  itemId: string;
  providerId: string;
  targetRef: string;
};

export type VerificationAttestationCommand = {
  challengeId: string;
  learnerId: string;
  itemId: string;
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

const CHALLENGE_FIELDS = new Set([
  "itemId",
  "providerId",
  "targetRef"
]);

const ATTESTATION_FIELDS = new Set([
  "challengeId",
  "learnerId",
  "itemId",
  "evidenceKind",
  "providerId",
  "keyId",
  "verificationRef",
  "attestationDigest",
  "nonce",
  "signatureAlgorithm",
  "signature",
  "issuedAt",
  "expiresAt"
]);

function fail(message: string): never {
  throw new Error(message);
}

function requiredString(value: unknown, name: string, maxLength: number) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0 ||
    value.length > maxLength
  ) {
    return fail(
      `${name} must be a non-empty string up to ${maxLength} characters.`
    );
  }

  return value.trim();
}

function parseObject(value: unknown, label: string) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fail(`${label} is required.`);
  }

  return value as Record<string, unknown>;
}

export function parseVerificationChallengeCommand(
  value: unknown
): VerificationChallengeCommand {
  const source = parseObject(value, "Verification challenge command");

  for (const field of Object.keys(source)) {
    if (!CHALLENGE_FIELDS.has(field)) {
      return fail(`Unsupported field: ${field}.`);
    }
  }

  return {
    itemId: requiredString(source.itemId, "itemId", MAX_ITEM_ID_LENGTH),
    providerId: requiredString(
      source.providerId,
      "providerId",
      MAX_PROVIDER_ID_LENGTH
    ),
    targetRef: requiredString(
      source.targetRef,
      "targetRef",
      MAX_VERIFICATION_REF_LENGTH
    )
  };
}

export function parseVerificationAttestationCommand(
  value: unknown
): VerificationAttestationCommand {
  const source = parseObject(value, "Verification attestation command");

  for (const field of Object.keys(source)) {
    if (!ATTESTATION_FIELDS.has(field)) {
      return fail(`Unsupported field: ${field}.`);
    }
  }

  const signatureAlgorithm = source.signatureAlgorithm;
  if (signatureAlgorithm !== "ed25519") {
    return fail("signatureAlgorithm must be ed25519.");
  }

  return {
    challengeId: requiredString(
      source.challengeId,
      "challengeId",
      MAX_CHALLENGE_ID_LENGTH
    ),
    learnerId: requiredString(source.learnerId, "learnerId", 200),
    itemId: requiredString(source.itemId, "itemId", MAX_ITEM_ID_LENGTH),
    evidenceKind: requiredString(
      source.evidenceKind,
      "evidenceKind",
      MAX_EVIDENCE_KIND_LENGTH
    ),
    providerId: requiredString(
      source.providerId,
      "providerId",
      MAX_PROVIDER_ID_LENGTH
    ),
    keyId: requiredString(source.keyId, "keyId", MAX_KEY_ID_LENGTH),
    verificationRef: requiredString(
      source.verificationRef,
      "verificationRef",
      MAX_VERIFICATION_REF_LENGTH
    ),
    attestationDigest: requiredString(
      source.attestationDigest,
      "attestationDigest",
      256
    ),
    nonce: requiredString(source.nonce, "nonce", MAX_NONCE_LENGTH),
    signatureAlgorithm: "ed25519",
    signature: requiredString(source.signature, "signature", MAX_SIGNATURE_LENGTH),
    issuedAt: requiredString(source.issuedAt, "issuedAt", MAX_TIMESTAMP_LENGTH),
    expiresAt: requiredString(source.expiresAt, "expiresAt", MAX_TIMESTAMP_LENGTH)
  };
}
