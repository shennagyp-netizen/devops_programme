import { describe, expect, it } from "vitest";
import {
  buildDefaultLessonContent,
  getLessonContent,
  validateLessonContent
} from "../../src/data/lessonContent.ts";

const validIllustration = {
  id: "visual",
  type: "illustration",
  heading: "Flow",
  alt: "A simple flow",
  bindingId: "TEST:visual",
  nodes: ["A", "B", "C"]
};

function validVideo(overrides = {}) {
  return {
    id: "video",
    type: "video",
    heading: "Demo",
    status: "published",
    src: "/course-content/demo.mp4",
    durationMs: 3000,
    ...overrides
  };
}

describe("lesson content validation red-team contract", () => {
  it.each([
    [null, "content must be an object"],
    [42, "content must be an object"],
    ["text", "content must be an object"],
    [{}, "content version must be 1"],
    [{ version: 1 }, "content blocks must be a non-empty array"],
    [{ version: 2, blocks: [] }, "content blocks must be a non-empty array"]
  ])("fails closed for malformed top-level payload %#", (payload, expected) => {
    const result = validateLessonContent(payload);
    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain(expected);
  });

  it("rejects non-object blocks and blocks without stable ids", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [
        null,
        {},
        { id: "  ", type: "text", body: "x" }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.failures).toEqual(
      expect.arrayContaining([
        "content block must be an object",
        "content block id is required"
      ])
    );
  });

  it("rejects unknown block kinds instead of silently rendering them", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [
        {
          id: "unknown",
          type: "interactive-terminal-widget"
        }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain(
      "unsupported content block type"
    );
  });

  it("rejects duplicate block ids even across different block kinds", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [
        { id: "same", type: "text", body: "first" },
        { ...validIllustration, id: "same" }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain("duplicate block id");
  });

  it("requires non-empty text body", () => {
    for (const body of ["", "   ", null]) {
      const result = validateLessonContent({
        version: 1,
        blocks: [{ id: "text", type: "text", body }]
      });
      expect(result.valid).toBe(false);
      expect(result.failures.join(" ")).toContain("must have body text");
    }
  });

  it("requires accessible and structurally usable illustrations", () => {
    const cases = [
      { ...validIllustration, heading: "" },
      { ...validIllustration, alt: " " },
      { ...validIllustration, nodes: [] },
      { ...validIllustration, nodes: ["A", ""] },
      { ...validIllustration, nodes: ["A", 7] }
    ];

    for (const block of cases) {
      const result = validateLessonContent({
        version: 1,
        blocks: [block]
      });
      expect(result.valid).toBe(false);
      expect(result.failures.join(" ")).toMatch(
        /illustration block visual needs (a heading|alt text|nodes|non-empty string nodes)/
      );
    }
  });

  it("accepts a well-formed illustration without optional caption", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [validIllustration]
    });
    expect(result).toEqual({ valid: true, failures: [] });
  });

  it("accepts root-relative and HTTPS published video sources", () => {
    for (const src of ["/course/video.mp4", "/video.mp4?rev=2", "https://cdn.example.com/video.mp4"]) {
      const result = validateLessonContent({
        version: 1,
        blocks: [validVideo({ src })]
      });
      expect(result).toEqual({ valid: true, failures: [] });
    }
  });

  it("rejects unsafe, ambiguous, or non-HTTPS media sources", () => {
    for (const src of [
      "http://cdn.example.com/video.mp4",
      "//cdn.example.com/video.mp4",
      "javascript:alert(1)",
      "data:text/plain,hello",
      "video.mp4"
    ]) {
      const result = validateLessonContent({
        version: 1,
        blocks: [validVideo({ src })]
      });
      expect(result.valid).toBe(false);
      expect(result.failures.join(" ")).toContain("video source is invalid");
    }
  });

  it("allows a draft video with an empty source, but never an unsafe draft source", () => {
    expect(
      validateLessonContent({
        version: 1,
        blocks: [validVideo({ status: "draft", src: "" })]
      })
    ).toEqual({ valid: true, failures: [] });

    const result = validateLessonContent({
      version: 1,
      blocks: [validVideo({ status: "draft", src: "javascript:alert(1)" })]
    });

    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain("video source is invalid");
  });

  it("requires a source for published video", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [validVideo({ status: "published", src: "" })]
    });

    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain("published video source is missing");
  });

  it("rejects invalid video status values", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [validVideo({ status: "publishing" })]
    });

    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain("invalid status");
  });

  it("rejects unsafe poster and caption sources", () => {
    for (const field of ["poster", "captionsSrc"]) {
      const result = validateLessonContent({
        version: 1,
        blocks: [
          validVideo({
            [field]: "//cdn.example.com/unsafe"
          })
        ]
      });

      expect(result.valid).toBe(false);
      expect(result.failures.join(" ")).toMatch(
        field === "poster" ? /video poster is invalid/ : /video captions source is invalid/
      );
    }
  });

  it("accepts optional poster and caption sources when they are safe", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [
        validVideo({
          poster: "/course/video.webp",
          captionsSrc: "https://cdn.example.com/video.vtt"
        })
      ]
    });

    expect(result).toEqual({ valid: true, failures: [] });
  });

  it("rejects zero, negative, infinite and NaN durations", () => {
    for (const durationMs of [0, -1, Number.POSITIVE_INFINITY, Number.NaN]) {
      const result = validateLessonContent({
        version: 1,
        blocks: [validVideo({ durationMs })]
      });

      expect(result.valid).toBe(false);
      expect(result.failures.join(" ")).toContain("video duration is invalid");
    }
  });

  it("accepts omitted video duration when the asset is still a valid published source", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [validVideo({ durationMs: undefined })]
    });

    expect(result).toEqual({ valid: true, failures: [] });
  });

  it("rejects malformed, duplicate, decreasing and out-of-range cues", () => {
    const cases = [
      { id: "", label: "x", startMs: 0 },
      { id: "x", label: "", startMs: 0 },
      { id: "x", label: "x", startMs: -1 },
      { id: "x", label: "x", startMs: Number.NaN },
      { id: "x", label: "x", startMs: 100, endMs: 99 },
      { id: "x", label: "x", startMs: 3500 },
      { id: "x", label: "x", startMs: 100, endMs: 3500 }
    ];

    for (const cue of cases) {
      const result = validateLessonContent({
        version: 1,
        blocks: [validVideo({ cues: [cue] })]
      });
      expect(result.valid).toBe(false);
      expect(result.failures.join(" ")).toMatch(/video cue|cue exceeds duration/);
    }

    const duplicate = validateLessonContent({
      version: 1,
      blocks: [
        validVideo({
          cues: [
            { id: "same", label: "one", startMs: 100 },
            { id: "same", label: "two", startMs: 200 }
          ]
        })
      ]
    });
    expect(duplicate.valid).toBe(false);
    expect(duplicate.failures.join(" ")).toContain("duplicate video cue id");

    const decreasing = validateLessonContent({
      version: 1,
      blocks: [
        validVideo({
          cues: [
            { id: "one", label: "one", startMs: 300 },
            { id: "two", label: "two", startMs: 200 }
          ]
        })
      ]
    });
    expect(decreasing.valid).toBe(false);
  });

  it("accepts monotonic cue timing with optional end times", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [
        validVideo({
          durationMs: 5000,
          cues: [
            { id: "one", label: "one", startMs: 0, endMs: 1000 },
            { id: "two", label: "two", startMs: 1000 },
            { id: "three", label: "three", startMs: 4000, endMs: 5000 }
          ]
        })
      ]
    });

    expect(result).toEqual({ valid: true, failures: [] });
  });
});

