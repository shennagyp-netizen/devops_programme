export type TutorRole = "user" | "assistant";

export type TutorMessage = {
  role: TutorRole;
  content: string;
};

export type TutorContext = {
  lessonId: string;
  lessonTitle: string;
  lessonObjective: string;
  domain: string;
  projectId: string;
  course: string;
};

export type TutorRequest = {
  lessonId: string;
  messages: TutorMessage[];
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;

function cleanString(value: unknown, maxChars: number) {
  if (typeof value !== "string") return "";
  return value.replace(/\0/g, "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxChars);
}

export function parseTutorRequest(value: unknown): TutorRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const lessonId = cleanString(raw.lessonId, 64);
  const rawMessages = raw.messages;
  if (!lessonId || !Array.isArray(rawMessages) || rawMessages.length === 0 || rawMessages.length > MAX_MESSAGES) return null;

  const messages: TutorMessage[] = [];
  for (const rawMessage of rawMessages) {
    if (!rawMessage || typeof rawMessage !== "object" || Array.isArray(rawMessage)) return null;
    const message = rawMessage as Record<string, unknown>;
    const role = message.role;
    const content = cleanString(message.content, MAX_MESSAGE_CHARS);
    if ((role !== "user" && role !== "assistant") || !content) return null;
    messages.push({ role, content });
  }

  const lastMessage = messages.at(-1);
  return lastMessage?.role === "user" ? { lessonId, messages } : null;
}

export const tutorLimits = {
  maxMessages: MAX_MESSAGES,
  maxMessageChars: MAX_MESSAGE_CHARS,
  rateLimitPerMinute: 20
} as const;
