import { describe, expect, it } from "vitest";
import {
  animationStateAt,
  animationTimelineAt
} from "../../src/animations/runtime.ts";

const definition = {
  version: 1,
  id: "http-request",
  title: "HTTP Request",
  visual: { theme: "devops-dark-v1" },
  primitives: [
    {
      kind: "node",
      id: "client",
      label: "Browser",
      role: "client",
      x: 80,
      y: 250,
      width: 180,
      height: 90
    },
    {
      kind: "node",
      id: "api",
      label: "API",
      role: "service",
      x: 500,
      y: 250,
      width: 180,
      height: 90
    },
    {
      kind: "packet",
      id: "request",
      label: "GET /",
      from: "client",
      to: "api"
    }
  ],
  states: [
    {
      id: "initial",
      status: "neutral",
      targetStatuses: [
        { targetId: "client", status: "neutral" },
        { targetId: "api", status: "neutral" }
      ]
    },
    {
      id: "api-active",
      status: "active",
      targetStatuses: [
        { targetId: "api", status: "active" }
      ]
    }
  ],
  events: [
    {
      id: "send-request",
      action: "send",
      targetId: "request",
      targetStateId: "initial"
    },
    {
      id: "activate-api",
      action: "set-status",
      targetId: "api",
      targetStateId: "api-active"
    }
  ],
  interactions: [],
  accessibility: {
    title: "HTTP request",
    description: "A browser sends a request to an API.",
    reducedMotion: "supported"
  }
};

const cues = [
  {
    voiceCueId: "request",
    startMs: 1000,
    eventIds: ["send-request"]
  },
  {
    voiceCueId: "api-response",
    startMs: 2500,
    offsetMs: 100,
    eventIds: ["activate-api"]
  }
];

describe("animation runtime", () => {
  it("returns a deterministic initial projection", () => {
    expect(animationStateAt(definition, cues, 0)).toEqual(
      animationStateAt(definition, cues, 0)
    );
  });

  it("activates semantic state at the voice cue plus offset", () => {
    expect(animationStateAt(definition, cues, 2599).targets.api?.status).toBe("neutral");
    expect(animationStateAt(definition, cues, 2600).targets.api?.status).toBe("active");
  });

  it("projects an in-flight packet from the actual voice time", () => {
    const snapshot = animationTimelineAt(definition, cues, 1300);
    expect(snapshot.packets.request).toMatchObject({
      phase: "traveling",
      progress: expect.closeTo(0.5, 4)
    });
  });

  it("marks a completed packet after its contract motion duration", () => {
    const snapshot = animationTimelineAt(definition, cues, 1705);
    expect(snapshot.packets.request.phase).toBe("complete");
    expect(snapshot.packets.request.progress).toBe(1);
  });

  it("reconstructs the same state after direct seek", () => {
    const direct = animationTimelineAt(definition, cues, 1300);
    const replayed = animationTimelineAt(definition, cues, 1000);
    const sought = animationTimelineAt(definition, cues, 1300);

    expect(sought).toEqual(direct);
    expect(replayed).not.toEqual(direct);
  });

  it("clamps before-start and after-end time safely", () => {
    expect(animationTimelineAt(definition, cues, -100).packets.request.progress).toBe(0);
    expect(animationTimelineAt(definition, cues, Number.POSITIVE_INFINITY).packets.request.progress).toBe(1);
  });

  it("does not mutate the definition or cue schedule", () => {
    const beforeDefinition = JSON.stringify(definition);
    const beforeCues = JSON.stringify(cues);
    animationTimelineAt(definition, cues, 1300);
    expect(JSON.stringify(definition)).toBe(beforeDefinition);
    expect(JSON.stringify(cues)).toBe(beforeCues);
  });
});
