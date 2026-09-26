import type { TutorContext } from "../../lib/tutor-contract";

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

export type FloatingLLMAssistantProps = {
  context: TutorContext;
};
