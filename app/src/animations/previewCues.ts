import type { AnimationTimedCueV1 } from "./runtime";
import { httpRequestPlayback } from "./examples/httpRequestPlayback";

const previewCuesByAnimationId: Readonly<Record<string, readonly AnimationTimedCueV1[]>> = {
  "http-request": httpRequestPlayback
};

export function getAnimationPreviewCues(animationId: string): readonly AnimationTimedCueV1[] {
  return previewCuesByAnimationId[animationId] ?? [];
}
