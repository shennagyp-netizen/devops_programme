import { beforeEach, describe, expect, it, vi } from "vitest";

const { getDbMock, insertMock, selectMock, updateMock } = vi.hoisted(() => ({
  getDbMock: vi.fn(),
  insertMock: vi.fn(),
  selectMock: vi.fn(),
  updateMock: vi.fn()
}));

vi.mock("../../src/lib/server/db.ts", () => ({
  getDb: getDbMock
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...parts) => ({ type: "and", parts })),
  eq: vi.fn((left, right) => ({ type: "eq", left, right }))
}));

vi.mock("../../src/lib/server/schema.ts", () => ({
  assessmentInstances: {
    id: "instance.id",
    userId: "instance.userId",
    courseId: "instance.courseId",
    sectionId: "instance.sectionId",
    family: "instance.family",
    formId: "instance.formId",
    seed: "instance.seed",
    itemSnapshotJson: "instance.itemSnapshotJson",
    status: "instance.status",
    expiresAt: "instance.expiresAt",
    createdAt: "instance.createdAt",
    submittedAt: "instance.submittedAt"
  },
  assessmentAttempts: {
    id: "attempt.id",
    instanceId: "attempt.instanceId",
    userId: "attempt.userId",
    answersJson: "attempt.answersJson",
    autoScore: "attempt.autoScore",
    autoScorableCount: "attempt.autoScorableCount",
    outcome: "attempt.outcome",
    submittedAt: "attempt.submittedAt"
  }
}));

vi.mock("../../src/lib/server/assessmentBankAuthority.ts", () => ({
  assessmentItemPool: vi.fn(() => [])
}));

vi.mock("../../src/assessment/formGenerator.ts", () => ({
  generateAssessmentForm: vi.fn(() => ({
    formId: "beginner-B-F1-conceptual-server-seed",
    blueprint: {},
    items: [
      {
        id: "Q-1",
        sectionId: "B-F1",
        family: "conceptual",
        difficulty: "foundation",
        cognitiveLevel: "mechanism",
        itemType: "selected-response",
        expectedMinutes: 1,
        competencyId: "B-F1.core",
        prompt: "Which answer is correct?",
        options: ["Wrong", "Right"],
        correctOption: 1
      },
      {
        id: "Q-2",
        sectionId: "B-F1",
        family: "conceptual",
        difficulty: "applied",
        cognitiveLevel: "application",
        itemType: "constructed-response",
        expectedMinutes: 2,
        competencyId: "B-F1.core",
        prompt: "Explain the mechanism.",
        expectedElements: ["mechanism"]
      }
    ]
  }))
}));

const {
  issueAssessmentForUser,
  submitAssessmentForUser
} = await import("../../src/lib/server/assessmentAuthority.ts");

const activeInstance = {
  id: "instance-1",
  userId: "user_1",
  courseId: "beginner",
  sectionId: "B-F1",
  family: "conceptual",
  formId: "beginner-B-F1-conceptual-server-seed",
  seed: "server-seed",
  itemSnapshotJson: JSON.stringify([
    {
      id: "Q-1",
      sectionId: "B-F1",
      family: "conceptual",
      difficulty: "foundation",
      cognitiveLevel: "mechanism",
      itemType: "selected-response",
      expectedMinutes: 1,
      competencyId: "B-F1.core",
      prompt: "Which answer is correct?",
      options: ["Wrong", "Right"],
      correctOption: 1
    },
    {
      id: "Q-2",
      sectionId: "B-F1",
      family: "conceptual",
      difficulty: "applied",
      cognitiveLevel: "application",
      itemType: "constructed-response",
      expectedMinutes: 2,
      competencyId: "B-F1.core",
      prompt: "Explain the mechanism.",
      expectedElements: ["mechanism"]
    }
  ]),
  status: "active",
  expiresAt: new Date("2099-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-09-26T12:00:00.000Z"),
  submittedAt: null
};

