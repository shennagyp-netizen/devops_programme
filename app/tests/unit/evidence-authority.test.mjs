import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, insertMock, selectMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  insertMock: vi.fn(),
  selectMock: vi.fn()
}));

vi.mock("../../src/lib/server/db.ts", () => ({
  getDb: getDbMock
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...parts) => ({ type: "and", parts })),
  asc: vi.fn(() => "asc"),
  eq: vi.fn((left, right) => ({ type: "eq", left, right })),
  inArray: vi.fn((left, values) => ({ type: "inArray", left, values }))
}));

vi.mock("../../src/lib/server/schema.ts", () => ({
  learnerVerifiedEvidence: {
    id: "evidence.id",
    userId: "evidence.userId",
    itemId: "evidence.itemId",
    kind: "evidence.kind",
    verifierId: "evidence.verifierId",
    verificationRef: "evidence.verificationRef",
    attestationDigest: "evidence.attestationDigest",
    verifiedAt: "evidence.verifiedAt"
  }
}));

const {
  recordTrustedVerifiedEvidence,
  listVerifiedEvidenceForUser
} = await import("../../src/lib/server/evidenceAuthority.ts");

const digest = "sha256:" + "a".repeat(64);

function configureInsert(row) {
  const valuesMock = vi.fn().mockReturnThis();
  const conflictMock = vi.fn().mockReturnThis();
  const returningMock = vi.fn().mockResolvedValue(row ? [row] : []);
  insertMock.mockReturnValue({
    values: valuesMock,
    onConflictDoNothing: conflictMock,
    returning: returningMock
  });
  return { valuesMock, returningMock };
}

describe("server verified-evidence authority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects a missing attestation digest", async () => {
    try {
      await recordTrustedVerifiedEvidence({
        learnerId: "user_1",
        itemId: "B1.2",
        kind: "exercise",
        verifierId: "trusted-verifier",
        verificationRef: "attestation-1",
        attestationDigest: ""
      });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error instanceof Error ? error.message : String(error)).toMatch(/attestationDigest/i);
    }

    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("persists only server-side verified evidence records", async () => {
    const row = {
      id: "evidence-1",
      userId: "user_1",
      itemId: "B1.2",
      kind: "exercise",
      verifierId: "trusted-verifier",
      verificationRef: "attestation-1",
      attestationDigest: digest,
      verifiedAt: new Date("2026-09-26T10:00:00.000Z")
    };

    const { valuesMock } = configureInsert(row);
    getDbMock.mockReturnValue({ insert: insertMock });

    const result = await recordTrustedVerifiedEvidence({
      learnerId: "user_1",
      itemId: "B1.2",
      kind: "exercise",
      verifierId: "trusted-verifier",
      verificationRef: "attestation-1",
      attestationDigest: digest
    });

    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        itemId: "B1.2",
        kind: "exercise",
        verifierId: "trusted-verifier",
        verificationRef: "attestation-1",
        attestationDigest: digest
      })
    );
    expect(result).toMatchObject({
      id: "evidence-1",
      learnerId: "user_1",
      itemId: "B1.2",
      kind: "exercise",
      attestationDigest: digest
    });
  });

  it("does not query the database for an explicitly empty evidence reference list", async () => {
    getDbMock.mockReturnValue({
      select: selectMock
    });

    await expect(listVerifiedEvidenceForUser("user_1", [])).resolves.toEqual([]);

    expect(getDbMock).not.toHaveBeenCalled();
  });

  it("supports a server-side list-all lookup without accepting an empty client selection as proof", async () => {
    const row = {
      id: "evidence-2",
      userId: "user_1",
      itemId: "B1.2",
      kind: "exercise",
      verifierId: "trusted-verifier",
      verificationRef: "attestation-2",
      attestationDigest: digest,
      verifiedAt: new Date("2026-09-26T10:02:00.000Z")
    };

    const whereMock = vi.fn().mockResolvedValue([row]);
    const fromMock = vi.fn().mockReturnValue({ where: whereMock });
    selectMock.mockReturnValue({ from: fromMock });
    getDbMock.mockReturnValue({ select: selectMock });

    const result = await listVerifiedEvidenceForUser("user_1");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: "evidence-2", learnerId: "user_1" });
  });
});
