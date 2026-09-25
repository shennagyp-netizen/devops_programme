"use server";

import { requireCurrentUser } from "../../lib/server/auth";
import { parseCompletionInput } from "../../lib/progress-contract";
import { completeLearningItemForUser } from "../../lib/server/progress";

export async function completeLearningItemAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  return completeLearningItemForUser(user.id, parseCompletionInput(rawInput));
}
