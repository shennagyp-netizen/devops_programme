import { describe, expect, it } from "vitest";
import { animationLibrary, getAnimation } from "../../src/animations/library.ts";
import { validateAnimationDefinition } from "../../src/animations/contracts.ts";

describe("animation library", () => {
  it("contains the first reference animation", () => {
    const animation = getAnimation("http-request");
    expect(animation).toBeDefined();
    expect(animation?.id).toBe("http-request");
  });

  it("keeps every registered animation contract-valid", () => {
    for (const animation of animationLibrary) {
      expect(validateAnimationDefinition(animation), animation.id).toEqual({
        valid: true,
        failures: []
      });
    }
  });

  it("does not expose duplicate animation identities", () => {
    const ids = animationLibrary.map((animation) => animation.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
