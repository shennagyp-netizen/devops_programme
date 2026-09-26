import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, transactionMock, selectMock, insertMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  transactionMock: vi.fn(),
  selectMock: vi.fn(),
  insertMock: vi.fn()
}));

vi.mock("../../src/lib/server/db.ts", () => ({
  getDb: getDbMock
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...parts) => ({ type: "and", parts })),
  eq: vi.fn((left, right) => ({ type: "eq", left, right })),
  inArray: vi.fn((left, values) => ({ type: "inArray", left, values }))
}));

vi.mock("../../src/lib/server/schema.ts", () => ({
  learnerVerifiedEvidence: {
    id: "evidence.id",
    userId: "evidence.userId",
    itemId: "evidence.itemId"
  },
  learnerProgressHistory: {
    id: "progress.id",
    userId: "progress.userId",
    itemType: "progress.itemType",
    itemId: "progress.itemId"
  },
  learnerCompletionEvidence: {
    completionId: "completionEvidence.completionId",
    evidenceId: "completionEvidence.evidenceId"
  }
}));

const { completeLearningItemForUser, LearningAuthorityError } = await import(
  "../../src/lib/server/learningAuthority.ts"
);

function configureDb({
  evidenceRows = [],
  progressRow = {
    id: "completion-1",
    itemType: "lesson",
    itemId: "B1.2",
    course: "beginner",
    projectId: "B1",
    verificationLevel: "authoritative-evidence",
    completedAt: new Date("2026-09-26T10:00:00.000Z")
  }
} = {}) {
  const whereMock = vi.fn().mockResolvedValue(evidenceRows);
  const fromMock = vi.fn().mockReturnValue({ where: whereMock });
  const selectChain = { from: fromMock };

  const valuesMock = vi.fn().mockReturnThis();
  const onConflictDoNothingMock = vi.fn().mockResolvedValue([]);
  const returningMock = vi.fn().mockResolvedValue([progressRow]);
  const insertChain = {
    values: valuesMock,
    onConflictDoNothing: onConflictDoNothingMock,
    returning: returningMock
  };

  selectMock.mockReturnValue(selectChain);
  insertMock.mockReturnValue(insertChain);

  transactionMock.mockImplementation(async (callback) =>
    callback({
      select: selectMock,
      insert: insertMock
    })
  );

  getDbMock.mockReturnValue({ transaction: transactionMock });

  return {
    whereMock,
    valuesMock,
    onConflictDoNothingMock,
    returningMock
  };
}

describe("authoritative completion service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fails closed when a lesson has no verified evidence", async () => {
    configureDb();

    await expect(
      completeLearningItemForUser("user_1", {
        itemId: "B1.2",
        evidenceRefs: []
      })
    ).rejects.toMatchObject({
      reason: "REQUIRED_EVIDENCE_MISSING"
    });

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("does not accept evidence belonging to another learner", async () => {
    configureDb({
      evidenceRows: [
        {
          id: "evidence-1",
          learnerId: "user_2",
          itemId: "B1.2",
          kind: "exercise",
          verifierId: "trusted-verifier",
          verificationRef: "attestation-1",
          attestationDigest: "sha256:abc",
          verifiedAt: new Date("2026-09-26T10:00:00.000Z")
        }
      ]
    });

    await expect(
      completeLearningItemForUser("user_1", {
        itemId: "B1.2",
        evidenceRefs: ["evidence-1"]
      })
    ).rejects.toMatchObject({
      reason: "REQUIRED_EVIDENCE_MISSING"
    });

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects evidence that belongs to another learning item", async () => {
    configureDb({
      evidenceRows: [
        {
          id: "evidence-1",
          learnerId: "user_1",
          itemId: "B1.3",
          kind: "exercise",
          verifierId: "trusted-verifier",
          verificationRef: "attestation-1",
          attestationDigest: "sha256:abc",
          verifiedAt: new Date("2026-09-26T10:00:00.000Z")
        }
      ]
    });

    await expect(
      completeLearningItemForUser("user_1", {
        itemId: "B1.2",
        evidenceRefs: ["evidence-1"]
      })
    ).rejects.toMatchObject({
      reason: "EVIDENCE_ITEM_MISMATCH"
    });

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("records only server-derived completion metadata and proof links", async () => {
    const { valuesMock, onConflictDoNothingMock, returningMock } = configureDb({
      evidenceRows: [
        {
          id: "evidence-1",
          learnerId: "user_1",
          itemId: "B1.2",
          kind: "exercise",
          verifierId: "trusted-verifier",
          verificationRef: "attestation-1",
          attestationDigest: "sha256:abc",
          verifiedAt: new Date("2026-09-26T10:00:00.000Z")
        }
      ]
    });

    const result = await completeLearningItemForUser("user_1", {
      itemId: "B1.2",
      evidenceRefs: ["evidence-1"]
    });

    expect(result.itemId).toBe("B1.2");
    expect(result.itemType).toBe("lesson");
    expect(valuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        itemType: "lesson",
        itemId: "B1.2",
        course: "beginner",
        projectId: "B1",
        verificationLevel: "authoritative-evidence"
      })
    );
    expect(onConflictDoNothingMock).toHaveBeenCalledTimes(2);
    expect(returningMock).toHaveBeenCalledTimes(1);
  });

  it("rejects missing authentication before database access", async () => {
    await expect(
      completeLearningItemForUser("", {
        itemId: "B1.2",
        evidenceRefs: ["evidence-1"]
      })
    ).rejects.toThrow("Authentication required.");

    expect(getDbMock).not.toHaveBeenCalled();
  });
});
