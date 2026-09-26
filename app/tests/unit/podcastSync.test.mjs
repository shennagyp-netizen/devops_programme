import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPodcastTtsBundle,
  isValidPodcastTtsBundle,
  podcastLevelDescription,
  podcastLevelId,
  podcastLevelLabel
} from "../../src/data/podcastSync.ts";

const versions = {
  "1": "sha-1",
  "2": "sha-2",
  "3": "sha-3",
  "4": "sha-4"
};

describe("TTS podcast cognitive-level contract", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("defines exactly four fixed cognitive versions", () => {
    const bundle = buildPodcastTtsBundle("B1.4", versions);

    expect(bundle?.speeches).toHaveLength(4);
    expect(bundle?.speeches.map((speech) => speech.cognitiveLevel)).toEqual([1, 2, 3, 4]);
    expect(bundle?.speeches.map((speech) => speech.cognitiveLevelId)).toEqual([
      "foundation",
      "mechanism",
      "diagnosis",
      "design"
    ]);
  });

  it("keeps each cognitive level independently identified", () => {
    const bundle = buildPodcastTtsBundle("B1.4", versions);

    expect(bundle?.speeches[0].scriptVersion).toBe("sha-1");
    expect(bundle?.speeches[3].scriptVersion).toBe("sha-4");
    expect(bundle?.speeches[0].scriptVersion).not.toBe(bundle?.speeches[3].scriptVersion);
  });

  it("fails closed when one cognitive script is missing", () => {
    const incomplete = { ...versions };
    delete incomplete["3"];

    expect(buildPodcastTtsBundle("B1.4", incomplete)).toBeUndefined();
  });

  it("validates the exact four-level identity contract", () => {
    const bundle = buildPodcastTtsBundle("B1.4", versions);

    expect(isValidPodcastTtsBundle(bundle, "B1.4")).toBe(true);

    const duplicate = {
      ...bundle,
      speeches: bundle.speeches.map((speech, index) =>
        index === 1 ? { ...speech, cognitiveLevel: 1, cognitiveLevelId: "foundation", label: "Foundation" } : speech
      )
    };

    expect(isValidPodcastTtsBundle(duplicate, "B1.4")).toBe(false);
  });

  it("does not define cognitive depth through TTS speed", () => {
    const bundle = buildPodcastTtsBundle("B1.4", versions);

    expect(bundle?.speeches.every((speech) => !("rate" in speech))).toBe(true);
  });

  it("exposes human-readable cognitive labels", () => {
    expect(podcastLevelId(1)).toBe("foundation");
    expect(podcastLevelLabel(2)).toBe("Mechanism");
    expect(podcastLevelDescription(4)).toContain("transfer");
  });
});
