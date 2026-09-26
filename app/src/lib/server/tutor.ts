import { and, desc, eq, gt, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { courseLessons, type CourseLesson } from "../../data/courseLessons";
import { projects, type ProjectDefinition } from "../../data/projects";
import {
  listCompletionHistoryForUser,
  listMasteryHistoryForUser
} from "./progress";
import { getDb } from "./db";
import { tutorMessages, tutorSessions } from "./schema";

const globalForTutor = globalThis as unknown as {
  devopsTutorSchemaReady?: boolean;
};

export type TutorMessage = {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type TutorContext = {
  lesson: Pick<
    CourseLesson,
    "id" | "title" | "objective" | "course" | "projectId" | "sectionId" | "humanExample"
  >;
  project: Pick<
    ProjectDefinition,
    | "id"
    | "title"
    | "objective"
    | "environment"
    | "estimatedHours"
    | "phases"
    | "failureScenarios"
    | "competencyGates"
    | "evidenceRequirements"
    | "completionCriteria"
    | "reviewGates"
  >;
  learner: {
    completionCount: number;
    recentCompletedItems: string[];
    masteryAttemptsForLesson: Array<{
      attemptNumber: number;
      outcome: string;
      stage: string;
      summary: string;
    }>;
  };
};

async function ensureTutorSchema() {
  if (globalForTutor.devopsTutorSchemaReady) return;

  const db = getDb();

  await db.execute(
    sql.raw(
      'CREATE TABLE IF NOT EXISTS "tutor_sessions" (' +
        '"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,' +
        '"user_id" text NOT NULL REFERENCES "auth_users"("id") ON DELETE CASCADE,' +
        '"lesson_id" text NOT NULL,' +
        '"project_id" text NOT NULL,' +
        '"mode" text NOT NULL,' +
        '"created_at" timestamptz DEFAULT now() NOT NULL,' +
        '"last_active_at" timestamptz DEFAULT now() NOT NULL' +
        ")"
    )
  );

  await db.execute(
    sql.raw(
      'CREATE INDEX IF NOT EXISTS "tutor_sessions_user_lesson_idx" ' +
        'ON "tutor_sessions" ("user_id", "lesson_id", "last_active_at")'
    )
  );

  await db.execute(
    sql.raw(
      'CREATE TABLE IF NOT EXISTS "tutor_messages" (' +
        '"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,' +
        '"session_id" uuid NOT NULL REFERENCES "tutor_sessions"("id") ON DELETE CASCADE,' +
        '"role" text NOT NULL,' +
        '"content" text NOT NULL,' +
        '"turn_index" integer NOT NULL,' +
        '"created_at" timestamptz DEFAULT now() NOT NULL' +
        ")"
    )
  );

  await db.execute(
    sql.raw(
      'CREATE INDEX IF NOT EXISTS "tutor_messages_session_idx" ' +
        'ON "tutor_messages" ("session_id", "created_at", "id")'
    )
  );

  globalForTutor.devopsTutorSchemaReady = true;
}

export async function createTutorSessionForUser(
  userId: string,
  lessonId: string,
  projectId: string,
  mode: string
) {
  await ensureTutorSchema();

  const [row] = await getDb()
    .insert(tutorSessions)
    .values({
      id: randomUUID(),
      userId,
      lessonId,
      projectId,
      mode
    })
    .returning({ id: tutorSessions.id });

  if (!row) throw new Error("Tutor session could not be created.");
  return row.id;
}

export async function getTutorSessionForUser(userId: string, sessionId: string) {
  await ensureTutorSchema();

  const [row] = await getDb()
    .select()
    .from(tutorSessions)
    .where(
      and(eq(tutorSessions.id, sessionId), eq(tutorSessions.userId, userId))
    )
    .limit(1);

  return row ?? null;
}

export async function verifyTutorSessionForUser(
  userId: string,
  sessionId: string,
  lessonId: string,
  projectId: string
) {
  const row = await getTutorSessionForUser(userId, sessionId);
  if (!row) return null;
  if (row.lessonId !== lessonId || row.projectId !== projectId) return null;
  return row;
}

export async function assertTutorRateLimit(
  userId: string,
  maxMessages = 20,
  windowMs = 5 * 60 * 1000
) {
  await ensureTutorSchema();

  const cutoff = new Date(Date.now() - windowMs);
  const rows = await getDb()
    .select({ id: tutorMessages.id })
    .from(tutorMessages)
    .innerJoin(tutorSessions, eq(tutorMessages.sessionId, tutorSessions.id))
    .where(
      and(
        eq(tutorSessions.userId, userId),
        eq(tutorMessages.role, "user"),
        gt(tutorMessages.createdAt, cutoff)
      )
    )
    .limit(maxMessages + 1);

  if (rows.length >= maxMessages) {
    throw new Error("Tutor rate limit reached. Please continue shortly.");
  }

  return {
    allowed: true as const,
    remaining: Math.max(0, maxMessages - rows.length)
  };
}

export async function listTutorMessagesForUser(
  userId: string,
  sessionId: string,
  limit = 16
): Promise<TutorMessage[]> {
  const session = await getTutorSessionForUser(userId, sessionId);
  if (!session) return [];

  const rows = await getDb()
    .select({
      role: tutorMessages.role,
      content: tutorMessages.content,
      createdAt: tutorMessages.createdAt
    })
    .from(tutorMessages)
    .where(eq(tutorMessages.sessionId, sessionId))
    .orderBy(desc(tutorMessages.createdAt), desc(tutorMessages.id))
    .limit(Math.max(1, Math.min(24, limit)));

  return rows
    .reverse()
    .map((row) => ({
      role: row.role === "assistant" ? "assistant" : "user",
      content: row.content,
      createdAt: row.createdAt.toISOString()
    }));
}

export async function appendTutorMessage(
  userId: string,
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  const session = await getTutorSessionForUser(userId, sessionId);
  if (!session) throw new Error("Tutor session not found.");

  const [latest] = await getDb()
    .select({ turnIndex: tutorMessages.turnIndex })
    .from(tutorMessages)
    .where(eq(tutorMessages.sessionId, sessionId))
    .orderBy(desc(tutorMessages.turnIndex))
    .limit(1);

  const [row] = await getDb()
    .insert(tutorMessages)
    .values({
      sessionId,
      role,
      content,
      turnIndex: (latest?.turnIndex ?? -1) + 1
    })
    .returning({ id: tutorMessages.id });

  await getDb()
    .update(tutorSessions)
    .set({ lastActiveAt: new Date() })
    .where(eq(tutorSessions.id, sessionId));

  return row?.id ?? null;
}

export async function buildTutorContext(
  userId: string,
  lessonId: string
): Promise<TutorContext> {
  const lesson = courseLessons.find((item) => item.id === lessonId);
  if (!lesson) throw new Error("Lesson not found.");

  const project = projects.find(
    (item) => item.id === lesson.projectId && item.course === lesson.course
  );
  if (!project) throw new Error("Lesson project context not found.");

  const [completionHistory, masteryHistory] = await Promise.all([
    listCompletionHistoryForUser(userId),
    listMasteryHistoryForUser(userId)
  ]);

  return {
    lesson: {
      id: lesson.id,
      title: lesson.title,
      objective: lesson.objective,
      course: lesson.course,
      projectId: lesson.projectId,
      sectionId: lesson.sectionId,
      humanExample: lesson.humanExample
    },
    project: {
      id: project.id,
      title: project.title,
      objective: project.objective,
      environment: project.environment,
      estimatedHours: project.estimatedHours,
      phases: project.phases,
      failureScenarios: project.failureScenarios,
      competencyGates: project.competencyGates,
      evidenceRequirements: project.evidenceRequirements,
      completionCriteria: project.completionCriteria,
      reviewGates: project.reviewGates
    },
    learner: {
      completionCount: completionHistory.length,
      recentCompletedItems: completionHistory
        .slice(-20)
        .map((item) => item.itemType + ":" + item.itemId),
      masteryAttemptsForLesson: masteryHistory
        .filter((item) => item.lessonId === lesson.id)
        .slice(-8)
        .map((item) => ({
          attemptNumber: item.attemptNumber,
          outcome: item.outcome,
          stage: item.stage,
          summary: item.summary
        }))
    }
  };
}
