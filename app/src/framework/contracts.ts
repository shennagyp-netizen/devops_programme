export type LearningItemKind =
  | "lesson"
  | "assignment"
  | "question"
  | "project"
  | "assessment";

export type VerificationLevel =
  | "self-report"
  | "structured"
  | "machine-verified";

export type EvidenceRequirement = {
  kind: string;
  minimumVerificationLevel: VerificationLevel;
};

export type CompletionPolicy =
  | {
      mode: "evidence";
      requiredEvidence: EvidenceRequirement[];
    }
  | {
      mode: "assessment";
      requiredAssessment: string;
    };

export type LearningItemDefinition = {
  id: string;
  programmeId: string;
  kind: LearningItemKind;
  completion: CompletionPolicy;
};

export type VerifiedEvidenceRecord = {
  id: string;
  learnerId: string;
  itemId: string;
  kind: string;
  verificationLevel: VerificationLevel;
  verifierId: string;
  verificationRef: string;
  verifiedAt: string;
};

export type EvidenceRef = {
  id: string;
  kind: string;
  verificationLevel: VerificationLevel;
};

export type AuthorityContext = {
  learnerId: string;
  items: ReadonlyMap<string, LearningItemDefinition>;
  verifiedEvidence: ReadonlyMap<string, VerifiedEvidenceRecord>;
};

export type LearningTransitionRequest = {
  learnerId: string;
  itemId: string;
  evidenceRefs?: string[];
  assessmentAttemptId?: string;
  clientAssertions?: Record<string, unknown>;
};

export type LearningTransitionFailure =
  | "UNKNOWN_LEARNING_ITEM"
  | "LEARNER_MISMATCH"
  | "UNSUPPORTED_COMPLETION_MODE"
  | "EVIDENCE_NOT_VERIFIED"
  | "EVIDENCE_LEARNER_MISMATCH"
  | "EVIDENCE_ITEM_MISMATCH"
  | "REQUIRED_EVIDENCE_MISSING";

export type LearningTransitionResult =
  | {
      accepted: true;
      learnerId: string;
      itemId: string;
      satisfiedEvidence: string[];
      verificationLevel: VerificationLevel;
    }
  | {
      accepted: false;
      reason: LearningTransitionFailure;
    };
