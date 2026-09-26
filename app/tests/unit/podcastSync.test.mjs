import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  findActiveCue,
  findCurrentSegment,
  findCurrentTurnId,
  loadPodcastAudioManifest
} from "../../src/data/podcastSync.ts";

const validManifest = {
  episodeId: "B1.2",
  scriptVersion: "sha-test",
  durationMs: 3000,
  segments: [
    {
      id: "segment-1",
      turnId: "B1.2.T001",
      audioUrl: "/audio/B1.2-01.mp3",
      startMs: 0,
      endMs: 1400
    },
    {
      id: "segment-2",
      turnId: "B1.2.T002",
      audioUrl: "/audio/B1.2-02.mp3",
      startMs: 1400,
      endMs: 3000
    }
  ],
  turns: [
    {
      turnId: "B1.2.T001",
      startMs: 0,
      endMs: 1400
    },
    {
      turnId: "B1.2.T002",
      startMs: 1400,
      endMs: 3000
    }
  ],
  cues: [
    {
      id: "cue-1",
      turnId: "B1.2.T001",
      kind: "prediction",
      startMs: 400,
      endMs: 800
    },
    {
      id: "cue-2",
      turnId: "B1.2.T002",
      kind: "lab",
      startMs: 1800
    }
  ]
};

describe("podcast synchronization contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects malformed fixed-segment manifests", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        "B1.2": {
          ...validManifest,
          segments: [
            {
              ...validManifest.segments[0],
              endMs: 300,
              startMs: 500
            }
          ]
        }
      })
    });

    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("accepts a valid aligned manifest and locates segments, turns and cues", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ "B1.2": validManifest })
    });

    const result = await loadPodcastAudioManifest();

    expect(result["B1.2"]).toEqual(validManifest);
    expect(findCurrentSegment(result["B1.2"], 700)?.id).toBe("segment-1");
    expect(findCurrentTurnId(result["B1.2"], 700)).toBe("B1.2.T001");
    expect(findActiveCue(result["B1.2"], 500)?.id).toBe("cue-1");
    expect(findActiveCue(result["B1.2"], 2000)?.id).toBe("cue-2");
  });

  it("uses inclusive start and exclusive end boundaries", () => {
    expect(findCurrentSegment(validManifest, 0)?.id).toBe("segment-1");
    expect(findCurrentSegment(validManifest, 1399)?.id).toBe("segment-1");
    expect(findCurrentSegment(validManifest, 1400)?.id).toBe("segment-2");
    expect(findCurrentTurnId(validManifest, 3000)).toBeUndefined();
  });

  it("fails closed on network errors", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });
});
