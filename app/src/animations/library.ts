import type { AnimationDefinitionV1 } from "./contracts";
import { httpRequestAnimation } from "./scenarios/httpRequest";

export const animationLibrary: readonly AnimationDefinitionV1[] = [
  httpRequestAnimation
];

export function getAnimation(animationId: string): AnimationDefinitionV1 | undefined {
  return animationLibrary.find((animation) => animation.id === animationId);
}
