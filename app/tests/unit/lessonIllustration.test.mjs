import { describe, expect, it } from "vitest";
import {
  getLessonIllustrationModel,
  validateLessonIllustrationModel
} from "../../src/data/lessonIllustration.ts";

describe("lesson illustration teaching model", () => {
  it("turns the B1.4 container visual into a concrete causal model", () => {
    const model = getLessonIllustrationModel({
      id: "b1-4-isolation",
      type: "illustration",
      heading: "The isolation boundary",
      alt: "A container starts from an image, runs a process, and shares the host kernel",
      bindingId: "B1.4:b1-4-isolation",
      nodes: ["Image", "Container", "Process"],
      variant: "container-boundary-v1",
      caption: "Image, container and process are different layers."
    });

    expect(model.variant).toBe("container-boundary-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "image",
      "container",
      "process"
    ]);
    expect(model.foundation.label).toBe("Shared host kernel");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "persistent-data",
      "published-port"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "process-listening",
      "container-port",
      "host-port",
      "network-path"
    ]);
  });

  it("does not silently invent a specialized visual for unknown lessons", () => {
    const model = getLessonIllustrationModel({
      id: "generic",
      type: "illustration",
      heading: "A generic flow",
      alt: "A generic causal flow",
      bindingId: "generic:visual",
      nodes: ["Problem", "Mechanism", "Evidence"]
    });

    expect(model.variant).toBe("causal-flow-v1");
    expect(model.stages.map((stage) => stage.label)).toEqual([
      "Problem",
      "Mechanism",
      "Evidence"
    ]);
    expect(model.foundation).toBeUndefined();
  });
});


  it("fails closed for an unknown authored illustration variant", () => {
    expect(
      getLessonIllustrationModel({
        id: "bad",
        type: "illustration",
        heading: "Bad",
        alt: "Bad visual",
        bindingId: "bad:visual",
        nodes: ["A", "B"],
        variant: "unknown-v9"
      })
    ).toMatchObject({
      variant: "causal-flow-v1"
    });
  });


  it("rejects an invalid model shape instead of rendering arbitrary data", () => {
    expect(
      validateLessonIllustrationModel({
        version: 1,
        variant: "not-real",
        stages: []
      })
    ).toEqual({
      valid: false,
      failures: [
        "illustration model variant is invalid",
        "illustration model needs at least two stages"
      ]
    });
  });
