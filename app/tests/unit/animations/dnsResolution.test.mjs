import { describe, expect, it } from "vitest";
import { validateAnimationDefinition } from "../../../src/animations/contracts.ts";
import { dnsResolutionAnimation } from "../../../src/animations/scenarios/dnsResolution.ts";
import {
  validateCurriculumIllustrationBinding
} from "../../../src/data/illustrationBindings.ts";
import { curriculumIllustrationBindings } from "../../../src/data/curriculumIllustrationBindings.ts";

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

  it("validates the authored D2.2 curriculum binding against the animation", () => {
    const binding = curriculumIllustrationBindings.find(
      (candidate) => candidate.id === "D2.2:d2-2-dns"
    );
    expect(binding).toBeDefined();

    const result = validateCurriculumIllustrationBinding(
      binding,
      {
        id: "d2-2-dns",
        type: "interactive-illustration",
        bindingId: "D2.2:d2-2-dns"
      },
      {
        animationDefinitions: [dnsResolutionAnimation],
        expectedLessonId: "D2.2",
        expectedContentIndex: 1
      }
    );

    expect(result.valid).toBe(true);
    expect(result.failures).toEqual([]);
  });
});
