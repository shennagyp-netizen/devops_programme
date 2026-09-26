import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, transactionMock, selectMock, insertMock, updateMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  transactionMock: vi.fn(),
  selectMock: vi.fn(),
  insertMock: vi.fn(),
  updateMock: vi.fn()
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
    itemId: "progress.itemId",
    course: "progress.course",
    projectId: "progress.projectId",
    verificationLevel: "progress.verificationLevel"
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
  const evidenceWhereMock = vi.fn().mockResolvedValue(evidenceRows);
  const evidenceFromMock = vi.fn().mockReturnValue({
    where: evidenceWhereMock
  });

  const completionWhereMock = vi.fn().mockReturnThis();
  const completionLimitMock = vi.fn().mockResolvedValue([progressRow]);
  const completionFromMock = vi.fn().mockReturnValue({
    where: completionWhereMock
  });

  selectMock
    .mockReset()
    .mockImplementationOnce(() => ({
      from: evidenceFromMock
    }))
    .mockImplementationOnce(() => ({
      from: completionFromMock
    }));

  const completionValuesMock = vi.fn().mockReturnThis();
  const completionConflictMock = vi.fn().mockResolvedValue([]);
  const completionReturningMock = vi.fn().mockResolvedValue([progressRow]);

  const linkValuesMock = vi.fn().mockReturnThis();
  const linkConflictMock = vi.fn().mockResolvedValue([]);

  insertMock
    .mockReset()
    .mockImplementationOnce(() => ({
      values: completionValuesMock,
      onConflictDoNothing: completionConflictMock,
      returning: completionReturningMock
    }))
    .mockImplementationOnce(() => ({
      values: linkValuesMock,
      onConflictDoNothing: linkConflictMock
    }));

  completionFromMock().limit = completionLimitMock;

  updateMock.mockReset().mockReturnValue({
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([])
  });

  transactionMock.mockImplementation(async (callback) =>
    callback({
      select: selectMock,
      insert: insertMock,
      update: updateMock
    })
  );

  getDbMock.mockReturnValue({ transaction: transactionMock });

  return {
    completionValuesMock,
    completionConflictMock,
    completionReturningMock,
    linkValuesMock,
    linkConflictMock
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
    configureDb({ evidenceRows: [] });

    await expect(
      completeLearningItemForUser("user_1", {
        itemId: "B1.2",
        evidenceRefs: ["evidence-1"]
      })
    ).rejects.toMatchObject({
      reason: "EVIDENCE_NOT_VERIFIED"
    });

    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects evidence that belongs to another learning item", async () => {
    configureDb({
      evidenceRows: [
        {
          id: "evidence-1",
          userId: "user_1",
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
    const {
      completionValuesMock,
      completionConflictMock,
      completionReturningMock,
      linkConflictMock
    } = configureDb({
      evidenceRows: [
        {
          id: "evidence-1",
          userId: "user_1",
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
    expect(completionValuesMock).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user_1",
        itemType: "lesson",
        itemId: "B1.2",
        course: "beginner",
        projectId: "B1",
        verificationLevel: "authoritative-evidence"
      })
    );
    expect(completionConflictMock).toHaveBeenCalledTimes(1);
    expect(linkConflictMock).toHaveBeenCalledTimes(1);
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
