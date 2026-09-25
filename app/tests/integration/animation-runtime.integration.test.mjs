import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { animationTimelineAt } from "../../src/animations/runtime.ts";

const source = (path) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("animation runtime integration contract", () => {
  it("has no audio ownership or timer-based instructional clock", () => {
    const runtime = source("src/animations/runtime.ts");
    expect(runtime).not.toContain("AudioContext");
    expect(runtime).not.toContain("new Audio");
    expect(runtime).not.toContain("setInterval");
    expect(runtime).not.toContain("setTimeout");
  });

  it("has no React or course dependency", () => {
    const runtime = source("src/animations/runtime.ts");
    expect(runtime).not.toContain("react");
    expect(runtime).not.toContain("courseLessons");
    expect(runtime).not.toContain("LessonPanel");
    expect(runtime).not.toContain("PodcastCoach");
  });

  it("returns a complete deterministic projection for a direct seek", () => {
    const definition = {
      version: 1,
      id: "seek-proof",
      title: "Seek Proof",
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
        title: "Seek proof",
        description: "A deterministic state.",
        reducedMotion: "supported"
      }
    };

    const first = animationTimelineAt(definition, [
      { voiceCueId: "cue", startMs: 1000, eventIds: ["activate"] }
    ], 5000);

    const second = animationTimelineAt(definition, [
      { voiceCueId: "cue", startMs: 1000, eventIds: ["activate"] }
    ], 5000);

    expect(second).toEqual(first);
  });
});
