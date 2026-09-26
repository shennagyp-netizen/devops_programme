import { beforeEach, describe, expect, it, vi } from "vitest";
import { and, eq } from "drizzle-orm";

const cookieJar = new Map();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get(name) {
      const value = cookieJar.get(name);
      return value ? { name, value } : undefined;
    },
    set(name, value) {
      cookieJar.set(name, value);
    },
    delete(name) {
      cookieJar.delete(name);
    }
  })
}));

const {
  registerUserAndCreateSession,
  loginUserAndCreateSession,
  getCurrentUser,
  logoutCurrentSession,
  SESSION_COOKIE_NAME
} = await import("../../src/lib/server/auth.ts");
const {
  completeLearningItemForUser,
  listCompletionHistoryForUser
} = await import("../../src/lib/server/progress.ts");
const { startAssessment, submitAssessment } = await import(
  "../../src/lib/server/assessment.ts"
);
const { getDb } = await import("../../src/lib/server/db.ts");
const {
  authSessions,
  learnerAssessmentAttempts,
  learnerProgressHistory
} = await import("../../src/lib/server/schema.ts");

const enabled = Boolean(process.env.DATABASE_URL);
const describeDatabase = enabled ? describe : describe.skip;

function uniqueEmail(label) {
  return `integration-${label}-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

describeDatabase("real PostgreSQL learner-data integration", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

  it("persists a hashed-password user session and restores the session from the cookie", async () => {
    const email = uniqueEmail("auth");

    const user = await registerUserAndCreateSession(
      email,
      "Correct-Horse-Battery-Staple-42"
    );

    expect(user.email).toBe(email);
    const token = cookieJar.get(SESSION_COOKIE_NAME);
    expect(token).toBeTruthy();

    const db = getDb();
    const sessions = await db
      .select()
      .from(authSessions)
      .where(eq(authSessions.userId, user.id));

    expect(sessions).toHaveLength(1);
    expect(sessions[0].tokenHash).not.toBe(token);
    expect(sessions[0].tokenHash).toMatch(/^[a-f0-9]{64}$/);

    expect(await getCurrentUser()).toEqual(user);

    await logoutCurrentSession();
    expect(await getCurrentUser()).toBeNull();

    await loginUserAndCreateSession(email, "Correct-Horse-Battery-Staple-42");
    expect(await getCurrentUser()).toEqual(user);
  });

  it("stores one progress history row for repeated completion of the same item", async () => {
    const user = await registerUserAndCreateSession(
      uniqueEmail("progress"),
      "Correct-Horse-Battery-Staple-42"
    );

    const first = await completeLearningItemForUser(user.id, {
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1",
      verificationLevel: "exercise-validated"
    });

    const second = await completeLearningItemForUser(user.id, {
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1",
      verificationLevel: "machine-verified"
    });

    expect(second).toEqual(first);

    const history = await listCompletionHistoryForUser(user.id);
    expect(history).toHaveLength(1);
    expect(history[0].verificationLevel).toBe("exercise-validated");

    const db = getDb();
    const rows = await db
      .select()
      .from(learnerProgressHistory)
      .where(
        and(
          eq(learnerProgressHistory.userId, user.id),
          eq(learnerProgressHistory.itemType, "lesson"),
          eq(learnerProgressHistory.itemId, "B1.2")
        )
      );

    expect(rows).toHaveLength(1);
  });

  it("binds an assessment attempt to the authenticated user and enforces one active form", async () => {
    const firstUser = await registerUserAndCreateSession(
      uniqueEmail("assessment-a"),
      "Correct-Horse-Battery-Staple-42"
    );

    const started = await startAssessment("beginner", "B-F1", "conceptual");
    expect(started.attemptId).toBeTruthy();
    expect(started.itemCount).toBeGreaterThan(0);
    expect(
      started.items.every((item) => !Object.hasOwn(item, "correctOption"))
    ).toBe(true);

    await expect(
      startAssessment("beginner", "B-F1", "conceptual")
    ).rejects.toThrow("already in progress");

    await registerUserAndCreateSession(
      uniqueEmail("assessment-b"),
      "Correct-Horse-Battery-Staple-42"
    );

    await expect(
      submitAssessment(started.attemptId, [])
    ).rejects.toThrow("Assessment attempt not found.");

    await loginUserAndCreateSession(
      firstUser.email,
      "Correct-Horse-Battery-Staple-42"
    );

    const submitted = await submitAssessment(started.attemptId, []);
    expect(submitted.attempt.id).toBe(started.attemptId);
    expect(submitted.attempt.status).toBe("scored");
    expect(submitted.attempt.answeredCount).toBe(0);
    expect(submitted.result.correctCount).toBe(0);

    await expect(
      submitAssessment(started.attemptId, [])
    ).rejects.toThrow("already been submitted");

    const db = getDb();
    const attempts = await db
      .select()
      .from(learnerAssessmentAttempts)
      .where(eq(learnerAssessmentAttempts.id, started.attemptId));

    expect(attempts).toHaveLength(1);
    expect(attempts[0].userId).toBe(firstUser.id);
    expect(attempts[0].answersJson).toBe("[]");
  });
});
