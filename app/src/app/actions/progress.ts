"use server";

import { requireCurrentUser } from "../../lib/server/auth";
import { parseCompletionInput } from "../../lib/progress-contract";
import { completeLearningItemForUser, recordMasteryAttemptForUser } from "../../lib/server/progress";
import { parseMasteryAttemptInput } from "../../lib/mastery-contract";

export async function completeLearningItemAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  return completeLearningItemForUser(user.id, parseCompletionInput(rawInput));
}


export async function recordMasteryAttemptAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const parsed = parseMasteryAttemptInput(rawInput);
  return recordMasteryAttemptForUser(user.id, parsed);
}