describe("lesson content generation and programme integration", () => {
  it("generates deterministic default content for the same lesson seed", () => {
    const seed = {
      id: "B1.1",
      title: "The App Is Slow",
      objective: "Separate symptom from cause.",
      humanExample: "Start with evidence."
    };

    expect(buildDefaultLessonContent(seed)).toEqual(
      buildDefaultLessonContent(seed)
    );
  });

  it("changes generated content when the lesson seed changes", () => {
    const first = buildDefaultLessonContent({
      id: "B1.1",
      title: "First",
      objective: "First objective",
      humanExample: "First example"
    });
    const second = buildDefaultLessonContent({
      id: "B1.2",
      title: "Second",
      objective: "Second objective",
      humanExample: "Second example"
    });

    expect(first).not.toEqual(second);
  });

  it("keeps the authored B1.4 stream ordered and draft-safe", () => {
    const content = getLessonContent({
      id: "B1.4",
      title: "Why Containers Exist",
      objective: "See the problem containers solve.",
      humanExample: "Two kitchens can share one building."
    });

    expect(content.blocks.map((block) => block.type)).toEqual([
      "text",
      "illustration",
      "video"
    ]);
    expect(content.blocks[2]).toMatchObject({
      id: "b1-4-video",
      status: "draft",
      src: ""
    });
    expect(validateLessonContent(content)).toEqual({
      valid: true,
      failures: []
    });
  });

  it("returns generated content for unknown lesson ids without mutating the seed", () => {
    const seed = {
      id: "TEST.1",
      title: "Test lesson",
      objective: "Test objective",
      humanExample: "Test example"
    };

    const before = JSON.stringify(seed);
    const result = getLessonContent(seed);

    expect(JSON.stringify(seed)).toBe(before);
    expect(result.blocks.length).toBeGreaterThanOrEqual(2);
    expect(validateLessonContent(result)).toEqual({
      valid: true,
      failures: []
    });
  });

  it("has stable unique ids within every generated lesson stream", () => {
    const seeds = [
      ["A1", "A", "objective", "example"],
      ["A2", "B", "objective", "example"],
      ["X9", "C", "objective", "example"]
    ];

    for (const [id, title, objective, humanExample] of seeds) {
      const content = buildDefaultLessonContent({
        id,
        title,
        objective,
        humanExample
      });
      const ids = content.blocks.map((block) => block.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
