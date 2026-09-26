"use server";

import { requireCurrentUser } from "../../lib/server/auth";
import {
  parseCompleteLearningItemCommand
} from "../../framework/authorityRequest";
import { parseMasteryCommand } from "../../framework/masteryRequest";
import {
  completeLearningItemForUser
} from "../../lib/server/learningAuthority";
import {
  recordAuthoritativeMasteryAttemptForUser
} from "../../lib/server/masteryAuthority";

export async function completeLearningItemAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const command = parseCompleteLearningItemCommand(rawInput);
  return completeLearningItemForUser(user.id, command);
}

export async function recordMasteryAttemptAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const command = parseMasteryCommand(rawInput);
  return recordAuthoritativeMasteryAttemptForUser(user.id, command);
}
