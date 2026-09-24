import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  findActiveCue,
  findCurrentTurnId,
  loadPodcastAudioManifest
} from "../../src/data/podcastSync.ts";

describe("podcast synchronization contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects a malformed audio manifest entry", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        "B1.2": {
          episodeId: "B1.2",
          scriptVersion: "v1",
          audioUrl: "/audio/B1.2.mp3",
          durationMs: 1000,
          turns: [
            {
              turnId: "B1.2.T001",
              startMs: 500,
              endMs: 300
            }
          ],
          cues: []
        }
      })
    });

    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });

  it("accepts a valid aligned manifest and locates cues/turns", async () => {
    const manifest = {
      episodeId: "B1.2",
      scriptVersion: "sha-test",
      audioUrl: "/audio/B1.2.mp3",
      durationMs: 3000,
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

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ "B1.2": manifest })
    });

    const result = await loadPodcastAudioManifest();

    expect(result["B1.2"]).toEqual(manifest);
    expect(findCurrentTurnId(result["B1.2"], 700)).toBe("B1.2.T001");
    expect(findActiveCue(result["B1.2"], 500)?.id).toBe("cue-1");
    expect(findActiveCue(result["B1.2"], 2000)?.id).toBe("cue-2");
  });

  it("fails closed on network errors", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"));

    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });
});
