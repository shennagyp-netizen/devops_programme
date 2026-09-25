import { describe, expect, it } from "vitest";
import {
  DEFAULT_ANIMATION_CUSTOMIZATION,
  resolveAnimationCustomization,
  validateAnimationDefinition,
  validateAnimationLessonBinding
} from "../../src/animations/contracts.ts";

const baseDefinition = () => ({
  version: 1,
  id: "load-balancing",
  title: "Load Balancing",
  visual: {
    theme: "devops-dark-v1",
    customization: {
      accent: "cyan",
      density: "compact",
      emphasis: "strong",
      nodeVariant: "technical",
      motion: {
        travelMs: 720,
        emphasisMs: 260,
        settleMs: 420,
        easing: "standard"
      }
    }
  },
  primitives: [
    {
      kind: "node",
      id: "client",
      label: "Browser",
      role: "client",
      x: 80,
      y: 220,
      width: 180,
      height: 90
    },
    {
      kind: "node",
      id: "lb",
      label: "Load Balancer",
      role: "gateway",
      x: 420,
      y: 220,
      width: 220,
      height: 90
    },
    {
      kind: "node",
      id: "api-1",
      label: "API 1",
      role: "service",
      x: 820,
      y: 150,
      width: 180,
      height: 90
    },
    {
      kind: "node",
      id: "api-2",
      label: "API 2",
      role: "service",
      x: 820,
      y: 320,
      width: 180,
      height: 90
    },
    {
      kind: "connection",
      id: "client-lb",
      from: "client",
      to: "lb"
    },
    {
      kind: "connection",
      id: "lb-api-1",
      from: "lb",
      to: "api-1"
    },
    {
      kind: "connection",
      id: "lb-api-2",
      from: "lb",
      to: "api-2"
    }
  ],
  states: [
    {
      id: "healthy",
      status: "healthy",
      targetStatuses: [
        { targetId: "client", status: "healthy" },
        { targetId: "lb", status: "healthy" },
        { targetId: "api-1", status: "healthy" },
        { targetId: "api-2", status: "healthy" }
      ]
    },
    {
      id: "api-2-failed",
      status: "failure",
      targetStatuses: [
        { targetId: "api-2", status: "failure" }
      ]
    }
  ],
  events: [
    {
      id: "send-request",
      action: "send",
      targetId: "client",
      targetStateId: "healthy"
    },
    {
      id: "fail-api-2",
      action: "set-status",
      targetId: "api-2",
      targetStateId: "api-2-failed"
    }
  ],
  interactions: [
    {
      id: "kill-api-2",
      action: "click",
      targetId: "api-2",
      eventIds: ["fail-api-2"]
    }
  ],
  accessibility: {
    title: "Load balancing request flow",
    description: "A browser sends a request through a load balancer to one of two API servers.",
    reducedMotion: "supported"
  }
});

describe("animation contract v1", () => {
  it("accepts a valid animation with per-animation visual and motion customization", () => {
    expect(validateAnimationDefinition(baseDefinition())).toEqual({
      valid: true,
      failures: []
    });
  });

  it("keeps global defaults immutable while resolving per-animation customization", () => {
    const resolved = resolveAnimationCustomization({
      accent: "cyan",
      density: "compact",
      motion: { travelMs: 720 }
    });

    expect(resolved).toEqual({
      ...DEFAULT_ANIMATION_CUSTOMIZATION,
      accent: "cyan",
      density: "compact",
      motion: {
        ...DEFAULT_ANIMATION_CUSTOMIZATION.motion,
        travelMs: 720
      }
    });
    expect(DEFAULT_ANIMATION_CUSTOMIZATION.accent).toBe("indigo");
    expect(DEFAULT_ANIMATION_CUSTOMIZATION.motion.travelMs).not.toBe(720);
  });

  it("accepts a course-independent lesson binding to voice cues", () => {
    const binding = {
      version: 1,
      animationId: "load-balancing",
      cueBindings: [
        {
          voiceCueId: "request-routing",
          eventIds: ["send-request"]
        },
        {
          voiceCueId: "failure",
          offsetMs: 250,
          eventIds: ["fail-api-2"]
        }
      ],
      learnerCheckpoints: ["failure-prediction"]
    };

    expect(
      validateAnimationLessonBinding(binding, baseDefinition())
    ).toEqual({
      valid: true,
      failures: []
    });
  });
});
