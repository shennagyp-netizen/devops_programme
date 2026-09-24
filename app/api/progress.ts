import type { IncomingMessage, ServerResponse } from "node:http";
import { and, asc, eq } from "drizzle-orm";
import { getDb } from "./_lib/db";
import { learnerCompletions } from "./_lib/schema";

type ApiRequest = IncomingMessage & {
  method?: string;
  body?: unknown;
  query?: Record<string, string | string[] | undefined>;
};

type ApiResponse = ServerResponse & {
  status?: (code: number) => ApiResponse;
  json?: (body: unknown) => void;
};

type CompletionBody = {
  learnerId?: unknown;
  itemType?: unknown;
  itemId?: unknown;
  course?: unknown;
  projectId?: unknown;
  verificationLevel?: unknown;
};

const ITEM_TYPES = new Set(["lesson", "assignment", "question", "project"]);

function send(res: ApiResponse, status: number, body: unknown) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    res.status(status).json(body);
    return;
  }

  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function readQuery(req: ApiRequest, key: string) {
  const value = req.query?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function isString(value: unknown, max = 200): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function validateIdentity(input: CompletionBody) {
  if (!isString(input.learnerId, 200)) return "learnerId is required.";
  if (!isString(input.itemType, 32) || !ITEM_TYPES.has(input.itemType.trim())) {
    return "itemType must be lesson, assignment, question, or project.";
  }
  if (!isString(input.itemId, 200)) return "itemId is required.";
  return null;
}

async function parseBody(req: ApiRequest): Promise<CompletionBody> {
  if (req.body && typeof req.body === "object") return req.body as CompletionBody;

  let raw = "";
  for await (const chunk of req as AsyncIterable<string | Uint8Array>) {
    raw += chunk.toString();
    if (raw.length > 32 * 1024) throw new Error("Request body is too large.");
  }
  if (!raw) return {};
  return JSON.parse(raw) as CompletionBody;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  try {
    if (req.method === "GET") {
      const learnerId = readQuery(req, "learnerId");
      if (!isString(learnerId)) {
        send(res, 400, { error: "learnerId is required." });
        return;
      }

      const db = getDb();
      const items = await db
        .select({
          itemType: learnerCompletions.itemType,
          itemId: learnerCompletions.itemId,
          completedAt: learnerCompletions.completedAt,
          verificationLevel: learnerCompletions.verificationLevel,
          course: learnerCompletions.course,
          projectId: learnerCompletions.projectId
        })
        .from(learnerCompletions)
        .where(eq(learnerCompletions.learnerId, learnerId.trim()))
        .orderBy(asc(learnerCompletions.completedAt));

      send(res, 200, { items });
      return;
    }

    if (req.method === "POST" || req.method === "PUT") {
      const body = await parseBody(req);
      const failure = validateIdentity(body);
      if (failure) {
        send(res, 400, { error: failure });
        return;
      }

      const db = getDb();
      const learnerId = String(body.learnerId).trim();
      const itemType = String(body.itemType).trim();
      const itemId = String(body.itemId).trim();

      const inserted = await db
        .insert(learnerCompletions)
        .values({
          learnerId,
          itemType,
          itemId,
          course: isString(body.course, 64) ? body.course.trim() : null,
          projectId: isString(body.projectId, 128) ? body.projectId.trim() : null,
          verificationLevel: isString(body.verificationLevel, 64)
            ? body.verificationLevel.trim()
            : null
        })
        .onConflictDoUpdate({
          target: [
            learnerCompletions.learnerId,
            learnerCompletions.itemType,
            learnerCompletions.itemId
          ],
          set: {
            verificationLevel: isString(body.verificationLevel, 64)
              ? body.verificationLevel.trim()
              : null,
            course: isString(body.course, 64) ? body.course.trim() : null,
            projectId: isString(body.projectId, 128) ? body.projectId.trim() : null
          }
        })
        .returning({
          itemType: learnerCompletions.itemType,
          itemId: learnerCompletions.itemId,
          completedAt: learnerCompletions.completedAt
        });

      send(res, 200, { completed: true, item: inserted[0] });
      return;
    }

    if (req.method === "DELETE") {
      const learnerId = readQuery(req, "learnerId");
      const itemType = readQuery(req, "itemType");
      const itemId = readQuery(req, "itemId");

      if (!isString(learnerId) || !isString(itemType) || !isString(itemId)) {
        send(res, 400, { error: "learnerId, itemType and itemId are required." });
        return;
      }

      if (!ITEM_TYPES.has(itemType.trim())) {
        send(res, 400, { error: "Invalid itemType." });
        return;
      }

      const db = getDb();
      await db
        .delete(learnerCompletions)
        .where(
          and(
            eq(learnerCompletions.learnerId, learnerId.trim()),
            eq(learnerCompletions.itemType, itemType.trim()),
            eq(learnerCompletions.itemId, itemId.trim())
          )
        );

      send(res, 200, { completed: false });
      return;
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    send(res, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error("Learner progress API error", error);
    send(res, 500, { error: "Progress service is temporarily unavailable." });
  }
}
