"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { PodcastExplanationLevel } from "../data/podcastSync";

export type VoiceClock = {
  explanationLevel: PodcastExplanationLevel;
  turnId?: string;
  elapsedMs: number;
  state: "idle" | "speaking" | "paused" | "done";
};

type VoiceClockContextValue = VoiceClock & {
  publishVoiceClock: (clock: VoiceClock) => void;
};

const initialClock: VoiceClock = {
  explanationLevel: 1,
  elapsedMs: 0,
  state: "idle"
};

const VoiceClockContext = createContext<VoiceClockContextValue | undefined>(
  undefined
);

export function LessonVoiceClockProvider({ children }: { children: ReactNode }) {
  const [clock, setClock] = useState<VoiceClock>(initialClock);
  const value = useMemo(
    () => ({ ...clock, publishVoiceClock: setClock }),
    [clock]
  );

  return (
    <VoiceClockContext.Provider value={value}>
      {children}
    </VoiceClockContext.Provider>
  );
}

export function useLessonVoiceClock() {
  return useContext(VoiceClockContext);
}
