"use server";

import { requireCurrentUser } from "../../lib/server/auth";
import {
  createMasteryAttempt,
  completeMasteryRemediation,
  finishMasteryAttempt,
  listMasteryAttemptsForUser
} from "../../lib/server/mastery";

export async function recordMasteryAttemptAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const attemptId = await createMasteryAttempt(user.id, rawInput);
  return { attemptId };
}

export async function completeMasteryRemediationAction(rawAttemptId: unknown) {
  const user = await requireCurrentUser();
  return completeMasteryRemediation(user.id, rawAttemptId);
}

export async function finishMasteryAttemptAction(
  rawAttemptId: unknown,
  result: "failed" | "pending" | "passed"
) {
  const user = await requireCurrentUser();
  return finishMasteryAttempt(user.id, rawAttemptId, result);
}

export async function listMasteryAttemptsAction(lessonId: string, assignmentId: string) {
  const user = await requireCurrentUser();
  return listMasteryAttemptsForUser(user.id, lessonId, assignmentId);
}
