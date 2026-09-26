import { describe, expect, it } from "vitest";
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

describe("TTS explanation-level contract", () => {
  it("defines exactly four complete explanations of the same lesson", () => {
    const bundle = buildPodcastTtsBundle("B1.4", versions);

    expect(bundle?.speeches).toHaveLength(4);
    expect(bundle?.speeches.map((speech) => speech.explanationLevel)).toEqual([1, 2, 3, 4]);
    expect(bundle?.speeches.map((speech) => speech.explanationLevelId)).toEqual([
      "very-simple",
      "simple-technical",
      "professional",
      "expert"
    ]);
  });

  it("keeps every explanation independently versioned", () => {
    const bundle = buildPodcastTtsBundle("B1.4", versions);

    expect(bundle?.speeches[0].scriptVersion).toBe("sha-1");
    expect(bundle?.speeches[3].scriptVersion).toBe("sha-4");
    expect(bundle?.speeches[0].scriptVersion).not.toBe(bundle?.speeches[3].scriptVersion);
  });

  it("fails closed when one explanation is missing", () => {
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
        index === 1
          ? { ...speech, explanationLevel: 1, explanationLevelId: "very-simple", label: "Very simple" }
          : speech
      )
    };

    expect(isValidPodcastTtsBundle(duplicate, "B1.4")).toBe(false);
  });

  it("defines explanation depth without embedding speed or audio", () => {
    const bundle = buildPodcastTtsBundle("B1.4", versions);

    expect(bundle?.speeches.every((speech) => !("rate" in speech))).toBe(true);
    expect(bundle?.speeches.every((speech) => !("audioUrl" in speech))).toBe(true);
  });

  it("describes the four explanation levels clearly", () => {
    expect(podcastLevelId(1)).toBe("very-simple");
    expect(podcastLevelLabel(2)).toBe("Simple technical");
    expect(podcastLevelDescription(4)).toContain("complete lesson information");
  });
});
