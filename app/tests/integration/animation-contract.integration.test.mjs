import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  validateAnimationDefinition,
  validateAnimationLessonBinding
} from "../../src/animations/contracts.ts";

const source = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("animation architecture integration contract", () => {
  it("keeps animation contracts independent from course definitions", () => {
    const contract = source("src/animations/contracts.ts");
    expect(contract).not.toContain("courseLessons");
    expect(contract).not.toContain("curriculum.ts");
    expect(contract).not.toContain("LessonPanel");
    expect(contract).not.toContain("PodcastCoach");
  });

  it("does not permit a visual implementation to own audio", () => {
    const contract = source("src/animations/contracts.ts");
    expect(contract).not.toContain("AudioContext");
    expect(contract).not.toContain("HTMLAudioElement");
    expect(contract).not.toContain("new Audio");
    expect(contract).not.toContain("setInterval");
    expect(contract).not.toContain("setTimeout");
  });

  it("requires the lesson binding, not the reusable animation, to name voice cues", () => {
    const contract = source("src/animations/contracts.ts");
    expect(contract).toContain("AnimationLessonBindingV1");
    expect(contract).toContain("voiceCueId");
  });

  it("accepts deterministic binding data without making the animation stateful", () => {
    const definition = {
      version: 1,
      id: "http-request",
      title: "HTTP Request",
      visual: { theme: "devops-dark-v1" },
      primitives: [
        { kind: "node", id: "client", label: "Client", role: "client", x: 50, y: 250, width: 180, height: 90 }
      ],
      states: [
        { id: "initial", status: "neutral", targetStatuses: [{ targetId: "client", status: "neutral" }] }
      ],
      events: [
        { id: "show-request", action: "activate", targetId: "client", targetStateId: "initial" }
      ],
      interactions: [],
      accessibility: {
        title: "HTTP request",
        description: "Client sends a request.",
        reducedMotion: "supported"
      }
    };

    const binding = {
      version: 1,
      animationId: "http-request",
      cueBindings: [{ voiceCueId: "request-sent", eventIds: ["show-request"] }]
    };

    expect(validateAnimationDefinition(definition)).toEqual({ valid: true, failures: [] });
    expect(validateAnimationLessonBinding(binding, definition)).toEqual({
      valid: true,
      failures: []
    });
  });
});
