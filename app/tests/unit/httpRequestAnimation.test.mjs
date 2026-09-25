import { describe, expect, it } from "vitest";
import { httpRequestAnimation } from "../../src/animations/scenarios/httpRequest.ts";
import { httpRequestPlayback } from "../../src/animations/examples/httpRequestPlayback.ts";
import { animationTimelineAt } from "../../src/animations/runtime.ts";

describe("HTTP request reference animation", () => {
  it("moves the first request hop from browser to gateway", () => {
    const snapshot = animationTimelineAt(
      httpRequestAnimation,
      httpRequestPlayback,
      1350
    );

    expect(snapshot.packets["request-browser-gateway"]).toMatchObject({
      phase: "traveling",
      from: "browser",
      to: "gateway"
    });

    expect(snapshot.packets["request-browser-gateway"].progress).toBeCloseTo(
      0.5,
      3
    );
  });

  it("starts the second hop from the gateway on its own authored cue", () => {
    const snapshot = animationTimelineAt(
      httpRequestAnimation,
      httpRequestPlayback,
      2450
    );

    expect(snapshot.packets["request-browser-gateway"].phase).toBe("complete");
    expect(snapshot.packets["request-gateway-api"]).toMatchObject({
      phase: "traveling",
      from: "gateway",
      to: "api"
    });
    expect(snapshot.targets.api?.status).toBe("neutral");
  });

  it("changes API semantic state at the authored voice cue", () => {
    const snapshot = animationTimelineAt(
      httpRequestAnimation,
      httpRequestPlayback,
      3000
    );

    expect(snapshot.targets.api?.status).toBe("active");
  });

  it("reconstructs the exact same reference state after a direct seek", () => {
    const first = animationTimelineAt(
      httpRequestAnimation,
      httpRequestPlayback,
      3200
    );
    const second = animationTimelineAt(
      httpRequestAnimation,
      httpRequestPlayback,
      3200
    );

    expect(second).toEqual(first);
  });
});
