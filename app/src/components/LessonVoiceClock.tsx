"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { PodcastAudioManifest } from "../data/podcastSync";

type VoiceClock = { timeMs: number; manifest?: PodcastAudioManifest };
type VoiceClockContextValue = VoiceClock & { publishVoiceClock: (clock: VoiceClock) => void };

const VoiceClockContext = createContext<VoiceClockContextValue | undefined>(undefined);

export function LessonVoiceClockProvider({ children }: { children: ReactNode }) {
  const [clock, setClock] = useState<VoiceClock>({ timeMs: 0 });
  const value = useMemo(() => ({ ...clock, publishVoiceClock: setClock }), [clock]);
  return <VoiceClockContext.Provider value={value}>{children}</VoiceClockContext.Provider>;
}

export function useLessonVoiceClock() {
  return useContext(VoiceClockContext);
}
