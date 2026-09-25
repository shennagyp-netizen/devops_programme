"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AnimationDefinitionV1, AnimationTimedCueV1 } from "../animations";
import { AnimationStage, animationPreviewDurationMs, clampAnimationPreviewTime } from "../animations";

type AnimationPlaygroundProps = {
  definition: AnimationDefinitionV1;
  cues: readonly AnimationTimedCueV1[];
};

function formatTime(timeMs: number): string {
  const seconds = Math.floor(timeMs / 1000);
  const milliseconds = Math.floor(timeMs % 1000);
  return (seconds + "." + String(milliseconds).padStart(3, "0") + "s");
}

export function AnimationPlayground({ definition, cues }: AnimationPlaygroundProps) {
  const durationMs = useMemo(() => animationPreviewDurationMs(cues), [cues]);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const frameRef = useRef<number | null>(null);
  const lastFrameMsRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying || durationMs <= 0) {
      return undefined;
    }

    const tick = (frameMs: number) => {
      const previous = lastFrameMsRef.current ?? frameMs;
      const deltaMs = Math.max(0, Math.min(frameMs - previous, 100));
      lastFrameMsRef.current = frameMs;

      setCurrentTimeMs((previousTimeMs) => {
        const nextTimeMs = clampAnimationPreviewTime(previousTimeMs + deltaMs, durationMs);
        if (nextTimeMs >= durationMs) {
          setIsPlaying(false);
        }
        return nextTimeMs;
      });

      frameRef.current = requestAnimationFrame(tick);
    };

    lastFrameMsRef.current = null;
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      lastFrameMsRef.current = null;
    };
  }, [durationMs, isPlaying]);

  useEffect(() => {
    setCurrentTimeMs(0);
    setIsPlaying(false);
  }, [definition.id]);

  const progressPercent = durationMs > 0 ? (currentTimeMs / durationMs) * 100 : 0;

  const seek = (timeMs: number) => {
    setCurrentTimeMs(clampAnimationPreviewTime(timeMs, durationMs));
  };

  return (
    <section className="animation-playground" aria-labelledby="animation-playground-title">
      <div className="animation-playground-head">
        <div>
          <div className="eyebrow">STANDALONE ANIMATION</div>
          <h2 id="animation-playground-title">{definition.title}</h2>
          <p>{definition.accessibility.description}</p>
        </div>
        <div className="animation-playground-id" data-animation-id={definition.id}>
          {definition.id}
        </div>
      </div>

      <AnimationStage definition={definition} cues={[...cues]} currentTimeMs={currentTimeMs} />

      <div className="animation-controls" aria-label="Animation controls">
        <div className="animation-control-buttons">
          <button
            className="primary"
            type="button"
            onClick={() => setIsPlaying(true)}
            disabled={isPlaying || durationMs <= 0}
          >
            Play
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => setIsPlaying(false)}
            disabled={!isPlaying}
          >
            Pause
          </button>
          <button
            className="secondary"
            type="button"
            onClick={() => {
              setCurrentTimeMs(0);
              setIsPlaying(false);
            }}
          >
            Restart
          </button>
        </div>

        <label className="animation-timeline">
          <span className="eyebrow">Timeline</span>
          <input
            type="range"
            min={0}
            max={durationMs}
            step={10}
            value={currentTimeMs}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Animation timeline"
            style={{ backgroundSize: progressPercent + "% 100%" }}
          />
          <span className="animation-time">
            {formatTime(currentTimeMs)} / {formatTime(durationMs)}
          </span>
        </label>

        <div className="animation-preview-note">
          <strong>Preview clock only.</strong> This page owns a local requestAnimationFrame clock.
          The reusable animation runtime remains stateless and does not own audio, persistence or curriculum state.
        </div>
      </div>
    </section>
  );
}
