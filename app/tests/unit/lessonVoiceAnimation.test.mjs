import { describe, expect, it } from "vitest";
import {
  animationCuesForVoice,
  missingVoiceCueIds
} from "../../src/data/lessonVoiceAnimation.ts";

const binding = {
  voiceCueBindings: [
    { voiceCueId: "cue.request", offsetMs: 40, eventIds: ["send"] },
    { voiceCueId: "cue.response", eventIds: ["receive"] }
  ]
};

const speech = {
  episodeId: "B1.2",
  explanationLevel: 1,
  explanationLevelId: "very-simple",
  label: "Very simple",
  description: "The complete lesson information, explained with very explicit everyday language.",
  scriptVersion: "exact-script"
};

describe("TTS voice-to-animation synchronization", () => {
  it("does not invent millisecond timing for a TTS speech", () => {
    expect(animationCuesForVoice(binding, speech)).toEqual([]);
  });

  it("fails closed until runtime TTS events are connected to authored animation boundaries", () => {
    expect(missingVoiceCueIds(binding, speech)).toEqual([
      "cue.request",
      "cue.response"
    ]);
  });
});
