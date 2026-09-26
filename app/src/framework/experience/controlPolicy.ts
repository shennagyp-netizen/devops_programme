import type { LearningControl, LearningMode, LearningSessionState } from "./contracts";

const modes: LearningMode[] = [
  "learn",
  "do",
  "recall",
  "design",
  "assessment"
];

export function deriveModeControls(state: LearningSessionState): LearningControl[] {
  return modes.map((mode) => ({
    id: `mode:${mode}`,
    intent: { type: "SELECT_MODE", mode },
    label: mode[0].toUpperCase() + mode.slice(1),
    availability: mode === "assessment" && !state.assessmentEligible ? "locked" : "enabled",
    visibility: "visible",
    ...(mode === "assessment" && !state.assessmentEligible
      ? { reason: "Complete the required prerequisite before starting the assessment." }
      : {}),
    confirmation: "none"
  }));
}

export function deriveLearningControls(state: LearningSessionState): LearningControl[] {
  const verification: LearningControl = {
    id: "verify",
    intent: { type: "REQUEST_RUNTIME_VERIFICATION", providerId: "best-available" },
    label: "Run verified exercise",
    availability: state.providerBusy ? "busy" : state.requiredEvidenceVerified ? "disabled" : "enabled",
    visibility: "visible",
    confirmation: "external",
    ...(state.providerBusy ? { busyLabel: "Verifying…" } : {}),
    ...(state.requiredEvidenceVerified ? { reason: "Required evidence is already verified." } : {})
  };

  const remediation: LearningControl = {
    id: "remediation",
    intent: { type: "OPEN_REMEDIATION" },
    label: "Open remediation",
    availability: state.remediationActive ? "disabled" : state.remediationAvailable ? "enabled" : "locked",
    visibility: state.remediationAvailable ? "contextual" : "hidden",
    ...(state.remediationAvailable && !state.remediationActive ? {} : { reason: "Remediation is not currently available." }),
    confirmation: "none"
  };

  const complete: LearningControl = {
    id: "complete",
    intent: { type: "COMPLETE_ITEM" },
    label: "Mark complete",
    availability: state.completionBusy
      ? "busy"
      : state.completionConfirmed
        ? "disabled"
        : state.requiredEvidenceVerified
          ? "enabled"
          : "locked",
    visibility: "visible",
    confirmation: "none",
    ...(state.completionBusy ? { busyLabel: "Saving…" } : {}),
    ...(!state.completionBusy && !state.completionConfirmed && !state.requiredEvidenceVerified
      ? { reason: "Complete the required exercise verification first." }
      : {})
  };

  return [verification, remediation, complete];
}

export function deriveExperienceView(state: LearningSessionState) {
  const controls = [...deriveModeControls(state), ...deriveLearningControls(state)];
  const recommendedAction = state.completionConfirmed
    ? "Continue to the next eligible learning item."
    : state.requiredEvidenceVerified
      ? "Review the result and mark the learning item complete."
      : state.remediationActive
        ? "Complete the guided remediation before retrying."
        : "Work through the required exercise and collect evidence.";
  return { session: state, controls, recommendedAction };
}