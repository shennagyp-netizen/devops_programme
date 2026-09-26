import type {
  AuthorityContext,
  EvidenceRef,
  LearningTransitionRequest,
  LearningTransitionResult
} from "./contracts";

export type { AuthorityContext };

function hasRequiredEvidence(
  requiredKinds: string[],
  evidence: EvidenceRef[]
) {
  const satisfied = new Set(evidence.map((item) => item.kind));
  return requiredKinds.every((kind) => satisfied.has(kind));
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
      kind: evidence.kind
    });
  }

  if (!hasRequiredEvidence(item.completion.requiredEvidence, selected)) {
    return {
      accepted: false,
      reason: "REQUIRED_EVIDENCE_MISSING"
    };
  }

  return {
    accepted: true,
    itemId: item.id,
    learnerId: request.learnerId,
    satisfiedEvidence: selected.map((evidence) => evidence.id)
  };
}
