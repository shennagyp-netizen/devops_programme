import type { AnimationTimedCueV1 } from "./runtime";

const DEFAULT_PREVIEW_DURATION_MS = 4_000;
const PREVIEW_SETTLE_MS = 1_400;

export function clampAnimationPreviewTime(timeMs: number, durationMs: number): number {
  if (!Number.isFinite(timeMs) || !Number.isFinite(durationMs) || durationMs <= 0) {
    return 0;
  }

  return Math.min(Math.max(timeMs, 0), durationMs);
}

export function animationPreviewDurationMs(cues: readonly AnimationTimedCueV1[]): number {
  const latestCueMs = cues.reduce(
    (latest, cue) => Math.max(latest, Number.isFinite(cue.startMs) ? cue.startMs : 0),
    0
  );

  if (latestCueMs === 0) {
    return DEFAULT_PREVIEW_DURATION_MS;
  }

  return latestCueMs + PREVIEW_SETTLE_MS;
}
