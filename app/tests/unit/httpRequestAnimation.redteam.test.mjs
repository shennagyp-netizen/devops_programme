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

    const packet = httpRequestAnimation.primitives.find(
      (primitive) => primitive.kind === "packet"
    );
    expect(packet).toMatchObject({
      id: "http-request",
      from: "browser",
      to: "api"
    });
  });

  it("keeps the reference diagram free of collision failures", () => {
    const result = validateAnimationDefinition(httpRequestAnimation);
    expect(result.valid).toBe(true);
  });
});
