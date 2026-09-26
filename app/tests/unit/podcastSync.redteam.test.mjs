import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPodcastTtsBundle,
  isValidPodcastTtsBundle
} from "../../src/data/podcastSync.ts";

const speech = (level, overrides = {}) => ({
  episodeId: "B1.4",
  cognitiveLevel: level,
  cognitiveLevelId: ["", "foundation", "mechanism", "diagnosis", "design"][level],
  label: ["", "Foundation", "Mechanism", "Diagnosis", "Design & transfer"][level],
  description: "Test speech",
  scriptUrl: `/podcasts/beginner/B1.4.cognitive-${level}.txt`,
  scriptVersion: `sha-${level}`,
  ...overrides
});

const bundle = (overrides = {}) => ({
  episodeId: "B1.4",
  speeches: [speech(1), speech(2), speech(3), speech(4)],
  ...overrides
});

describe("TTS cognitive podcast red-team contract", () => {
  beforeEach(() => vi.restoreAllMocks());

  it.each([
    ["wrong speech count", { speeches: [speech(1), speech(2), speech(3)] }],
    ["duplicate cognitive levels", {
      speeches: [speech(1), speech(1), speech(3), speech(4)]
    }],
    ["wrong identity", {
      speeches: [speech(1), speech(2, { cognitiveLevelId: "foundation" }), speech(3), speech(4)]
    }],
    ["wrong label", {
      speeches: [speech(1), speech(2, { label: "Foundation" }), speech(3), speech(4)]
    }],
    ["unsafe script path", {
      speeches: [speech(1, { scriptUrl: "javascript:alert(1)" }), speech(2), speech(3), speech(4)]
    }],
    ["empty script version", {
      speeches: [speech(1, { scriptVersion: "" }), speech(2), speech(3), speech(4)]
    }],
    ["wrong episode", {
      speeches: [speech(1, { episodeId: "B1.9" }), speech(2), speech(3), speech(4)]
    }]
  ])("rejects %s", (_label, value) => {
    expect(isValidPodcastTtsBundle({ ...bundle(), ...value }, "B1.4")).toBe(false);
  });

  it("accepts only root-relative authored script URLs", () => {
    const valid = bundle();
    expect(isValidPodcastTtsBundle(valid, "B1.4")).toBe(true);

    const external = bundle({
      speeches: [
        speech(1, { scriptUrl: "https://cdn.example.com/speech.txt" }),
        speech(2),
        speech(3),
        speech(4)
      ]
    });

    expect(isValidPodcastTtsBundle(external, "B1.4")).toBe(false);
  });

  it("fails closed when one level is missing from generated metadata", () => {
    const versions = { "1": "sha-1", "2": "sha-2", "4": "sha-4" };
    expect(buildPodcastTtsBundle("B1.4", versions)).toBeUndefined();
  });

  it("does not permit an invented fifth cognitive level", () => {
    const invalid = bundle({
      speeches: [speech(1), speech(2), speech(3), speech(4), speech(4, { cognitiveLevel: 4 })]
    });

    expect(isValidPodcastTtsBundle(invalid, "B1.4")).toBe(false);
  });
});
