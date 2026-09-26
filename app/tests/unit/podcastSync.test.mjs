import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  findActiveCue,
  findCurrentTurnId,
  loadPodcastAudioManifest
} from "../../src/data/podcastSync.ts";

const speech = (level, overrides = {}) => ({
  episodeId: "B1.4",
  cognitiveLevel: level,
  cognitiveLevelId: ["", "foundation", "mechanism", "diagnosis", "design"][level],
  label: ["", "Foundation", "Mechanism", "Diagnosis", "Design & transfer"][level],
  description: "Test speech",
  audioUrl: `/podcasts/audio/B1.4.cognitive-${level}.mp3`,
  scriptVersion: `sha-${level}`,
  durationMs: 3000,
  turns: [{ turnId: `B1.4.L${level}.T001`, startMs: 0, endMs: 3000 }],
  cues: [],
  ...overrides
});

const validBundle = {
  episodeId: "B1.4",
  speeches: [speech(1), speech(2), speech(3), speech(4)]
};

describe("podcast cognitive speech synchronization contract", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("accepts exactly four complete cognitive speeches", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ B1.4: validBundle })
    });

    const result = await loadPodcastAudioManifest();

    expect(result["B1.4"]).toEqual(validBundle);
  });

  it("uses the real audio timeline for the selected speech", () => {
    const selected = validBundle.speeches[2];

    expect(findCurrentTurnId(selected, 0)).toBe("B1.4.L3.T001");
    expect(findCurrentTurnId(selected, 2999)).toBe("B1.4.L3.T001");
    expect(findCurrentTurnId(selected, 3000)).toBeUndefined();
  });

  it("keeps learner cues authored inside an individual speech", async () => {
    const withCue = {
      ...speech(2),
      cues: [{
        id: "cue-diagnose",
        turnId: "B1.4.L2.T001",
        kind: "prediction",
        startMs: 500,
        endMs: 900
      }]
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        B1.4: {
          ...validBundle,
          speeches: [speech(1), withCue, speech(3), speech(4)]
        }
      })
    });

    const result = await loadPodcastAudioManifest();
    expect(findActiveCue(result["B1.4"].speeches[1], 600)?.id).toBe("cue-diagnose");
  });

  it("fails closed on network errors", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    await expect(loadPodcastAudioManifest()).resolves.toEqual({});
  });
});
