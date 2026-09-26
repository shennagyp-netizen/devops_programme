import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadPodcastAudioManifest } from "../../src/data/podcastSync.ts";

const baseSpeech = (level, overrides = {}) => ({
  episodeId: "B1.4",
  cognitiveLevel: level,
  cognitiveLevelId: ["", "foundation", "mechanism", "diagnosis", "design"][level],
  label: `Level ${level}`,
  description: "Test",
  audioUrl: `/podcasts/audio/B1.4.cognitive-${level}.mp3`,
  scriptVersion: "v1",
  durationMs: 5000,
  turns: [{ turnId: `B1.4.L${level}.T001`, startMs: 0, endMs: 5000 }],
  cues: [],
  ...overrides
});

function bundle(overrides = {}) {
  return {
    episodeId: "B1.4",
    speeches: [baseSpeech(1), baseSpeech(2), baseSpeech(3), baseSpeech(4)],
    ...overrides
  };
}

function installFetch(payload, ok = true) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload
  });
}

describe("four-speech podcast red-team validation", () => {
  beforeEach(() => vi.restoreAllMocks());

  it.each([
    ["wrong speech count", { speeches: [baseSpeech(1), baseSpeech(2), baseSpeech(3)] }],
    ["duplicate cognitive levels", {
      speeches: [baseSpeech(1), baseSpeech(1), baseSpeech(3), baseSpeech(4)]
    }],
    ["missing label", {
      speeches: [baseSpeech(1), baseSpeech(2, { label: "" }), baseSpeech(3), baseSpeech(4)]
    }],
    ["missing script version", {
      speeches: [baseSpeech(1, { scriptVersion: "" }), baseSpeech(2), baseSpeech(3), baseSpeech(4)]
    }],
    ["zero duration", {
      speeches: [baseSpeech(1, { durationMs: 0 }), baseSpeech(2), baseSpeech(3), baseSpeech(4)]
    }],
    ["unknown level id", {
      speeches: [baseSpeech(1, { cognitiveLevelId: "mechanism" }), baseSpeech(2), baseSpeech(3), baseSpeech(4)]
    }]
  ])("rejects %s", async (_label, override) => {
    installFetch({ B1.4: bundle(override) });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects unsafe audio URLs", async () => {
    for (const audioUrl of [
      "http://cdn.example.com/audio.mp3",
      "//cdn.example.com/audio.mp3",
      "javascript:alert(1)",
      "data:audio/mpeg;base64,AAAA"
    ]) {
      installFetch({
        B1.4: bundle({
          speeches: [
            baseSpeech(1, { audioUrl }),
            baseSpeech(2),
            baseSpeech(3),
            baseSpeech(4)
          ]
        })
      });
      await expect(loadPodcastAudioManifest()).resolves.toEqual({});
    }
  });

  it("accepts root-relative and HTTPS audio URLs", async () => {
    for (const audioUrl of [
      "/podcasts/audio/B1.4.cognitive-1.mp3",
      "https://cdn.example.com/audio.mp3"
    ]) {
      installFetch({
        B1.4: bundle({
          speeches: [
            baseSpeech(1, { audioUrl }),
            baseSpeech(2),
            baseSpeech(3),
            baseSpeech(4)
          ]
        })
      });
      const loaded = await loadPodcastAudioManifest();
      expect(loaded.B1.4.speeches[0].audioUrl).toBe(audioUrl);
    }
  });

  it("rejects malformed turn and cue timelines", async () => {
    installFetch({
      B1.4: bundle({
        speeches: [
          baseSpeech(1, {
            turns: [
              { turnId: "one", startMs: 0, endMs: 3000 },
              { turnId: "two", startMs: 2500, endMs: 4000 }
            ]
          }),
          baseSpeech(2),
          baseSpeech(3),
          baseSpeech(4)
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});

    installFetch({
      B1.4: bundle({
        speeches: [
          baseSpeech(1, {
            cues: [{
              id: "bad",
              turnId: "B1.4.L1.T001",
              kind: "not-a-kind",
              startMs: 500
            }]
          }),
          baseSpeech(2),
          baseSpeech(3),
          baseSpeech(4)
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects speech references to a different episode", async () => {
    installFetch({
      B1.4: bundle({
        speeches: [
          baseSpeech(1, { episodeId: "B1.9" }),
          baseSpeech(2),
          baseSpeech(3),
          baseSpeech(4)
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects duplicate cue ids and unknown cue turns", async () => {
    installFetch({
      B1.4: bundle({
        speeches: [
          baseSpeech(1, {
            cues: [
              { id: "same", turnId: "B1.4.L1.T001", kind: "prediction", startMs: 100 },
              { id: "same", turnId: "B1.4.L1.T001", kind: "lab", startMs: 300 }
            ]
          }),
          baseSpeech(2),
          baseSpeech(3),
          baseSpeech(4)
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});

    installFetch({
      B1.4: bundle({
        speeches: [
          baseSpeech(1, {
            cues: [
              { id: "unknown", turnId: "missing", kind: "prediction", startMs: 100 }
            ]
          }),
          baseSpeech(2),
          baseSpeech(3),
          baseSpeech(4)
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("fails closed for HTTP and JSON-shape failures", async () => {
    installFetch({}, false);
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => "not an object"
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });
});
