import { describe, expect, it } from "vitest";
import { httpRequestAnimation } from "../../src/animations/scenarios/httpRequest.ts";
import { validateAnimationDefinition } from "../../src/animations/contracts.ts";

describe("HTTP request animation red team", () => {
  it("has only approved roles and primitives", () => {
    const failures = validateAnimationDefinition(httpRequestAnimation).failures.join(" ");
    expect(failures).toBe("");
  });

  it("uses unique geometry IDs and explicit request path", () => {
    const primitiveIds = httpRequestAnimation.primitives.map((primitive) => primitive.id);
    expect(new Set(primitiveIds).size).toBe(primitiveIds.length);

    const packets = httpRequestAnimation.primitives.filter(
      (primitive) => primitive.kind === "packet"
    );
    expect(packets).toHaveLength(2);
    expect(packets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "request-browser-gateway",
          from: "browser",
          to: "gateway"
        }),
        expect.objectContaining({
          id: "request-gateway-api",
          from: "gateway",
          to: "api"
        })
      ])
    );
  });

  it("keeps the reference diagram free of collision failures", () => {
    const result = validateAnimationDefinition(httpRequestAnimation);
    expect(result.valid).toBe(true);
  });
});
