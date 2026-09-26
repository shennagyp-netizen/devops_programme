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
  cognitiveLevel: 1,
  cognitiveLevelId: "foundation",
  label: "Foundation",
  description: "Simple mental model and purpose.",
  scriptUrl: "/podcasts/beginner/B1.2.cognitive-1.txt",
  scriptVersion: "exact-script"
};

describe("TTS voice-to-animation synchronization", () => {
  it("does not invent millisecond timing for a TTS speech", () => {
    expect(animationCuesForVoice(binding, speech)).toEqual([]);
  });

  it("fails closed until runtime TTS events are connected to an authored animation binding", () => {
    expect(animationCuesForVoice(binding, undefined)).toEqual([]);
    expect(missingVoiceCueIds(binding, undefined)).toEqual([
      "cue.request",
      "cue.response"
    ]);
    expect(missingVoiceCueIds(binding, speech)).toEqual([]);
  });
});
