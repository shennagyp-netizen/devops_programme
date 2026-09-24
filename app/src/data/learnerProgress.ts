export type LearningItemType = "lesson" | "assignment" | "question" | "project";

export type CompletionRecord = {
  itemType: LearningItemType;
  itemId: string;
  completedAt: string;
  verificationLevel?: string | null;
  course?: string | null;
  projectId?: string | null;
};

const LEARNER_ID_KEY = "devops-programme-learner-id";
const API_URL = "/api/progress";

function createLearnerId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "learner-" + Date.now() + "-" + Math.random().toString(36).slice(2, 12);
}

export function getLearnerId() {
  try {
    const existing = localStorage.getItem(LEARNER_ID_KEY);
    if (existing) return existing;
    const id = createLearnerId();
    localStorage.setItem(LEARNER_ID_KEY, id);
    return id;
  } catch {
    return createLearnerId();
  }
}

async function request<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const body = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(
      body.error ?? "Progress API returned HTTP " + String(response.status) + "."
    );
  }
  return body;
}

export async function listCompletedItems(): Promise<CompletionRecord[]> {
  const learnerId = getLearnerId();
  const result = await request<{ items: CompletionRecord[] }>(
    API_URL + "?learnerId=" + encodeURIComponent(learnerId),
    { method: "GET" }
  );
  return result.items;
}

export async function completeLearningItem(input: {
  itemType: LearningItemType;
  itemId: string;
  course?: string;
  projectId?: string;
  verificationLevel?: string;
}) {
  const learnerId = getLearnerId();
  return request<{ completed: true; item: CompletionRecord }>(API_URL, {
    method: "POST",
    body: JSON.stringify({ learnerId, ...input })
  });
}

export async function uncompleteLearningItem(input: {
  itemType: LearningItemType;
  itemId: string;
}) {
  const learnerId = getLearnerId();
  return request<{ completed: false }>(
    API_URL +
      "?learnerId=" +
      encodeURIComponent(learnerId) +
      "&itemType=" +
      encodeURIComponent(input.itemType) +
      "&itemId=" +
      encodeURIComponent(input.itemId),
    { method: "DELETE" }
  );
}
