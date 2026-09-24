export type PodcastCueKind = "prediction" | "lab" | "recall" | "transition";

export type PodcastTurnTiming = {
  turnId: string;
  startMs: number;
  endMs: number;
};

export type PodcastCue = {
  id: string;
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

const cueKinds = new Set<PodcastCueKind>([
  "prediction",
  "lab",
  "recall",
  "transition"
]);

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isValidManifest(value: unknown): value is PodcastAudioManifest {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PodcastAudioManifest>;
  if (typeof candidate.episodeId !== "string" || !candidate.episodeId) return false;
  if (typeof candidate.scriptVersion !== "string" || !candidate.scriptVersion) return false;
  if (typeof candidate.audioUrl !== "string" || !candidate.audioUrl) return false;
  if (!isFiniteNonNegative(candidate.durationMs) || candidate.durationMs === 0) return false;
  if (!Array.isArray(candidate.turns) || !Array.isArray(candidate.cues)) return false;

  let previousTurnEnd = 0;
  for (const turn of candidate.turns) {
    if (!turn || typeof turn.turnId !== "string" || !turn.turnId) return false;
    if (!isFiniteNonNegative(turn.startMs) || !isFiniteNonNegative(turn.endMs)) return false;
    if (turn.endMs <= turn.startMs || turn.endMs > candidate.durationMs) return false;
    if (turn.startMs < previousTurnEnd) return false;
    previousTurnEnd = turn.endMs;
  }

  const turnIds = new Set(candidate.turns.map((turn) => turn.turnId));
  let previousCueStart = 0;
  for (const cue of candidate.cues) {
    if (!cue || typeof cue.id !== "string" || !cue.id) return false;
    if (typeof cue.turnId !== "string" || !turnIds.has(cue.turnId)) return false;
    if (!cueKinds.has(cue.kind)) return false;
    if (!isFiniteNonNegative(cue.startMs) || cue.startMs > candidate.durationMs) return false;
    if (cue.endMs !== undefined) {
      if (!isFiniteNonNegative(cue.endMs) || cue.endMs <= cue.startMs || cue.endMs > candidate.durationMs) {
        return false;
      }
    }
    if (cue.startMs < previousCueStart) return false;
    previousCueStart = cue.startMs;
  }

  return true;
}

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
export async function loadPodcastAudioManifest(): Promise<
  Record<string, PodcastAudioManifest>
> {
  try {
    const response = await fetch("/podcasts/audio-manifest.json");
    if (!response.ok) return {};

    const raw = (await response.json()) as unknown;
    if (!raw || typeof raw !== "object") return {};

    const validated: Record<string, PodcastAudioManifest> = {};
    for (const [episodeId, value] of Object.entries(raw as Record<string, unknown>)) {
      if (isValidManifest(value) && value.episodeId === episodeId) {
        validated[episodeId] = value;
      }
    }

    return validated;
  } catch {
    return {};
  }
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

export type PodcastScriptManifest = {
  schemaVersion: number;
  source: string;
  episodes: Record<string, string>;
};
