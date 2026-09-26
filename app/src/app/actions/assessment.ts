"use server";

import { requireCurrentUser } from "../../lib/server/auth";
import {
  parseIssueAssessmentCommand,
  parseSubmitAssessmentCommand
} from "../../framework/assessmentRequest";
import {
  issueAssessmentForUser,
  submitAssessmentForUser
} from "../../lib/server/assessmentAuthority";

export async function issueAssessmentAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const command = parseIssueAssessmentCommand(rawInput);
  return issueAssessmentForUser(user.id, command);
}

export async function submitAssessmentAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const command = parseSubmitAssessmentCommand(rawInput);
  return submitAssessmentForUser(user.id, command);
}
