export type PodcastCueKind = "prediction" | "lab" | "recall" | "transition";

export type PodcastTurnTiming = {
  turnId: string;
  startMs: number;
  endMs: number;
};

export type PodcastCue = {
  turnId: string;
  kind: PodcastCueKind;
  startMs: number;
  endMs?: number;
};

export type PodcastAudioManifest = {
  episodeId: string;
  scriptVersion: string;
  audioUrl: string;
  durationMs: number;
  turns: PodcastTurnTiming[];
  cues: PodcastCue[];
};

/*
 * Audio is deliberately optional until generated audio has been aligned.
 *
 * React must never infer exact spoken position from text length, word count,
 * paragraph length, or average speaking rate.
 *
 * Every spoken turn gets a timing range. Exercise cues are a separate layer
 * because a single turn can contain the words that cause React to hand control
 * to the learner.
 */
export const podcastAudioManifest: Record<string, PodcastAudioManifest> = {};

export function getPodcastAudioManifest(episodeId: string) {
  return podcastAudioManifest[episodeId];
}

export function findActiveCue(
  manifest: PodcastAudioManifest | undefined,
  timeMs: number
): PodcastCue | undefined {
  if (!manifest) return undefined;

  for (let i = 0; i < manifest.cues.length; i += 1) {
    const cue = manifest.cues[i];
    const effectiveEnd =
      cue.endMs ?? manifest.cues[i + 1]?.startMs ?? manifest.durationMs;

    if (timeMs >= cue.startMs && timeMs < effectiveEnd) {
      return cue;
    }
  }

  return undefined;
}

export function findCurrentTurnId(
  manifest: PodcastAudioManifest | undefined,
  timeMs: number
) {
  if (!manifest) return undefined;

  return manifest.turns.find(
    (turn) => timeMs >= turn.startMs && timeMs < turn.endMs
  )?.turnId;
}
