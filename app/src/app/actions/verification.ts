"use server";

import { requireCurrentUser } from "../../lib/server/auth";
import {
  parseVerificationAttestationCommand,
  parseVerificationChallengeCommand
} from "../../framework/verificationRequest";
import {
  acceptVerificationAttestationForUser,
  issueVerificationChallengeForUser
} from "../../lib/server/verificationProviderAuthority";

export async function requestVerificationChallengeAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const command = parseVerificationChallengeCommand(rawInput);
  return issueVerificationChallengeForUser(user.id, command);
}

export async function submitVerificationAttestationAction(rawInput: unknown) {
  const user = await requireCurrentUser();
  const command = parseVerificationAttestationCommand(rawInput);
  return acceptVerificationAttestationForUser(user.id, command);
}
