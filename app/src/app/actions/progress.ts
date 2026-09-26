"use server";

import { requireCurrentUser } from "../../lib/server/auth";
import {
  parseCompleteLearningItemCommand
} from "../../framework/authorityRequest";
import {
  completeLearningItemForUser
} from "../../lib/server/learningAuthority";
import {
  recordMasteryAttemptForUser
} from "../../lib/server/progress";
import { parseMasteryAttemptInput } from "../../lib/mastery-contract";

export async function completeLearningItemAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const command = parseCompleteLearningItemCommand(rawInput);
  return completeLearningItemForUser(user.id, command);
}

export async function recordMasteryAttemptAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const parsed = parseMasteryAttemptInput(rawInput);
  return recordMasteryAttemptForUser(user.id, parsed);
}
