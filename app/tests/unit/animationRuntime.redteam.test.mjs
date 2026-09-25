import { describe, expect, it } from "vitest";
import {
  animationStateAt,
  animationTimelineAt,
  validateAnimationTimedCueSchedule
} from "../../src/animations/runtime.ts";

const definition = {
  version: 1,
  id: "runtime-red-team",
  title: "Runtime",
  visual: { theme: "devops-dark-v1" },
  primitives: [
    {
      kind: "node",
      id: "a",
      label: "A",
      role: "service",
      x: 100,
      y: 250,
      width: 180,
      height: 90
    }
  ],
  states: [
    {
      id: "initial",
      status: "neutral",
      targetStatuses: [{ targetId: "a", status: "neutral" }]
    }
  ],
  events: [
    {
      id: "activate",
      action: "set-status",
      targetId: "a",
      targetStateId: "initial"
    }
  ],
  interactions: [],
  accessibility: {
    title: "Runtime",
    description: "Runtime test.",
    reducedMotion: "supported"
  }
};

describe("animation runtime red team", () => {
  it("rejects malformed cue schedules", () => {
    expect(
      validateAnimationTimedCueSchedule([
        { voiceCueId: "", startMs: 0, eventIds: ["activate"] }
      ], definition).valid
    ).toBe(false);
  });

  it("rejects duplicate voice cue IDs", () => {
    const result = validateAnimationTimedCueSchedule(
      [
        { voiceCueId: "same", startMs: 0, eventIds: ["activate"] },
        { voiceCueId: "same", startMs: 100, eventIds: ["activate"] }
      ],
      definition
    );
    expect(result.failures.join(" ")).toContain("duplicate voice cue id");
  });

  it("rejects unknown event IDs", () => {
    const result = validateAnimationTimedCueSchedule(
      [{ voiceCueId: "x", startMs: 0, eventIds: ["missing"] }],
      definition
    );
    expect(result.failures.join(" ")).toContain("event id does not exist");
  });

  it("rejects negative or non-finite times", () => {
    const result = validateAnimationTimedCueSchedule(
      [
        { voiceCueId: "negative", startMs: -1, eventIds: ["activate"] },
        { voiceCueId: "nan", startMs: Number.NaN, eventIds: ["activate"] }
      ],
      definition
    );
    expect(result.failures.join(" ")).toContain("startMs");
  });

  it("clamps non-finite playback time instead of producing NaN state", () => {
    const snapshot = animationTimelineAt(definition, [], Number.NaN);
    expect(Number.isFinite(snapshot.timeMs)).toBe(true);
    expect(snapshot.timeMs).toBe(0);
  });

  it("never creates an unknown target in the runtime projection", () => {
    const snapshot = animationStateAt(definition, [], 1000);
    expect(snapshot.targets.missing).toBeUndefined();
  });
});
