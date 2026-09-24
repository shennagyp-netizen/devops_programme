"use server";

import { auth } from "@clerk/nextjs/server";
import { parseCompletionInput } from "../../lib/progress-contract";
import { completeLearningItemForUser } from "../../lib/server/progress";

export async function completeLearningItemAction(rawInput: unknown) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Authentication required.");
  }

  return completeLearningItemForUser(userId, parseCompletionInput(rawInput));
}
