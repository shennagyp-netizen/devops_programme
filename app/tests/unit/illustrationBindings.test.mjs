import { describe, expect, it } from "vitest";
import {
  buildDefaultIllustrationBinding,
  validateCurriculumIllustrationBinding
} from "../../src/data/illustrationBindings.ts";

const staticBlock = {
  id: "b1-1-mechanism",
  type: "illustration",
  heading: "Request path",
  alt: "A request path from client to service",
  bindingId: "B1.1:b1-1-mechanism",
  nodes: ["Client", "Service"]
};

const animationDefinition = {
  id: "http-request",
  events: [
    { id: "send-request", action: "send", targetId: "client", targetStateId: "healthy" },
    { id: "receive-request", action: "receive", targetId: "service", targetStateId: "healthy" }
  ],
  interactions: [
    { id: "select-client", action: "select", targetId: "client", eventIds: ["send-request"] }
  ]
};

describe("curriculum illustration binding v1", () => {
  it("binds one exact content block to one reusable visual capability", () => {
    const binding = buildDefaultIllustrationBinding(
      "B1.1",
      staticBlock,
      1
    );

    expect(validateCurriculumIllustrationBinding(binding, staticBlock, {
      animationDefinitions: []
    })).toEqual({
      valid: true,
      failures: []
    });

    expect(binding).toMatchObject({
      version: 1,
      id: "B1.1:b1-1-mechanism",
      lessonId: "B1.1",
      contentBlockId: "b1-1-mechanism",
      contentIndex: 1,
      visualKind: "static",
      visualCapabilityId: "semantic-flow-v1",
      voiceCueBindings: [],
      interactionSteps: []
    });
  });

  it("requires the binding identity to match the exact lesson content position", () => {
    const binding = buildDefaultIllustrationBinding("B1.1", staticBlock, 1);

    binding.contentIndex = 2;

    const result = validateCurriculumIllustrationBinding(binding, staticBlock, {
      animationDefinitions: []
    });

    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain("contentIndex");
  });

  it("requires the referenced animation and event capabilities to exist", () => {
    const binding = {
      version: 1,
      id: "B1.2:http-flow",
      lessonId: "B1.2",
      contentBlockId: "http-flow",
      contentIndex: 1,
      visualKind: "animated",
      visualCapabilityId: "animation",
      animationId: "http-request",
      voiceCueBindings: [
        { voiceCueId: "request-start", eventIds: ["send-request"] },
        { voiceCueId: "request-arrives", eventIds: ["receive-request"] }
      ],
      interactionMode: "sequential",
      interactionSteps: [
        {
          id: "step-1",
          order: 1,
          interactionId: "select-client",
          prompt: "Select the client.",
          successEventIds: ["send-request"]
        }
      ],
      completion: {
        requiredStepIds: ["step-1"]
      }
    };

    const result = validateCurriculumIllustrationBinding(
      binding,
      {
        ...staticBlock,
        id: "http-flow",
        bindingId: "B1.2:http-flow"
      },
      {
        animationDefinitions: [animationDefinition],
        voiceCueIds: new Set(["request-start", "request-arrives"])
      }
    );

    expect(result).toEqual({ valid: true, failures: [] });
  });
});
