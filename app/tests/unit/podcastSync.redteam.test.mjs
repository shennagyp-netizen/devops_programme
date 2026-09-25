import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  findActiveCue,
  findCurrentTurnId,
  loadPodcastAudioManifest,
  type PodcastAudioManifest
} from "../../src/data/podcastSync.ts";

function manifest(overrides = {}) {
  const base: PodcastAudioManifest = {
    episodeId: "B1.2",
    scriptVersion: "v1",
    audioUrl: "/podcasts/audio/B1.2.mp3",
    durationMs: 5000,
    turns: [
      { turnId: "B1.2.T001", startMs: 0, endMs: 2500 },
      { turnId: "B1.2.T002", startMs: 2500, endMs: 5000 }
    ],
    cues: [
      {
        id: "prediction",
        turnId: "B1.2.T001",
        kind: "prediction",
        startMs: 500
      },
      {
        id: "lab",
        turnId: "B1.2.T002",
        kind: "lab",
        startMs: 3000,
        endMs: 3500
      }
    ],
    ...overrides
  };
  return base;
}

function installFetch(payload, ok = true) {
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok,
    json: async () => payload
  });
}

describe("podcast audio manifest validation red-team contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["missing episode id", { episodeId: "" }],
    ["missing script version", { scriptVersion: "" }],
    ["missing audio url", { audioUrl: "" }],
    ["zero duration", { durationMs: 0 }],
    ["negative duration", { durationMs: -1 }],
    ["non-finite duration", { durationMs: Number.NaN }],
    ["missing turns array", { turns: undefined }],
    ["missing cues array", { cues: undefined }]
  ])("rejects %s", async (_label, override) => {
    installFetch({ "B1.2": manifest(override) });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects unsafe audio URLs instead of treating manifest data as trusted", async () => {
    for (const audioUrl of [
      "http://cdn.example.com/audio.mp3",
      "//cdn.example.com/audio.mp3",
      "javascript:alert(1)",
      "data:audio/mpeg;base64,AAAA"
    ]) {
      installFetch({ "B1.2": manifest({ audioUrl }) });
      await expect(loadPodcastAudioManifest()).resolves.toEqual({});
    }
  });

  it("accepts a root-relative or HTTPS audio URL", async () => {
    for (const audioUrl of [
      "/podcasts/audio/B1.2.mp3",
      "https://cdn.example.com/audio/B1.2.mp3"
    ]) {
      installFetch({ "B1.2": manifest({ audioUrl }) });
      const loaded = await loadPodcastAudioManifest();
      expect(loaded["B1.2"]?.audioUrl).toBe(audioUrl);
    }
  });

  it("rejects duplicate turn ids and duplicate cue ids", async () => {
    installFetch({
      "B1.2": manifest({
        turns: [
          { turnId: "same", startMs: 0, endMs: 2000 },
          { turnId: "same", startMs: 2000, endMs: 5000 }
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});

    installFetch({
      "B1.2": manifest({
        cues: [
          {
            id: "same",
            turnId: "B1.2.T001",
            kind: "prediction",
            startMs: 500
          },
          {
            id: "same",
            turnId: "B1.2.T002",
            kind: "lab",
            startMs: 3000
          }
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects turns that overlap, reverse, or exceed duration", async () => {
    const cases = [
      [
        { turnId: "one", startMs: 0, endMs: 3000 },
        { turnId: "two", startMs: 2500, endMs: 5000 }
      ],
      [
        { turnId: "one", startMs: 2000, endMs: 1000 }
      ],
      [
        { turnId: "one", startMs: 0, endMs: 6000 }
      ]
    ];

    for (const turns of cases) {
      installFetch({ "B1.2": manifest({ turns }) });
      await expect(loadPodcastAudioManifest()).resolves.toEqual({});
    }
  });

  it("rejects cues with unknown turns, invalid kinds, bad ordering or invalid timing", async () => {
    const cases = [
      [{ turnId: "missing", kind: "prediction", startMs: 500 }],
      [{ turnId: "B1.2.T001", kind: "not-a-kind", startMs: 500 }],
      [{ turnId: "B1.2.T001", kind: "prediction", startMs: -1 }],
      [{ turnId: "B1.2.T001", kind: "prediction", startMs: 6000 }],
      [{ turnId: "B1.2.T001", kind: "prediction", startMs: 800, endMs: 700 }],
      [
        { turnId: "B1.2.T001", kind: "prediction", startMs: 1000 },
        { turnId: "B1.2.T001", kind: "lab", startMs: 500 }
      ],
      [
        { turnId: "B1.2.T001", kind: "prediction", startMs: 500, endMs: 1500 },
        { turnId: "B1.2.T001", kind: "lab", startMs: 1000 }
      ]
    ];

    for (const cues of cases) {
      installFetch({
        "B1.2": manifest({
          cues: Array.isArray(cues) ? cues : [cues]
        })
      });
      await expect(loadPodcastAudioManifest()).resolves.toEqual({});
    }
  });

  it("rejects a manifest whose object key does not match episodeId", async () => {
    installFetch({
      "B1.2": manifest({ episodeId: "B1.9" })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("filters invalid entries while keeping valid entries from the same manifest file", async () => {
    installFetch({
      "B1.2": manifest(),
      "BROKEN": manifest({
        episodeId: "BROKEN",
        audioUrl: "javascript:alert(1)"
      })
    });

    const loaded = await loadPodcastAudioManifest();
    expect(Object.keys(loaded)).toEqual(["B1.2"]);
  });

  it("fails closed for network, HTTP and JSON-shape failures", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});

    installFetch({}, false);
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => "not an object"
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });
});

describe("podcast timeline lookup contract", () => {
  const current = manifest();

  it("uses inclusive start and exclusive end boundaries for turns", () => {
    expect(findCurrentTurnId(current, 0)).toBe("B1.2.T001");
    expect(findCurrentTurnId(current, 2499)).toBe("B1.2.T001");
    expect(findCurrentTurnId(current, 2500)).toBe("B1.2.T002");
    expect(findCurrentTurnId(current, 4999)).toBe("B1.2.T002");
    expect(findCurrentTurnId(current, 5000)).toBeUndefined();
  });

  it("uses authored cue end times when present", () => {
    expect(findActiveCue(current, 3000)?.id).toBe("lab");
    expect(findActiveCue(current, 3499)?.id).toBe("lab");
    expect(findActiveCue(current, 3500)).toBeUndefined();
  });

  it("uses the next cue start as the effective end for open-ended cues", () => {
    const value = manifest({
      cues: [
        {
          id: "first",
          turnId: "B1.2.T001",
          kind: "prediction",
          startMs: 500
        },
        {
          id: "second",
          turnId: "B1.2.T001",
          kind: "transition",
          startMs: 1200
        }
      ]
    });

    expect(findActiveCue(value, 500)?.id).toBe("first");
    expect(findActiveCue(value, 1199)?.id).toBe("first");
    expect(findActiveCue(value, 1200)?.id).toBe("second");
  });

  it("returns no turn or cue outside the authored timeline", () => {
    expect(findCurrentTurnId(undefined, 10)).toBeUndefined();
    expect(findActiveCue(undefined, 10)).toBeUndefined();
    expect(findCurrentTurnId(current, -1)).toBeUndefined();
    expect(findActiveCue(current, -1)).toBeUndefined();
    expect(findCurrentTurnId(current, 10000)).toBeUndefined();
    expect(findActiveCue(current, 10000)).toBeUndefined();
  });

  it("supports transition cues without making them learner-action cues", async () => {
    installFetch({
      "B1.2": manifest({
        cues: [
          {
            id: "transition",
            turnId: "B1.2.T001",
            kind: "transition",
            startMs: 1000,
            endMs: 1200
          }
        ]
      })
    });

    const loaded = await loadPodcastAudioManifest();
    expect(loaded["B1.2"]?.cues[0].kind).toBe("transition");
    expect(findActiveCue(loaded["B1.2"], 1100)?.kind).toBe("transition");
  });
});
