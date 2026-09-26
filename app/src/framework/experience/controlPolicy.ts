import type { LearningControl, LearningMode, LearningSessionState } from "./contracts";

const modes: LearningMode[] = ["learn", "do", "recall", "design", "assessment"];

export function deriveModeControls(state: LearningSessionState): LearningControl[] {
  return modes.map((mode) => {
    const assessmentLocked = mode === "assessment" && !state.assessmentEligible;
    return {
      id: `mode:${mode}`,
      intent: { type: "SELECT_MODE", mode },
      label: mode[0].toUpperCase() + mode.slice(1),
      state: assessmentLocked
        ? {
            status: "locked" as const,
            reasonCode: "PREREQUISITE_REQUIRED" as const,
          }
        : { status: "enabled" as const },
      visibility: "visible" as const,
      confirmation: "none" as const
    };
  });
}

export function deriveLearningControls(state: LearningSessionState): LearningControl[] {
  const verification: LearningControl = {
    id: "verify",
    intent: { type: "REQUEST_RUNTIME_VERIFICATION", providerId: "best-available" },
    label: "Run verified exercise",
    state: state.providerBusy
      ? { status: "busy", busyLabel: "Verifying…" }
      : state.requiredEvidenceVerified
        ? { status: "disabled", reasonCode: "ALREADY_COMPLETED" }
        : !state.providerAvailable
          ? { status: "unavailable", reasonCode: "PROVIDER_OFFLINE" }
          : { status: "enabled" },
    visibility: "visible",
    confirmation: "external",
  };

  const remediation: LearningControl = {
    id: "remediation",
    intent: { type: "OPEN_REMEDIATION" },
    label: "Open remediation",
    state: state.remediationActive
      ? { status: "disabled", reasonCode: "NOT_APPLICABLE" }
      : state.remediationAvailable
        ? { status: "enabled" }
        : { status: "locked", reasonCode: "REMEDIATION_ACTIVE" },
    visibility: state.remediationAvailable ? "contextual" : "hidden",
    confirmation: "none",
  };

  const complete: LearningControl = {
    id: "complete",
    intent: { type: "COMPLETE_ITEM" },
    label: "Mark complete",
    state:
      state.completionBusy
        ? { status: "busy", busyLabel: "Saving…" }
        : state.completionConfirmed
          ? { status: "disabled", reasonCode: "ALREADY_COMPLETED" }
          : state.requiredEvidenceVerified
            ? { status: "enabled" }
            : { status: "locked", reasonCode: "EVIDENCE_REQUIRED" },
    visibility: "visible",
    confirmation: "none",
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