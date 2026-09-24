import type { IncomingMessage, ServerResponse } from "node:http";
import { asc, eq } from "drizzle-orm";
import { getDb } from "./_lib/db";
import { learnerProgressHistory } from "./_lib/schema";

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
          itemType: learnerProgressHistory.itemType,
          itemId: learnerProgressHistory.itemId,
          completedAt: learnerProgressHistory.completedAt,
          verificationLevel: learnerProgressHistory.verificationLevel,
          course: learnerProgressHistory.course,
          projectId: learnerProgressHistory.projectId
        })
        .from(learnerProgressHistory)
        .where(eq(learnerProgressHistory.learnerId, learnerId.trim()))
        .orderBy(asc(learnerProgressHistory.completedAt), asc(learnerProgressHistory.id));

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
        .insert(learnerProgressHistory)
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
            learnerProgressHistory.learnerId,
            learnerProgressHistory.itemType,
            learnerProgressHistory.itemId
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
          itemType: learnerProgressHistory.itemType,
          itemId: learnerProgressHistory.itemId,
          completedAt: learnerProgressHistory.completedAt
        });

      send(res, 200, { completed: true, item: inserted[0] });
      return;
    }

    res.setHeader("Allow", "GET, POST, PUT");
    send(res, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error("Learner progress API error", error);
    send(res, 500, { error: "Progress service is temporarily unavailable." });
  }
}
