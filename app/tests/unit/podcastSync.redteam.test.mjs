import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  findActiveCue,
  findCurrentSegment,
  findCurrentTurnId,
  loadPodcastAudioManifest
} from "../../src/data/podcastSync.ts";

function manifest(overrides = {}) {
  const base = {
    episodeId: "B1.4",
    scriptVersion: "v1",
    durationMs: 7000,
    segments: [
      {
        id: "B1.4.S001",
        turnId: "B1.4.T001",
        audioUrl: "/podcasts/audio/B1.4-01.mp3",
        startMs: 0,
        endMs: 2000
      },
      {
        id: "B1.4.S002",
        turnId: "B1.4.T002",
        audioUrl: "/podcasts/audio/B1.4-02.mp3",
        startMs: 2100,
        endMs: 4000
      },
      {
        id: "B1.4.S003",
        turnId: "B1.4.T003",
        audioUrl: "/podcasts/audio/B1.4-03.mp3",
        startMs: 4100,
        endMs: 6000
      }
    ],
    turns: [
      { turnId: "B1.4.T001", startMs: 0, endMs: 2000 },
      { turnId: "B1.4.T002", startMs: 2100, endMs: 4000 },
      { turnId: "B1.4.T003", startMs: 4100, endMs: 6000 }
    ],
    cues: [
      {
        id: "prediction",
        turnId: "B1.4.T002",
        kind: "prediction",
        startMs: 2300,
        endMs: 2500
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

describe("fixed podcast manifest validation red-team contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["missing episode id", { episodeId: "" }],
    ["missing script version", { scriptVersion: "" }],
    ["zero duration", { durationMs: 0 }],
    ["negative duration", { durationMs: -1 }],
    ["non-finite duration", { durationMs: Number.NaN }],
    ["missing segments", { segments: undefined }],
    ["missing turns", { turns: undefined }],
    ["missing cues", { cues: undefined }]
  ])("rejects %s", async (_label, override) => {
    installFetch({ "B1.4": manifest(override) });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects unsafe segment audio URLs", async () => {
    for (const audioUrl of [
      "http://cdn.example.com/audio.mp3",
      "//cdn.example.com/audio.mp3",
      "javascript:alert(1)",
      "data:audio/mpeg;base64,AAAA"
    ]) {
      installFetch({
        "B1.4": manifest({
          segments: [
            { ...manifest().segments[0], audioUrl }
          ]
        })
      });
      await expect(loadPodcastAudioManifest()).resolves.toEqual({});
    }
  });

  it("accepts root-relative and HTTPS segment audio URLs", async () => {
    for (const audioUrl of [
      "/podcasts/audio/B1.4-01.mp3",
      "https://cdn.example.com/audio.mp3"
    ]) {
      installFetch({
        "B1.4": manifest({
          segments: [
            { ...manifest().segments[0], audioUrl },
            ...manifest().segments.slice(1)
          ]
        })
      });
      const loaded = await loadPodcastAudioManifest();
      expect(loaded["B1.4"]?.segments[0]?.audioUrl).toBe(audioUrl);
    }
  });

  it("rejects duplicate segment ids and duplicate turn ids", async () => {
    const duplicateSegment = manifest();
    duplicateSegment.segments[1].id = duplicateSegment.segments[0].id;
    installFetch({ "B1.4": duplicateSegment });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});

    const duplicateTurn = manifest();
    duplicateTurn.turns[1].turnId = duplicateTurn.turns[0].turnId;
    installFetch({ "B1.4": duplicateTurn });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects overlapping, reversed, or out-of-range segments", async () => {
    for (const segments of [
      [
        { ...manifest().segments[0], startMs: 0, endMs: 3000 },
        { ...manifest().segments[1], startMs: 2500, endMs: 4000 },
        manifest().segments[2]
      ],
      [
        { ...manifest().segments[0], startMs: 3000, endMs: 2000 },
        ...manifest().segments.slice(1)
      ],
      [
        { ...manifest().segments[0], startMs: 0, endMs: 8000 },
        ...manifest().segments.slice(1)
      ]
    ]) {
      installFetch({ "B1.4": manifest({ segments }) });
      await expect(loadPodcastAudioManifest()).resolves.toEqual({});
    }
  });

  it("rejects segment references to unknown turns", async () => {
    installFetch({
      "B1.4": manifest({
        segments: [
          { ...manifest().segments[0], turnId: "missing" },
          ...manifest().segments.slice(1)
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects malformed turn and cue timelines", async () => {
    installFetch({
      "B1.4": manifest({
        turns: [
          { turnId: "one", startMs: 0, endMs: 3000 },
          { turnId: "two", startMs: 2500, endMs: 4000 }
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});

    installFetch({
      "B1.4": manifest({
        cues: [
          {
            id: "bad",
            turnId: "B1.4.T001",
            kind: "not-a-kind",
            startMs: 500
          }
        ]
      })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("rejects a manifest whose object key does not match episodeId", async () => {
    installFetch({
      "B1.4": manifest({ episodeId: "B1.9" })
    });
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("filters invalid entries while retaining valid entries", async () => {
    installFetch({
      "B1.4": manifest(),
      BROKEN: manifest({
        episodeId: "BROKEN",
        segments: [
          { ...manifest().segments[0], audioUrl: "javascript:alert(1)" },
          ...manifest().segments.slice(1)
        ]
      })
    });

    const loaded = await loadPodcastAudioManifest();
    expect(Object.keys(loaded)).toEqual(["B1.4"]);
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

describe("fixed podcast timeline lookup contract", () => {
  const current = manifest();

  it("uses inclusive start and exclusive end boundaries for segments and turns", () => {
    expect(findCurrentSegment(current, 0)?.id).toBe("B1.4.S001");
    expect(findCurrentSegment(current, 1999)?.id).toBe("B1.4.S001");
    expect(findCurrentSegment(current, 2000)).toBeUndefined();
    expect(findCurrentSegment(current, 2100)?.id).toBe("B1.4.S002");
    expect(findCurrentTurnId(current, 2100)).toBe("B1.4.T002");
    expect(findCurrentTurnId(current, 4000)).toBeUndefined();
  });

  it("uses authored cue end times", () => {
    expect(findActiveCue(current, 2300)?.id).toBe("prediction");
    expect(findActiveCue(current, 2499)?.id).toBe("prediction");
    expect(findActiveCue(current, 2500)).toBeUndefined();
  });

  it("returns no segment, turn or cue outside the authored timeline", () => {
    expect(findCurrentSegment(undefined, 10)).toBeUndefined();
    expect(findCurrentTurnId(undefined, 10)).toBeUndefined();
    expect(findActiveCue(undefined, 10)).toBeUndefined();
    expect(findCurrentSegment(current, -1)).toBeUndefined();
    expect(findCurrentTurnId(current, -1)).toBeUndefined();
    expect(findActiveCue(current, 10000)).toBeUndefined();
  });
});
