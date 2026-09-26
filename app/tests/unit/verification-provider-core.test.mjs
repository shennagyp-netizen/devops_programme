import { describe, expect, it } from "vitest";
import { generateKeyPairSync, verify as verifySignature } from "node:crypto";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  canonicalVerificationSigningPayload,
  digestExecutionEnvelope,
  loadOrCreateEd25519ProviderKey,
  signVerificationAttestation
} from "../../../scripts/verification-provider-core.mjs";

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

const envelope = {
  schemaVersion: 1,
  taskId: "runtime-exercise-B1.1",
  contractVersion: 1,
  lessonId: "B1.1",
  platform: "linux",
  verificationLevel: "machine-verified",
  verificationSource: "local-runner",
  executionMode: "local-machine",
  target: { kind: "local" },
  runnerVersion: "test",
  environmentFingerprint: "fp",
  startedAt: "2026-09-26T12:01:00.000Z",
  completedAt: "2026-09-26T12:01:02.000Z",
  stepResults: [],
  resetPerformed: true
};

describe("provider signing core", () => {
  it("produces deterministic execution digests", () => {
    expect(digestExecutionEnvelope(envelope)).toBe(
      digestExecutionEnvelope({ ...envelope })
    );
    expect(digestExecutionEnvelope(envelope)).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it("signs the exact canonical payload that the framework contract verifies", () => {
    const { privateKey, publicKey } = generateKeyPairSync("ed25519");
    const attestation = signVerificationAttestation({
      challenge,
      envelope,
      providerId: "local-terminal",
      keyId: "key-1",
      privateKey,
      verificationRef: "run-1",
      issuedAt: "2026-09-26T12:01:03.000Z"
    });

    expect(
      verifySignature(
        null,
        Buffer.from(
          canonicalVerificationSigningPayload(challenge, attestation),
          "utf8"
        ),
        publicKey,
        Buffer.from(attestation.signature, "base64url")
      )
    ).toBe(true);
  });

  it("creates and reuses a persistent provider keypair", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "provider-key-test-"));

    try {
      const first = await loadOrCreateEd25519ProviderKey({ directory });
      const second = await loadOrCreateEd25519ProviderKey({ directory });

      expect(first.created).toBe(true);
      expect(second.created).toBe(false);
      expect(second.publicKey).toBe(first.publicKey);
      expect(second.privateKey).toBe(first.privateKey);
      expect(await readFile(first.privatePath, "utf8")).toBe(first.privateKey);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  });
});
