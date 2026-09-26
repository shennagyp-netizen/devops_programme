import { expect, it, describe } from "vitest";
import { buildPodcastTtsBundle, isValidPodcastTtsBundle } from "../../src/data/podcastSync.ts";

const speech = (level, overrides = {}) => ({
  episodeId: "B1.4",
  explanationLevel: level,
  explanationLevelId: ["", "very-simple", "simple-technical", "professional", "expert"][level],
  label: ["", "Very simple", "Simple technical", "Professional", "Expert"][level],
  description: ["", "The complete lesson information, explained with very explicit everyday language.", "The complete lesson information, explained with simple technical language.", "The complete lesson information, explained in normal professional technical language.", "The complete lesson information, explained compactly for a highly experienced engineer."][level],
  scriptVersion: `sha-${level}`,
  ...overrides
});

const bundle = (overrides = {}) => ({
  episodeId: "B1.4",
  speeches: [speech(1), speech(2), speech(3), speech(4)],
  ...overrides
});

describe("TTS explanation-level red-team contract", () => {
  it.each([
    ["wrong count", { speeches: [speech(1), speech(2), speech(3)] }],
    ["duplicate level", { speeches: [speech(1), speech(1), speech(3), speech(4)] }],
    ["wrong level identity", { speeches: [speech(1), speech(2, { explanationLevelId: "very-simple" }), speech(3), speech(4)] }],
    ["wrong label", { speeches: [speech(1), speech(2, { label: "Very simple" }), speech(3), speech(4)] }],
    ["empty version", { speeches: [speech(1, { scriptVersion: "" }), speech(2), speech(3), speech(4)] }],
    ["wrong episode", { speeches: [speech(1, { episodeId: "B1.9" }), speech(2), speech(3), speech(4)] }]
  ])("rejects %s", (_name, override) => {
    expect(isValidPodcastTtsBundle({ ...bundle(), ...override }, "B1.4")).toBe(false);
  });

  it("accepts the canonical four-level bundle", () => {
    expect(isValidPodcastTtsBundle(bundle(), "B1.4")).toBe(true);
  });

  it("fails closed when one explanation version is missing", () => {
    expect(buildPodcastTtsBundle("B1.4", { "1": "sha-1", "2": "sha-2", "4": "sha-4" })).toBeUndefined();
  });

  it("does not allow a fifth explanation level", () => {
    expect(isValidPodcastTtsBundle({ ...bundle(), speeches: [speech(1), speech(2), speech(3), speech(4), speech(4)] }, "B1.4")).toBe(false);
  });

  it("rejects any attempt to attach recording assets to a TTS speech", () => {
    expect(isValidPodcastTtsBundle({
      ...bundle(),
      speeches: [speech(1, { audioUrl: "/podcasts/audio/example.mp3" }), speech(2), speech(3), speech(4)]
    }, "B1.4")).toBe(false);
  });
});


describe("TTS speed red-team contract", () => {
  it.each([
    [0.5, false],
    [1, true],
    [1.25, true],
    [1.5, true],
    [1.75, false],
    [2, true],
    [2.5, false]
  ])("accepts/rejects speech rate %s correctly", async (rate, expected) => {
    const { isPodcastSpeechRate } = await import("../../src/data/podcastSync.ts");
    expect(isPodcastSpeechRate(rate)).toBe(expected);
  });

  it("keeps the explanation bundle free from speed-dependent content fields", () => {
    const valid = bundle();
    expect(valid.speeches.every((speech) => !("speed" in speech))).toBe(true);
    expect(valid.speeches.every((speech) => !("rate" in speech))).toBe(true);
  });
});
