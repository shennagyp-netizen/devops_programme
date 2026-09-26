import { describe, expect, it } from "vitest";
import {
  evaluateLearningTransition,
  type AuthorityContext
} from "../../src/framework/authority.ts";

const context = {
  learnerId: "user_1",
  items: new Map([
    [
      "B1.2",
      {
        id: "B1.2",
        programmeId: "devops",
        kind: "lesson",
        completion: {
          mode: "evidence",
          requiredEvidence: ["runtime-b1-2"]
        }
      }
    ]
  ]),
  verifiedEvidence: new Map()
};

describe("v3 learning authority", () => {
  it("does not trust client completion assertions", () => {
    const result = evaluateLearningTransition(context, {
      learnerId: "user_1",
      itemId: "B1.2",
      clientAssertions: {
        completed: true,
        verificationLevel: "machine-verified"
      },
      evidenceRefs: []
    });

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("REQUIRED_EVIDENCE_MISSING");
  });

  it("requires server-verifiable evidence owned by the same learner", () => {
    const result = evaluateLearningTransition(
      {
        ...context,
        verifiedEvidence: new Map([
          [
            "evidence-1",
            {
              id: "evidence-1",
              learnerId: "user_2",
              itemId: "B1.2",
              kind: "runtime-b1-2",
              verifierId: "local-agent-v1",
              verificationRef: "attestation:1",
              verifiedAt: "2026-09-26T10:00:00.000Z"
            }
          ]
        ])
      },
      {
        learnerId: "user_1",
        itemId: "B1.2",
        evidenceRefs: ["evidence-1"]
      }
    );

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("EVIDENCE_LEARNER_MISMATCH");
  });

  it("accepts a transition only when authoritative evidence satisfies the item policy", () => {
    const result = evaluateLearningTransition(
      {
        ...context,
        verifiedEvidence: new Map([
          [
            "evidence-1",
            {
              id: "evidence-1",
              learnerId: "user_1",
              itemId: "B1.2",
              kind: "runtime-b1-2",
              verifierId: "local-agent-v1",
              verificationRef: "attestation:1",
              verifiedAt: "2026-09-26T10:00:00.000Z"
            }
          ]
        ])
      },
      {
        learnerId: "user_1",
        itemId: "B1.2",
        evidenceRefs: ["evidence-1"]
      }
    );

    expect(result).toEqual({
      accepted: true,
      itemId: "B1.2",
      learnerId: "user_1",
      satisfiedEvidence: ["evidence-1"]
    });
  });

  it("rejects cross-item evidence even when it is otherwise verified", () => {
    const result = evaluateLearningTransition(
      {
        ...context,
        verifiedEvidence: new Map([
          [
            "evidence-1",
            {
              id: "evidence-1",
              learnerId: "user_1",
              itemId: "B1.3",
              kind: "runtime-b1-2",
              verifierId: "local-agent-v1",
              verificationRef: "attestation:1",
              verifiedAt: "2026-09-26T10:00:00.000Z"
            }
          ]
        ])
      },
      {
        learnerId: "user_1",
        itemId: "B1.2",
        evidenceRefs: ["evidence-1"]
      }
    );

    expect(result.accepted).toBe(false);
    expect(result.reason).toBe("EVIDENCE_ITEM_MISMATCH");
  });
});
