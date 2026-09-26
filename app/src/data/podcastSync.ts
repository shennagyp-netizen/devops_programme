export type PodcastCueKind = "prediction" | "lab" | "recall" | "transition";

export type PodcastTurnTiming = {
  turnId: string;
  startMs: number;
  endMs: number;
};

export type PodcastAudioSegment = {
  id: string;
  turnId: string;
  audioUrl: string;
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
  durationMs: number;
  segments: PodcastAudioSegment[];
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

function isSafeAudioSource(value: string) {
  return (
    (value.startsWith("/") && !value.startsWith("//")) ||
    /^https:\/\//i.test(value)
  );
}

function isValidManifest(value: unknown): value is PodcastAudioManifest {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PodcastAudioManifest>;
  if (typeof candidate.episodeId !== "string" || !candidate.episodeId) return false;
  if (typeof candidate.scriptVersion !== "string" || !candidate.scriptVersion) return false;
  if (!isFiniteNonNegative(candidate.durationMs) || candidate.durationMs === 0) return false;
  if (!Array.isArray(candidate.segments) || candidate.segments.length === 0) return false;
  if (!Array.isArray(candidate.turns) || candidate.turns.length === 0) return false;
  if (!Array.isArray(candidate.cues)) return false;

  const turnIds = new Set<string>();
  let previousTurnEnd = 0;
  for (const turn of candidate.turns) {
    if (!turn || typeof turn.turnId !== "string" || !turn.turnId) return false;
    if (turnIds.has(turn.turnId)) return false;
    turnIds.add(turn.turnId);
    if (!isFiniteNonNegative(turn.startMs) || !isFiniteNonNegative(turn.endMs)) return false;
    if (turn.endMs <= turn.startMs || turn.endMs > candidate.durationMs) return false;
    if (turn.startMs < previousTurnEnd) return false;
    previousTurnEnd = turn.endMs;
  }

  const segmentIds = new Set<string>();
  let previousSegmentEnd = 0;
  for (const segment of candidate.segments) {
    if (!segment || typeof segment.id !== "string" || !segment.id) return false;
    if (segmentIds.has(segment.id)) return false;
    segmentIds.add(segment.id);
    if (typeof segment.turnId !== "string" || !turnIds.has(segment.turnId)) return false;
    if (typeof segment.audioUrl !== "string" || !segment.audioUrl || !isSafeAudioSource(segment.audioUrl)) return false;
    if (!isFiniteNonNegative(segment.startMs) || !isFiniteNonNegative(segment.endMs)) return false;
    if (segment.endMs <= segment.startMs || segment.endMs > candidate.durationMs) return false;
    if (segment.startMs < previousSegmentEnd) return false;
    previousSegmentEnd = segment.endMs;
  }

  const cueIds = new Set<string>();
  let previousCueStart = 0;
  let previousCueEnd = 0;
  for (const cue of candidate.cues) {
    if (!cue || typeof cue.id !== "string" || !cue.id) return false;
    if (cueIds.has(cue.id)) return false;
    cueIds.add(cue.id);
    if (typeof cue.turnId !== "string" || !turnIds.has(cue.turnId)) return false;
    if (!cueKinds.has(cue.kind)) return false;
    if (!isFiniteNonNegative(cue.startMs) || cue.startMs > candidate.durationMs) return false;
    if (cue.endMs !== undefined) {
      if (!isFiniteNonNegative(cue.endMs) || cue.endMs <= cue.startMs || cue.endMs > candidate.durationMs) return false;
    }
    if (cue.startMs < previousCueStart) return false;
    if (cue.startMs < previousCueEnd) return false;
    previousCueStart = cue.startMs;
    previousCueEnd = cue.endMs ?? cue.startMs;
  }

  return true;
}

export async function loadPodcastAudioManifest(): Promise<Record<string, PodcastAudioManifest>> {
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

export function findCurrentSegment(
  manifest: PodcastAudioManifest | undefined,
  timeMs: number
): PodcastAudioSegment | undefined {
  if (!manifest) return undefined;
  return manifest.segments.find(
    (segment) => timeMs >= segment.startMs && timeMs < segment.endMs
  );
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
