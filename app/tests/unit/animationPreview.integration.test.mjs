import { describe, expect, it } from "vitest";
import { clampAnimationPreviewTime, animationPreviewDurationMs } from "../../src/animations/preview";

describe("animation preview clock contract", () => {
  it("clamps negative and over-duration seek positions", () => {
    expect(clampAnimationPreviewTime(-20, 5000)).toBe(0);
    expect(clampAnimationPreviewTime(2600, 5000)).toBe(2600);
    expect(clampAnimationPreviewTime(7000, 5000)).toBe(5000);
  });

  it("never returns a negative duration", () => {
    expect(animationPreviewDurationMs([])).toBe(0);
  });

  it("derives duration from the latest cue plus the animation settle window", () => {
    expect(
      animationPreviewDurationMs([
        { voiceCueId: "a", startMs: 1000, eventIds: ["x"] },
        { voiceCueId: "b", startMs: 3000, eventIds: ["y"] }
      ])
    ).toBeGreaterThan(3000);
  });
});
