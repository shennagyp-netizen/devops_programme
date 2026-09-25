import type { AnimationTimedCueV1 } from "../runtime";

export const httpRequestPlayback: AnimationTimedCueV1[] = [
  {
    voiceCueId: "browser-sends-request",
    startMs: 1000,
    eventIds: ["send-browser-gateway"]
  },
  {
    voiceCueId: "gateway-forwards-request",
    startMs: 2100,
    eventIds: ["send-gateway-api"]
  },
  {
    voiceCueId: "api-receives-request",
    startMs: 3000,
    eventIds: ["activate-api"]
  }
];
