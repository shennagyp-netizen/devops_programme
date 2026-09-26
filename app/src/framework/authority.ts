import type {
  AuthorityContext,
  EvidenceRequirement,
  EvidenceRef,
  LearningTransitionRequest,
  LearningTransitionResult,
  VerificationLevel
} from "./contracts";

export type { AuthorityContext };

const verificationRank: Record<VerificationLevel, number> = {
  "self-report": 0,
  structured: 1,
  "machine-verified": 2
};

function satisfies(
  evidence: EvidenceRef,
  requirement: EvidenceRequirement
) {
  return (
    evidence.kind === requirement.kind &&
    verificationRank[evidence.verificationLevel] >=
      verificationRank[requirement.minimumVerificationLevel]
  );
}

function satisfyRequirements(
  requirements: EvidenceRequirement[],
  evidence: EvidenceRef[]
) {
  const unused = new Map(evidence.map((entry) => [entry.id, entry]));
  const sorted = [...requirements].sort(
    (left, right) =>
      verificationRank[right.minimumVerificationLevel] -
      verificationRank[left.minimumVerificationLevel]
  );
  const satisfied: EvidenceRef[] = [];

  for (const requirement of sorted) {
    const candidate = [...unused.values()].find((entry) =>
      satisfies(entry, requirement)
    );

    if (!candidate) {
      return undefined;
    }

    unused.delete(candidate.id);
    satisfied.push(candidate);
  }

  return satisfied;
}

export function evaluateLearningTransition(
  context: AuthorityContext,
  request: LearningTransitionRequest
): LearningTransitionResult {
  const item = context.items.get(request.itemId);

  if (!item) {
    return {
      accepted: false,
      reason: "UNKNOWN_LEARNING_ITEM"
    };
  }

  if (request.learnerId !== context.learnerId) {
    return {
      accepted: false,
      reason: "LEARNER_MISMATCH"
    };
  }

  if (item.completion.mode !== "evidence") {
    return {
      accepted: false,
      reason: "UNSUPPORTED_COMPLETION_MODE"
    };
  }

  const selected: EvidenceRef[] = [];
  const selectedIds = new Set<string>();

  for (const ref of request.evidenceRefs ?? []) {
    if (selectedIds.has(ref)) continue;

    const evidence = context.verifiedEvidence.get(ref);

    if (!evidence) {
      return {
        accepted: false,
        reason: "EVIDENCE_NOT_VERIFIED"
      };
    }

    if (evidence.learnerId !== request.learnerId) {
      return {
        accepted: false,
        reason: "EVIDENCE_LEARNER_MISMATCH"
      };
    }

    if (evidence.itemId !== item.id) {
      return {
        accepted: false,
        reason: "EVIDENCE_ITEM_MISMATCH"
      };
    }

    selectedIds.add(ref);
    selected.push({
      id: evidence.id,
      kind: evidence.kind,
      verificationLevel: evidence.verificationLevel
    });
  }

  const candidateEvidence =
    request.evidenceRefs === undefined
      ? [...context.verifiedEvidence.values()]
          .filter(
            (evidence) =>
              evidence.learnerId === request.learnerId &&
              evidence.itemId === item.id
          )
          .map((evidence) => ({
            id: evidence.id,
            kind: evidence.kind,
            verificationLevel: evidence.verificationLevel
          }))
      : selected;

  const satisfied = satisfyRequirements(
    item.completion.requiredEvidence,
    candidateEvidence
  );

  if (!satisfied) {
    return {
      accepted: false,
      reason: "REQUIRED_EVIDENCE_MISSING"
    };
  }

  const verificationLevel = satisfied.reduce<VerificationLevel>(
    (highest, evidence) =>
      verificationRank[evidence.verificationLevel] >
      verificationRank[highest]
        ? evidence.verificationLevel
        : highest,
    "self-report"
  );

  return {
    accepted: true,
    itemId: item.id,
    learnerId: request.learnerId,
    satisfiedEvidence: satisfied.map((evidence) => evidence.id),
    verificationLevel
  };
}
