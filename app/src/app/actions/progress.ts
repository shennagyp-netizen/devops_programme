"use server";

import { requireCurrentUser } from "../../lib/server/auth";
import {
  parseCompleteLearningItemCommand
} from "../../framework/authorityRequest";
import { findProgrammeLearningItem } from "../../lib/server/programmeAuthority";
import {
  completeLearningItemForUser,
  recordMasteryAttemptForUser
} from "../../lib/server/progress";
import { parseMasteryAttemptInput } from "../../lib/mastery-contract";

export async function completeLearningItemAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const command = parseCompleteLearningItemCommand(rawInput);
  const item = findProgrammeLearningItem(command.itemId);

  if (!item) {
    throw new Error("Unknown learning item.");
  }

  return completeLearningItemForUser(user.id, {
    itemType: item.itemType === "assessment" ? "question" : item.itemType,
    itemId: item.id,
    course: item.course,
    ...(item.projectId ? { projectId: item.projectId } : {})
  });
}

export async function recordMasteryAttemptAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const parsed = parseMasteryAttemptInput(rawInput);
  return recordMasteryAttemptForUser(user.id, parsed);
}