function configureDb({ insertRows = [], selectRows = [], updateRows = [] } = {}) {
  const insertReturning = vi.fn().mockResolvedValue(insertRows);
  insertMock.mockReturnValue({
    values: vi.fn().mockReturnThis(),
    returning: insertReturning
  });

  const selectLimit = vi.fn().mockResolvedValue(selectRows);
  const selectWhere = vi.fn().mockReturnValue({ limit: selectLimit });
  selectMock.mockReturnValue({
    from: vi.fn().mockReturnValue({ where: selectWhere })
  });

  const updateReturning = vi.fn().mockResolvedValue(updateRows);
  updateMock.mockReturnValue({
    set: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnValue({
      returning: updateReturning
    })
  });

  const transaction = vi.fn(async (callback) =>
    callback({
      select: selectMock,
      insert: insertMock,
      update: updateMock
    })
  );

  getDbMock.mockReturnValue({
    insert: insertMock,
    transaction
  });

  return { insertReturning, updateReturning };
}

describe("assessment authority", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("issues a server-seeded form without exposing scoring keys", async () => {
    configureDb({
      insertRows: [activeInstance]
    });

    const result = await issueAssessmentForUser("user_1", {
      courseId: "beginner",
      sectionId: "B-F1",
      family: "conceptual"
    });

    expect(result.id).toBe("instance-1");
    expect(result.questions).toHaveLength(2);
    expect(result.questions[0]).not.toHaveProperty("correctOption");
    expect(result.questions[1]).not.toHaveProperty("expectedElements");
    expect(result.questions[0].options).toEqual(["Wrong", "Right"]);
  });

  it("scores only server-owned answer keys", async () => {
    const submitted = {
      id: "attempt-1",
      instanceId: "instance-1",
      userId: "user_1",
      answersJson: JSON.stringify({ "Q-1": 1 }),
      autoScore: 1,
      autoScorableCount: 1,
      outcome: "scored",
      submittedAt: new Date("2026-09-26T13:00:00.000Z")
    };

    configureDb({
      selectRows: [activeInstance],
      updateRows: [{ ...activeInstance, status: "submitted" }],
      insertRows: [submitted]
    });

    const result = await submitAssessmentForUser("user_1", {
      instanceId: "instance-1",
      answers: { "Q-1": 1 }
    });

    expect(result).toMatchObject({
      autoScore: 1,
      autoScorableCount: 1,
      outcome: "scored"
    });
  });

  it("does not accept an item outside the issued form", async () => {
    configureDb({ selectRows: [activeInstance] });

    await expect(
      submitAssessmentForUser("user_1", {
        instanceId: "instance-1",
        answers: { "ATTACKER-ITEM": 1 }
      })
    ).rejects.toThrow(/outside the issued form/i);

    expect(updateMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("rejects cross-learner instance access", async () => {
    configureDb({ selectRows: [] });

    await expect(
      submitAssessmentForUser("attacker", {
        instanceId: "instance-1",
        answers: { "Q-1": 1 }
      })
    ).rejects.toThrow(/not found/i);
  });

  it("marks open-response forms pending review without inventing a pass rule", async () => {
    const submitted = {
      id: "attempt-2",
      instanceId: "instance-1",
      userId: "user_1",
      answersJson: JSON.stringify({ "Q-1": 1, "Q-2": "explain" }),
      autoScore: 1,
      autoScorableCount: 1,
      outcome: "pending-review",
      submittedAt: new Date("2026-09-26T13:01:00.000Z")
    };

    configureDb({
      selectRows: [activeInstance],
      updateRows: [{ ...activeInstance, status: "submitted" }],
      insertRows: [submitted]
    });

    const result = await submitAssessmentForUser("user_1", {
      instanceId: "instance-1",
      answers: { "Q-1": 1, "Q-2": "explain" }
    });

    expect(result.outcome).toBe("pending-review");
  });

  it("rejects replay when the active-instance compare-and-set update returns no row", async () => {
    configureDb({
      selectRows: [activeInstance],
      updateRows: []
    });

    await expect(
      submitAssessmentForUser("user_1", {
        instanceId: "instance-1",
        answers: { "Q-1": 1 }
      })
    ).rejects.toThrow(/replay detected/i);

    expect(insertMock).not.toHaveBeenCalled();
  });
});
