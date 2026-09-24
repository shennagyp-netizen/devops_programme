export type PodcastCueKind = "prediction" | "lab" | "recall" | "transition";

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
  cues: PodcastCue[];
};

/*
 * Audio is deliberately optional until generated audio has been aligned.
 *
 * The React app must never infer exact voice position from text length.
 * When a manifest exists, playback time drives the transcript and exercise state.
 * When it does not, the app falls back to guided/manual transcript mode.
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
  return manifest.cues.find(
    (cue) =>
      timeMs >= cue.startMs &&
      (cue.endMs === undefined || timeMs < cue.endMs)
  );
}
