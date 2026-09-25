import { describe, expect, it } from "vitest";
import {
  buildDefaultLessonContent,
  getLessonContent,
  validateLessonContent,
  type LessonContent
} from "../../src/data/lessonContent.ts";
import { lessonsByCourse } from "../../src/data/courseLessons.ts";

describe("lesson content stream contract", () => {
  it("supports an ordered text, illustration and video stream", () => {
    const content: LessonContent = {
      version: 1,
      blocks: [
        {
          id: "intro",
          type: "text",
          heading: "Why containers exist",
          body: "Start with the operational problem."
        },
        {
          id: "flow",
          type: "illustration",
          heading: "The isolation boundary",
          alt: "Image to container to process flow",
          nodes: ["Image", "Container", "Process"]
        },
        {
          id: "demo",
          type: "video",
          heading: "Container demonstration",
          status: "published",
          src: "/course-content/B1.4/container-demo.mp4",
          durationMs: 240000
        }
      ]
    };

    expect(validateLessonContent(content)).toEqual({
      valid: true,
      failures: []
    });
    expect(content.blocks.map((block) => block.id)).toEqual([
      "intro",
      "flow",
      "demo"
    ]);
  });

  it("rejects duplicate block ids and invalid published video sources", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [
        {
          id: "same",
          type: "text",
          body: "One"
        },
        {
          id: "same",
          type: "video",
          heading: "Bad video",
          status: "published",
          src: "javascript:alert(1)"
        }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain("duplicate block id");
    expect(result.failures.join(" ")).toContain("published video source");

    const protocolRelative = validateLessonContent({
      version: 1,
      blocks: [
        {
          id: "video",
          type: "video",
          heading: "Protocol relative",
          status: "published",
          src: "//cdn.example.com/video.mp4"
        }
      ]
    });

    expect(protocolRelative.valid).toBe(false);
  });

  it("rejects impossible video timing metadata", () => {
    const result = validateLessonContent({
      version: 1,
      blocks: [
        {
          id: "video",
          type: "video",
          heading: "Demo",
          status: "published",
          src: "/course-content/demo.mp4",
          durationMs: 1000,
          cues: [
            { id: "c1", label: "Start", startMs: 600, endMs: 400 }
          ]
        }
      ]
    });

    expect(result.valid).toBe(false);
    expect(result.failures.join(" ")).toContain("video cue");
  });

  it("provides a deterministic default feed for lessons without authored blocks", () => {
    const content = buildDefaultLessonContent({
      id: "B1.1",
      title: "The App Is Slow — Where Do We Look?",
      objective: "Separate symptom from cause.",
      humanExample: "Start with evidence."
    });

    expect(content.version).toBe(1);
    expect(content.blocks.map((block) => block.type)).toEqual([
      "text",
      "illustration"
    ]);
    expect(content.blocks[0]).toMatchObject({
      type: "text",
      heading: "Why this matters"
    });
  });
});


describe("programme lesson content integration", () => {
  it("keeps every current lesson content stream valid", () => {
    for (const lessons of Object.values(lessonsByCourse)) {
      for (const lesson of lessons) {
        const result = validateLessonContent(lesson.content);
        expect(result, lesson.id).toEqual({ valid: true, failures: [] });
      }
    }
  });

  it("keeps the explicit B1.4 video authoring slot inside the ordered stream", () => {
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
      type: "video",
      status: "draft"
    });
  });
});
