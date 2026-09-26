import { describe, expect, it } from "vitest";
import { animationCuesForVoice, missingVoiceCueIds } from "../../src/data/lessonVoiceAnimation.ts";

const binding = { voiceCueBindings: [
  { voiceCueId: "cue.request", offsetMs: 40, eventIds: ["send"] },
  { voiceCueId: "cue.response", eventIds: ["receive"] }
] };
const manifest = { episodeId: "B1.2", scriptVersion: "exact-script", durationMs: 9000, segments: [{ id: "segment.request", turnId: "B1.2.T001", audioUrl: "/audio/b1-2-1.mp3", startMs: 0, endMs: 9000 }], turns: [{ turnId: "B1.2.T001", startMs: 0, endMs: 9000 }], cues: [
  { id: "cue.request", turnId: "B1.2.T001", kind: "transition", startMs: 1200 }
] };

describe("lesson voice-to-animation synchronization", () => {
  it("uses authored audio timings and curriculum event mappings without estimating speech", () => {
    expect(animationCuesForVoice(binding, manifest)).toEqual([
      { voiceCueId: "cue.request", startMs: 1200, offsetMs: 40, endMs: undefined, eventIds: ["send"] }
    ]);
  });

  it("fails closed for unavailable audio or an unmapped authored cue", () => {
    expect(animationCuesForVoice(binding, undefined)).toEqual([]);
    expect(missingVoiceCueIds(binding, manifest)).toEqual(["cue.response"]);
  });
});
