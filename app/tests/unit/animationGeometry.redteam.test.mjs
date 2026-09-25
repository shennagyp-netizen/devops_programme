import { describe, expect, it } from "vitest";
import { validateAnimationDefinition } from "../../src/animations/contracts.ts";

const baseDefinition = () => ({
  version: 1,
  id: "geometry-test",
  title: "Geometry Test",
  visual: {
    theme: "devops-dark-v1"
  },
  primitives: [
    {
      kind: "node",
      id: "a",
      label: "A",
      role: "service",
      x: 100,
      y: 200,
      width: 180,
      height: 90
    },
    {
      kind: "node",
      id: "b",
      label: "B",
      role: "database",
      x: 500,
      y: 200,
      width: 180,
      height: 90
    },
    {
      kind: "connection",
      id: "a-b",
      from: "a",
      to: "b"
    }
  ],
  states: [
    {
      id: "initial",
      status: "neutral",
      targetStatuses: [
        { targetId: "a", status: "neutral" },
        { targetId: "b", status: "neutral" }
      ]
    }
  ],
  events: [
    {
      id: "show",
      action: "connect",
      targetId: "a-b",
      targetStateId: "initial"
    }
  ],
  interactions: [],
  accessibility: {
    title: "Geometry test",
    description: "A geometry validation test.",
    reducedMotion: "supported"
  }
});

describe("animation geometry red team", () => {
  it("rejects overlapping nodes instead of allowing stacked shapes", () => {
    const definition = baseDefinition();
    definition.primitives[1].x = 220;

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("shape overlap");
  });

  it("rejects shapes that violate the minimum clearance", () => {
    const definition = baseDefinition();
    definition.primitives[1].x = 288;

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("shape clearance");
  });

  it("rejects overlapping authored label boxes", () => {
    const definition = baseDefinition();
    definition.primitives.push(
      {
        kind: "label",
        id: "label-a",
        text: "Request",
        x: 110,
        y: 120,
        width: 180,
        height: 40
      },
      {
        kind: "label",
        id: "label-b",
        text: "Response",
        x: 200,
        y: 130,
        width: 180,
        height: 40
      }
    );

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("shape overlap");
  });

  it("rejects labels that extend beyond the viewport", () => {
    const definition = baseDefinition();
    definition.primitives.push({
      kind: "label",
      id: "edge-label",
      text: "Edge",
      x: 1180,
      y: 640,
      width: 40,
      height: 40
    });

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("outside viewport");
  });

  it("rejects a packet route that passes through an unrelated node", () => {
    const definition = baseDefinition();
    definition.primitives.push({
      kind: "packet",
      id: "packet-through-b",
      from: "a",
      to: "b"
    });

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("packet crosses shape");
  });

  it("rejects a connection that crosses an unrelated node", () => {
    const definition = baseDefinition();
    definition.primitives.push({
      kind: "node",
      id: "blocker",
      label: "Blocker",
      role: "service",
      x: 300,
      y: 150,
      width: 120,
      height: 190
    });

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("connection crosses shape");
  });

  it("rejects connection crossings unless explicitly allowed", () => {
    const definition = baseDefinition();
    definition.primitives = [
      {
        kind: "node",
        id: "a",
        label: "A",
        role: "service",
        x: 100,
        y: 100,
        width: 180,
        height: 90
      },
      {
        kind: "node",
        id: "b",
        label: "B",
        role: "database",
        x: 500,
        y: 100,
        width: 180,
        height: 90
      },
      {
        kind: "node",
        id: "c",
        label: "C",
        role: "service",
        x: 100,
        y: 500,
        width: 180,
        height: 90
      },
      {
        kind: "node",
        id: "d",
        label: "D",
        role: "service",
        x: 500,
        y: 500,
        width: 180,
        height: 90
      },
      {
        kind: "connection",
        id: "a-d",
        from: "a",
        to: "d"
      },
      {
        kind: "connection",
        id: "c-b",
        from: "c",
        to: "b"
      }
    ];
    definition.events = [
      {
        id: "show",
        action: "connect",
        targetId: "a-d",
        targetStateId: "initial"
      }
    ];
    definition.states[0].targetStatuses = [
      { targetId: "a", status: "neutral" },
      { targetId: "b", status: "neutral" },
      { targetId: "c", status: "neutral" },
      { targetId: "d", status: "neutral" }
    ];

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("connection crossing");
  });

  it("permits an explicitly declared connection crossing exception", () => {
    const definition = baseDefinition();
    definition.primitives = [
      {
        kind: "node",
        id: "a",
        label: "A",
        role: "service",
        x: 100,
        y: 100,
        width: 180,
        height: 90
      },
      {
        kind: "node",
        id: "b",
        label: "B",
        role: "database",
        x: 500,
        y: 100,
        width: 180,
        height: 90
      },
      {
        kind: "node",
        id: "c",
        label: "C",
        role: "service",
        x: 100,
        y: 500,
        width: 180,
        height: 90
      },
      {
        kind: "node",
        id: "d",
        label: "D",
        role: "service",
        x: 500,
        y: 500,
        width: 180,
        height: 90
      },
      {
        kind: "connection",
        id: "a-d",
        from: "a",
        to: "d"
      },
      {
        kind: "connection",
        id: "c-b",
        from: "c",
        to: "b",
        allowCrossingWith: ["a-d"]
      }
    ];
    definition.events = [
      {
        id: "show",
        action: "connect",
        targetId: "a-d",
        targetStateId: "initial"
      }
    ];
    definition.states[0].targetStatuses = [
      { targetId: "a", status: "neutral" },
      { targetId: "b", status: "neutral" },
      { targetId: "c", status: "neutral" },
      { targetId: "d", status: "neutral" }
    ];

    const result = validateAnimationDefinition(definition);
    expect(result.failures.join(" ")).not.toContain("connection crossing");
  });

  it("rejects zero-area and NaN geometry before spatial checks", () => {
    const definition = baseDefinition();
    definition.primitives[0].width = 0;
    definition.primitives[1].height = Number.NaN;

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("width is invalid");
    expect(failures).toContain("height is invalid");
  });
});
