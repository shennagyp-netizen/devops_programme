export type TutorRole = "user" | "assistant";

export type TutorLearningMode =
  | "learn"
  | "do"
  | "recall"
  | "design"
  | "assessment";

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
  learningMode: TutorLearningMode;
};

export type TutorRequest = {
  lessonId: string;
  learningMode: TutorLearningMode;
  messages: TutorMessage[];
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_LESSON_ID_CHARS = 64;

const learningModes = new Set<TutorLearningMode>([
  "learn",
  "do",
  "recall",
  "design",
  "assessment"
]);

function cleanString(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/\0/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export function parseTutorRequest(value: unknown): TutorRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const raw = value as Record<string, unknown>;
  const lessonId = cleanString(raw.lessonId);
  const learningMode = raw.learningMode;
  const rawMessages = raw.messages;

  if (
    !lessonId ||
    lessonId.length > MAX_LESSON_ID_CHARS ||
    !learningModes.has(learningMode as TutorLearningMode) ||
    !Array.isArray(rawMessages) ||
    rawMessages.length === 0 ||
    rawMessages.length > MAX_MESSAGES
  ) {
    return null;
  }

  const messages: TutorMessage[] = [];

  for (const rawMessage of rawMessages) {
    if (!rawMessage || typeof rawMessage !== "object" || Array.isArray(rawMessage)) {
      return null;
    }

    const message = rawMessage as Record<string, unknown>;
    const role = message.role;
    const content = cleanString(message.content);

    if (
      (role !== "user" && role !== "assistant") ||
      !content ||
      content.length > MAX_MESSAGE_CHARS
    ) {
      return null;
    }

    messages.push({ role, content });
  }

  const lastMessage = messages.at(-1);
  return lastMessage?.role === "user"
    ? { lessonId, learningMode: learningMode as TutorLearningMode, messages }
    : null;
}

export const tutorLimits = {
  maxMessages: MAX_MESSAGES,
  maxMessageChars: MAX_MESSAGE_CHARS,
  maxLessonIdChars: MAX_LESSON_ID_CHARS,
  rateLimitPerMinute: 20
} as const;
