import { describe, expect, it } from "vitest";
import { validateAnimationDefinition, validateAnimationLessonBinding } from "../../src/animations/contracts.ts";

const minimalDefinition = () => ({
  version: 1,
  id: "dns-resolution",
  title: "DNS Resolution",
  visual: {
    theme: "devops-dark-v1"
  },
  primitives: [
    {
      kind: "node",
      id: "client",
      label: "Client",
      role: "client",
      x: 0,
      y: 0,
      width: 100,
      height: 80
    }
  ],
  states: [
    {
      id: "healthy",
      status: "healthy",
      targetStatuses: [{ targetId: "client", status: "healthy" }]
    }
  ],
  events: [
    {
      id: "activate",
      action: "activate",
      targetId: "client",
      targetStateId: "healthy"
    }
  ],
  interactions: [],
  accessibility: {
    title: "DNS resolution",
    description: "A client resolves a name.",
    reducedMotion: "supported"
  }
});

describe("animation contract red team", () => {
  it.each([
    ["null definition", null],
    ["string definition", "not-an-object"],
    ["wrong version", { ...minimalDefinition(), version: 99 }],
    ["empty id", { ...minimalDefinition(), id: " " }],
    ["empty title", { ...minimalDefinition(), title: "" }]
  ])("rejects %s", (_name, value) => {
    expect(validateAnimationDefinition(value).valid).toBe(false);
  });

  it("rejects duplicate primitive ids", () => {
    const definition = minimalDefinition();
    definition.primitives.push({ ...definition.primitives[0] });
    expect(validateAnimationDefinition(definition).failures.join(" ")).toContain(
      "duplicate primitive id"
    );
  });

  it("rejects primitives outside the fixed viewport", () => {
    const definition = minimalDefinition();
    definition.primitives[0].x = 1200;
    expect(validateAnimationDefinition(definition).failures.join(" ")).toContain(
      "outside viewport"
    );
  });

  it("rejects duplicate event ids and unknown event targets", () => {
    const definition = minimalDefinition();
    definition.events.push({
      ...definition.events[0],
      id: "activate"
    });
    definition.events.push({
      id: "bad-target",
      action: "activate",
      targetId: "missing",
      targetStateId: "healthy"
    });

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("duplicate event id");
    expect(failures).toContain("event target does not exist");
  });

  it("rejects unsafe or out-of-range motion customization", () => {
    const definition = minimalDefinition();
    definition.visual.customization = {
      motion: {
        travelMs: 1,
        emphasisMs: 5000,
        settleMs: -20,
        easing: "unknown"
      }
    };

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("travelMs");
    expect(failures).toContain("emphasisMs");
    expect(failures).toContain("settleMs");
    expect(failures).toContain("easing");
  });

  it("rejects raw colors and unknown customization fields", () => {
    const definition = minimalDefinition();
    definition.visual.customization = {
      accent: "#ff0000",
      unexpected: "escape"
    };

    const failures = validateAnimationDefinition(definition).failures.join(" ");
    expect(failures).toContain("accent");
    expect(failures).toContain("unknown visual customization field");
  });

  it("rejects duplicate voice cue ids, unknown event ids, and negative offsets", () => {
    const binding = {
      version: 1,
      animationId: "dns-resolution",
      cueBindings: [
        { voiceCueId: "same", eventIds: ["activate"] },
        { voiceCueId: "same", offsetMs: -1, eventIds: ["missing"] }
      ]
    };

    const failures = validateAnimationLessonBinding(binding, minimalDefinition())
      .failures.join(" ");

    expect(failures).toContain("duplicate voice cue id");
    expect(failures).toContain("offsetMs");
    expect(failures).toContain("event id does not exist");
  });

  it("rejects a binding for a different animation", () => {
    const result = validateAnimationLessonBinding(
      {
        version: 1,
        animationId: "http-request",
        cueBindings: []
      },
      minimalDefinition()
    );

    expect(result.failures.join(" ")).toContain("animation id does not match");
  });
});
