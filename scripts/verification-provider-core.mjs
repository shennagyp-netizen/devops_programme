import {
  createHash,
  generateKeyPairSync,
  sign as signData
} from "node:crypto";
import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export function sha256Hex(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function sha256Digest(value) {
  return `sha256:${sha256Hex(value)}`;
}

export function canonicalVerificationSigningPayload(challenge, attestation) {
  return JSON.stringify([
    challenge.id,
    challenge.learnerId,
    challenge.itemId,
    challenge.targetRef,
    challenge.evidenceKind,
    challenge.providerId,
    attestation.keyId,
    challenge.nonce,
    attestation.verificationRef,
    attestation.attestationDigest,
    attestation.issuedAt,
    attestation.expiresAt
  ]);
}

export function digestExecutionEnvelope(envelope) {
  return sha256Digest(JSON.stringify(envelope));
}

export async function loadOrCreateEd25519ProviderKey({
  directory,
  privateKeyFile = "provider-private-key.pem",
  publicKeyFile = "provider-public-key.pem"
}) {
  const privatePath = path.join(directory, privateKeyFile);
  const publicPath = path.join(directory, publicKeyFile);

  await mkdir(directory, { recursive: true });

  try {
    const [privateKey, publicKey] = await Promise.all([
      readFile(privatePath, "utf8"),
      readFile(publicPath, "utf8")
    ]);

    return {
      privateKey,
      publicKey,
      privatePath,
      publicPath,
      created: false
    };
  } catch {
    const pair = generateKeyPairSync("ed25519");
    const privateKey = pair.privateKey
      .export({ type: "pkcs8", format: "pem" })
      .toString();
    const publicKey = pair.publicKey
      .export({ type: "spki", format: "pem" })
      .toString();

    await writeFile(privatePath, privateKey, {
      encoding: "utf8",
      mode: 0o600
    });
    await writeFile(publicPath, publicKey, {
      encoding: "utf8",
      mode: 0o644
    });

    try {
      await chmod(privatePath, 0o600);
    } catch {
      // Windows does not use POSIX file modes.
    }

    return {
      privateKey,
      publicKey,
      privatePath,
      publicPath,
      created: true
    };
  }
}

export function signVerificationAttestation({
  challenge,
  envelope,
  providerId,
  keyId,
  privateKey,
  verificationRef,
  issuedAt = new Date().toISOString(),
  expiresAt = challenge.expiresAt
}) {
  if (keyId !== challenge.providerKeyId) {
    throw new Error("Provider key does not match the challenge.");
  }

  const attestation = {
    challengeId: challenge.id,
    learnerId: challenge.learnerId,
    itemId: challenge.itemId,
    targetRef: challenge.targetRef,
    evidenceKind: challenge.evidenceKind,
    providerId,
    providerKeyId: challenge.providerKeyId,
    keyId,
    verificationRef,
    attestationDigest: digestExecutionEnvelope(envelope),
    nonce: challenge.nonce,
    signatureAlgorithm: "ed25519",
    signature: "",
    issuedAt,
    expiresAt
  };

  const payload = canonicalVerificationSigningPayload(
    challenge,
    attestation
  );

  attestation.signature = signData(
    null,
    Buffer.from(payload, "utf8"),
    privateKey
  ).toString("base64url");

  return attestation;
}
