import { describe, expect, it } from "vitest";
import {
  validateAnimationDefinition,
  validateAnimationLessonBinding
} from "../../src/animations/contracts.ts";
import { dnsResolutionAnimation } from "../../src/animations/scenarios/dnsResolution.ts";

describe("DNS resolution animation", () => {
  it("satisfies the canonical animation contract", () => {
    const result = validateAnimationDefinition(dnsResolutionAnimation);
    expect(result.valid).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it("contains query, resolver hierarchy, authoritative answer, and response", () => {
    const ids = new Set(
      dnsResolutionAnimation.primitives.map((primitive) => primitive.id)
    );

    expect(ids).toEqual(
      new Set([
        "client",
        "resolver",
        "root",
        "tld",
        "authoritative",
        "answer",
        "client-resolver",
        "resolver-root",
        "root-tld",
        "tld-authoritative",
        "authoritative-answer",
        "query-packet",
        "response-packet"
      ])
    );
  });

  it("defines idle, query-flow, and resolution-complete states", () => {
    expect(dnsResolutionAnimation.states.map((state) => state.id)).toEqual([
      "idle",
      "query-flow",
      "resolution-complete"
    ]);
  });

  it("supports the full sequential curriculum binding without voice timing", () => {
    const binding = {
      version: 1,
      id: "D2.2:d2-2-dns",
      lessonId: "D2.2",
      contentBlockId: "d2-2-dns",
      contentIndex: 1,
      presentation: "animated",
      visualCapabilityId: "animation-stage-v1",
      animationId: "dns-resolution",
      voiceCueBindings: [],
      interactionMode: "sequential",
      interactionSteps: [
        { id: "query", order: 1, interactionId: "query", prompt: "Start with the client.", successEventIds: ["query"] },
        { id: "resolver", order: 2, interactionId: "resolver", prompt: "Show the recursive resolver.", successEventIds: ["resolver"] },
        { id: "root", order: 3, interactionId: "root", prompt: "Show the root server.", successEventIds: ["root"] },
        { id: "tld", order: 4, interactionId: "tld", prompt: "Show the TLD server.", successEventIds: ["tld"] },
        { id: "authoritative", order: 5, interactionId: "authoritative", prompt: "Show the authoritative server.", successEventIds: ["authoritative"] },
        { id: "answer", order: 6, interactionId: "answer", prompt: "Show the answer returning.", successEventIds: ["answer"] }
      ],
      completion: {
        requiredStepIds: ["query", "resolver", "root", "tld", "authoritative", "answer"]
      }
    };

    const result = validateAnimationLessonBinding(
      binding,
      dnsResolutionAnimation
    );

    expect(result.valid).toBe(true);
    expect(result.failures).toEqual([]);
  });
});
