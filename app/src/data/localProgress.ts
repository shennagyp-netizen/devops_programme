import type { CompletionRecord } from "../lib/progress-contract";

const STORAGE_KEY = "devops-programme:local-progress:v3";

function read(): CompletionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CompletionRecord =>
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as Record<string, unknown>).itemType === "string" &&
        typeof (item as Record<string, unknown>).itemId === "string" &&
        typeof (item as Record<string, unknown>).completedAt === "string"
    );
  } catch {
    return [];
  }
}

function write(records: CompletionRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // MVP progress is best-effort browser-local state.
  }
}

export function readLocalCompletionHistory(): CompletionRecord[] {
  return read();
}

export function completeLocalLearningItem(input: {
  itemId: string;
  course?: string;
  projectId?: string;
}): CompletionRecord {
  const existing = read().find(
    (item) => item.itemType === "lesson" && item.itemId === input.itemId
  );

  if (existing) return existing;

  const record: CompletionRecord = {
    itemType: "lesson",
    itemId: input.itemId,
    completedAt: new Date().toISOString(),
    verificationLevel: "structured",
    course: input.course ?? null,
    projectId: input.projectId ?? null
  };

  write([...read(), record]);
  return record;
}
