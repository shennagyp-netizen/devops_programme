import { describe, expect, it } from "vitest";
import { validateAnimationDefinition, validateAnimationLessonBinding } from "../../src/animations/contracts.ts";
import { dnsResolutionAnimation } from "../../src/animations/scenarios/dnsResolution.ts";

describe("DNS resolution animation", () => {
  it("satisfies the canonical animation contract", () => {
    const result = validateAnimationDefinition(dnsResolutionAnimation);
    expect(result.valid).toBe(true);
    expect(result.failures).toEqual([]);
  });

  it("contains the resolver chain without hidden routing paths", () => {
    const ids = new Set(dnsResolutionAnimation.primitives.map((primitive) => primitive.id));
    expect(ids).toEqual(new Set([
      "client", "resolver", "root", "tld", "authoritative",
      "client-resolver", "resolver-root", "root-tld", "tld-authoritative"
    ]));
  });

  it("allows a curriculum binding without inventing voice timing", () => {
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
      interactionSteps: [{ id: "query", order: 1, interactionId: "query", prompt: "Start the DNS query.", successEventIds: ["query"] }],
      completion: { requiredStepIds: ["query"] }
    };
    const result = validateAnimationLessonBinding(binding, dnsResolutionAnimation);
    expect(result.valid).toBe(true);
  });
});
