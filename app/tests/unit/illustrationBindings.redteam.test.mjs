import { describe, expect, it } from "vitest";
import { validateCurriculumIllustrationBinding } from "../../src/data/illustrationBindings.ts";

const validInteractiveBinding = () => ({
  version: 1,
  id: "B1.2:http-flow",
  lessonId: "B1.2",
  contentBlockId: "http-flow",
  contentIndex: 2,
  presentation: "animated",
  visualCapabilityId: "animation",
  animationId: "http-request",
  voiceCueBindings: [
    { voiceCueId: "request-start", eventIds: ["send-request"] }
  ],
  interactionMode: "sequential",
  interactionSteps: [
    {
      id: "step-1",
      order: 1,
      interactionId: "select-client",
      prompt: "Select the client.",
      successEventIds: ["send-request"]
    },
    {
      id: "step-2",
      order: 2,
      interactionId: "select-service",
      prompt: "Select the service.",
      successEventIds: ["receive-request"]
    }
  ],
  completion: {
    requiredStepIds: ["step-1", "step-2"]
  }
});

const block = {
  id: "http-flow",
  type: "illustration",
  heading: "Request flow",
  alt: "Request flow",
  bindingId: "B1.2:http-flow",
  nodes: ["Client", "Service"]
};

const context = {
  animationDefinitions: [
    {
      id: "http-request",
      events: [
        { id: "send-request" },
        { id: "receive-request" }
      ],
      interactions: [
        { id: "select-client" },
        { id: "select-service" }
      ]
    }
  ],
  voiceCueIds: new Set(["request-start"]),
  expectedLessonId: "B1.2",
  expectedContentIndex: 2
};

describe("curriculum illustration binding red team", () => {
  it.each([
    ["wrong lesson", { lessonId: "B1.9" }, "lessonId"],
    ["wrong content block", { contentBlockId: "other" }, "contentBlockId"],
    ["negative content index", { contentIndex: -1 }, "contentIndex"],
    ["unknown animation", { animationId: "missing" }, "animationId"],
    ["unknown voice cue", {
      voiceCueBindings: [{ voiceCueId: "missing", eventIds: ["send-request"] }]
    }, "voice cue"],
    ["unknown animation event", {
      voiceCueBindings: [{ voiceCueId: "request-start", eventIds: ["missing-event"] }]
    }, "event id"],
    ["duplicate interaction order", {
      interactionSteps: [
        { id: "step-1", order: 1, interactionId: "select-client", prompt: "x", successEventIds: ["send-request"] },
        { id: "step-2", order: 1, interactionId: "select-service", prompt: "y", successEventIds: ["receive-request"] }
      ]
    }, "interaction step order"],
    ["gap in interaction order", {
      interactionSteps: [
        { id: "step-1", order: 1, interactionId: "select-client", prompt: "x", successEventIds: ["send-request"] },
        { id: "step-2", order: 3, interactionId: "select-service", prompt: "y", successEventIds: ["receive-request"] }
      ]
    }, "interaction step order"],
    ["missing required completion step", {
      completion: { requiredStepIds: ["step-1", "missing-step"] }
    }, "completion"],
    ["silent fallback", {
      presentation: "animated",
      animationId: undefined
    }, "animationId"]
  ])("rejects %s", (_name, patch, expected) => {
    const result = validateCurriculumIllustrationBinding(
      { ...validInteractiveBinding(), ...patch },
      block,
      context
    );
    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain(expected);
  });

  it("rejects interactive bindings with no steps", () => {
    const result = validateCurriculumIllustrationBinding(
      { ...validInteractiveBinding(), interactionSteps: [], completion: { requiredStepIds: [] } },
      block,
      context
    );
    expect(result.valid).toBe(false);
  });

  it("rejects unordered steps when sequential mode is declared", () => {
    const result = validateCurriculumIllustrationBinding(
      {
        ...validInteractiveBinding(),
        interactionSteps: [
          { id: "step-2", order: 2, interactionId: "select-service", prompt: "y", successEventIds: ["receive-request"] },
          { id: "step-1", order: 1, interactionId: "select-client", prompt: "x", successEventIds: ["send-request"] }
        ]
      },
      block,
      context
    );
    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain("declared order");
  });
});
