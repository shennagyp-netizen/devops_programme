export type LearningMode =
  | "learn"
  | "do"
  | "recall"
  | "design"
  | "assessment";

export type LearningIntent =
  | { type: "SELECT_COURSE"; courseId: string }
  | { type: "SELECT_ITEM"; itemId: string }
  | { type: "SELECT_ENVIRONMENT"; platformId: string }
  | { type: "SELECT_MODE"; mode: LearningMode }
  | { type: "OPEN_REMEDIATION" }
  | { type: "SUBMIT_EVIDENCE"; evidenceId: string }
  | { type: "REQUEST_RUNTIME_VERIFICATION"; providerId: string }
  | { type: "SUBMIT_ASSESSMENT"; attemptId: string }
  | { type: "REQUEST_TUTOR_HELP" }
  | { type: "PLAY_AUDIO" }
  | { type: "PAUSE_AUDIO" }
  | { type: "OPEN_ANIMATION"; animationId: string }
  | { type: "COMPLETE_ITEM" };

export type ControlState =
  | { status: "enabled" }
  | { status: "busy"; operationId?: string; busyLabel?: string }
  | { status: "disabled"; reasonCode: "ALREADY_COMPLETED" | "NOT_APPLICABLE" }
  | { status: "locked"; reasonCode: "EVIDENCE_REQUIRED" | "PREREQUISITE_REQUIRED" | "REMEDIATION_ACTIVE"; resolutionIntent?: LearningIntent }
  | { status: "unavailable"; reasonCode: "CAPABILITY_UNAVAILABLE" | "PROVIDER_OFFLINE" | "NETWORK_REQUIRED"; resolutionIntent?: LearningIntent };

export type LearningControl = {
  id: string;
  intent: LearningIntent;
  label: string;
  state: ControlState;
  visibility: "visible" | "hidden" | "contextual";
  confirmation: "none" | "destructive" | "external";
  ariaDescription?: string;
};

export type LearningSessionState = {
  itemId: string;
  mode: LearningMode;
  completionConfirmed: boolean;
  requiredEvidenceVerified: boolean;
  assessmentEligible: boolean;
  remediationAvailable: boolean;
  remediationActive: boolean;
  providerBusy: boolean;
  providerAvailable: boolean;
  completionBusy: boolean;
};

export type ExperienceView = {
  session: LearningSessionState;
  controls: LearningControl[];
  recommendedAction: string;
};