export type PodcastCognitiveLevel = 1 | 2 | 3 | 4;

export type PodcastCognitiveLevelId =
  | "foundation"
  | "mechanism"
  | "diagnosis"
  | "design";

export type PodcastTurnTiming = {
  turnId: string;
  startMs: number;
  endMs: number;
};

export type PodcastCueKind = "prediction" | "lab" | "recall" | "transition";

export type PodcastCue = {
  id: string;
  turnId: string;
  kind: PodcastCueKind;
  startMs: number;
  endMs?: number;
};

export type PodcastAudioManifest = {
  episodeId: string;
  cognitiveLevel: PodcastCognitiveLevel;
  cognitiveLevelId: PodcastCognitiveLevelId;
  label: string;
  description: string;
  audioUrl: string;
  scriptVersion: string;
  durationMs: number;
  turns: PodcastTurnTiming[];
  cues: PodcastCue[];
};

export type PodcastAudioBundle = {
  episodeId: string;
  speeches: PodcastAudioManifest[];
};

const cueKinds = new Set<PodcastCueKind>([
  "prediction",
  "lab",
  "recall",
  "transition"
]);

const levelIds: Record<PodcastCognitiveLevel, PodcastCognitiveLevelId> = {
  1: "foundation",
  2: "mechanism",
  3: "diagnosis",
  4: "design"
};

function isFiniteNonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isSafeAudioSource(value: string) {
  return (
    (value.startsWith("/") && !value.startsWith("//")) ||
    /^https:\/\//i.test(value)
  );
}

function isValidSpeech(value: unknown, episodeId: string): value is PodcastAudioManifest {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PodcastAudioManifest>;

  if (candidate.episodeId !== episodeId) return false;
  if (![1, 2, 3, 4].includes(candidate.cognitiveLevel as number)) return false;
  if (
    candidate.cognitiveLevelId !==
    levelIds[candidate.cognitiveLevel as PodcastCognitiveLevel]
  ) {
    return false;
  }
  if (typeof candidate.label !== "string" || !candidate.label) return false;
  if (typeof candidate.description !== "string" || !candidate.description) return false;
  if (typeof candidate.audioUrl !== "string" || !candidate.audioUrl || !isSafeAudioSource(candidate.audioUrl)) {
    return false;
  }
  if (typeof candidate.scriptVersion !== "string" || !candidate.scriptVersion) return false;
  if (!isFiniteNonNegative(candidate.durationMs) || candidate.durationMs === 0) return false;
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
      if (!isFiniteNonNegative(cue.endMs) || cue.endMs <= cue.startMs || cue.endMs > candidate.durationMs) {
        return false;
      }
    }

    if (cue.startMs < previousCueStart) return false;
    if (cue.startMs < previousCueEnd) return false;

    previousCueStart = cue.startMs;
    previousCueEnd = cue.endMs ?? cue.startMs;
  }

  return true;
}

function isValidBundle(value: unknown, episodeId: string): value is PodcastAudioBundle {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PodcastAudioBundle>;
  if (candidate.episodeId !== episodeId || !Array.isArray(candidate.speeches)) return false;
  if (candidate.speeches.length !== 4) return false;

  const levels = new Set<number>();

  for (const speech of candidate.speeches) {
    if (!isValidSpeech(speech, episodeId)) return false;
    if (levels.has(speech.cognitiveLevel)) return false;
    levels.add(speech.cognitiveLevel);
  }

  return levels.size === 4;
}

export async function loadPodcastAudioManifest(): Promise<Record<string, PodcastAudioBundle>> {
  try {
    const response = await fetch("/podcasts/audio-manifest.json");
    if (!response.ok) return {};

    const raw = (await response.json()) as unknown;
    if (!raw || typeof raw !== "object") return {};

    const validated: Record<string, PodcastAudioBundle> = {};

    for (const [episodeId, value] of Object.entries(raw as Record<string, unknown>)) {
      if (isValidBundle(value, episodeId)) {
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
  cognitiveLevels: Record<string, Record<string, string>>;
};
