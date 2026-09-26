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
  asc: vi.fn(() => "asc"),
  desc: vi.fn(() => "desc"),
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
  },
  learnerMasteryAttempts: {
    id: "mastery.id",
    userId: "mastery.userId",
    lessonId: "mastery.lessonId",
    taskId: "mastery.taskId",
    attemptNumber: "mastery.attemptNumber",
    outcome: "mastery.outcome",
    stage: "mastery.stage",
    summary: "mastery.summary",
    createdAt: "mastery.createdAt"
  }
}));

const {
  recordAuthoritativeMasteryAttemptForUser
} = await import("../../src/lib/server/masteryAuthority.ts");

const row = {
  id: "mastery-1",
  userId: "user_1",
  lessonId: "B1.2",
  taskId: "hands-on-B1.2",
  attemptNumber: 1,
  outcome: "failure",
  stage: "foundation-reteach",
  summary: "needs a different explanation",
  createdAt: new Date("2026-09-26T12:00:00.000Z")
};

function configureDb({
  evidenceRows = [],
  latestAttemptNumber = 0,
  insertedRow = row,
  insertReturnsRow = true
} = {}) {
  const evidenceWhere = vi.fn().mockResolvedValue(evidenceRows);
  const evidenceFrom = vi.fn().mockReturnValue({ where: evidenceWhere });

  const latestLimit = vi.fn().mockResolvedValue(
    latestAttemptNumber
      ? [{ attemptNumber: latestAttemptNumber }]
      : []
  );
  const latestOrderBy = vi.fn().mockReturnValue({ limit: latestLimit });
  const latestWhere = vi.fn().mockReturnValue({ orderBy: latestOrderBy });
  const latestFrom = vi.fn().mockReturnValue({ where: latestWhere });

  selectMock
    .mockReset()
    .mockImplementation((projection) => ({
      from: projection ? latestFrom : evidenceFrom
    }));

  const returning = vi
    .fn()
    .mockResolvedValue(insertReturnsRow ? [insertedRow] : []);
  const conflict = vi.fn().mockReturnThis();
  const values = vi.fn().mockReturnThis();

  insertMock.mockReturnValue({
    values,
    onConflictDoNothing: conflict,
    returning
  });

  transactionMock.mockImplementation(async (callback) =>
    callback({
      select: selectMock,
      insert: insertMock
    })
  );
  getDbMock.mockReturnValue({ transaction: transactionMock });

  return { values, returning, conflict };
}

describe("authoritative mastery service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("records failure when no authoritative evidence proves mastery", async () => {
    const { values } = configureDb();

    const result = await recordAuthoritativeMasteryAttemptForUser("user_1", {
      itemId: "B1.2",
      stage: "foundation-reteach",
      summary: "not yet proven",
      evidenceRefs: []
    });

    expect(result.outcome).toBe("failure");
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        lessonId: "B1.2",
        taskId: "hands-on-B1.2",
        outcome: "failure"
      })
    );
  });

  it("records mastered only when server-owned evidence satisfies the item policy", async () => {
    const { values } = configureDb({
      evidenceRows: [
        {
          id: "evidence-1",
          userId: "user_1",
          itemId: "B1.2",
          kind: "exercise",
          verifierId: "trusted-verifier",
          verificationRef: "attestation-1",
          attestationDigest: "sha256:" + "a".repeat(64),
          verifiedAt: new Date("2026-09-26T12:00:00.000Z")
        }
      ],
      insertedRow: { ...row, outcome: "mastered" }
    });

    const result = await recordAuthoritativeMasteryAttemptForUser("user_1", {
      itemId: "B1.2",
      stage: "mastered",
      summary: "server evidence proved the exercise",
      evidenceRefs: ["evidence-1"]
    });

    expect(result.outcome).toBe("mastered");
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        outcome: "mastered",
        lessonId: "B1.2",
        taskId: "hands-on-B1.2"
      })
    );
  });

  it("does not let cross-learner evidence manufacture mastery", async () => {
    const { values } = configureDb({ evidenceRows: [] });

    const result = await recordAuthoritativeMasteryAttemptForUser("user_1", {
      itemId: "B1.2",
      stage: "foundation-reteach",
      summary: "attempt",
      evidenceRefs: ["evidence-owned-by-user-2"]
    });

    expect(result.outcome).toBe("failure");
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({ outcome: "failure" })
    );
  });

  it("retries a conflict instead of reusing an attempt number", async () => {
    const values = vi.fn().mockReturnThis();
    const returning = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { ...row, attemptNumber: 2 }
      ]);
    const conflict = vi.fn().mockReturnThis();

    const latestLimit = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ attemptNumber: 1 }]);
    const latestOrderBy = vi.fn().mockReturnValue({ limit: latestLimit });
    const latestWhere = vi.fn().mockReturnValue({ orderBy: latestOrderBy });
    const latestFrom = vi.fn().mockReturnValue({ where: latestWhere });

    selectMock
      .mockReset()
      .mockImplementation((projection) => ({
        from: projection
          ? latestFrom
          : vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([])
            })
      }));

    insertMock.mockReturnValue({
      values,
      onConflictDoNothing: conflict,
      returning
    });

    transactionMock.mockImplementation(async (callback) =>
      callback({ select: selectMock, insert: insertMock })
    );
    getDbMock.mockReturnValue({ transaction: transactionMock });

    const result = await recordAuthoritativeMasteryAttemptForUser("user_1", {
      itemId: "B1.2",
      stage: "foundation-reteach",
      summary: "retry",
      evidenceRefs: []
    });

    expect(result.attemptNumber).toBe(2);
    expect(returning).toHaveBeenCalledTimes(2);
  });

  it("fails closed for an unauthenticated learner", async () => {
    await expect(
      recordAuthoritativeMasteryAttemptForUser("", {
        itemId: "B1.2",
        stage: "foundation-reteach",
        summary: "attempt"
      })
    ).rejects.toThrow("Authentication required.");

    expect(getDbMock).not.toHaveBeenCalled();
  });
});
