import { describe, expect, it } from "vitest";
import { lessonsByCourse } from "../../src/data/courseLessons.ts";
import { validateLessonContent } from "../../src/data/lessonContent.ts";

describe("course lesson content integration", () => {
  const allLessons = Object.values(lessonsByCourse).flat();

  it("attaches a content stream to every course lesson", () => {
    expect(allLessons.length).toBeGreaterThan(0);
    for (const lesson of allLessons) {
      expect(lesson.content, lesson.id).toBeDefined();
      expect(lesson.content.version, lesson.id).toBe(1);
      expect(lesson.content.blocks.length, lesson.id).toBeGreaterThan(0);
    }
  });

  it("keeps every current lesson content stream valid", () => {
    for (const lesson of allLessons) {
      expect(validateLessonContent(lesson.content), lesson.id).toEqual({
        valid: true,
        failures: []
      });
    }
  });

  it("keeps content ids unique inside each lesson", () => {
    for (const lesson of allLessons) {
      const ids = lesson.content.blocks.map((block) => block.id);
      expect(new Set(ids).size, lesson.id).toBe(ids.length);
    }
  });

  it("does not accidentally create the same object instance for separate generated lessons", () => {
    const lessonsWithContent = allLessons.filter((lesson) => lesson.id !== "B1.4");
    expect(lessonsWithContent.length).toBeGreaterThan(2);

    for (let index = 1; index < lessonsWithContent.length; index += 1) {
      expect(lessonsWithContent[index].content).not.toBe(
        lessonsWithContent[index - 1].content
      );
    }
  });

  it("keeps the explicit authored video only where it is intended", () => {
    const videoLessons = allLessons.filter((lesson) =>
      lesson.content.blocks.some((block) => block.type === "video")
    );

    expect(videoLessons.map((lesson) => lesson.id)).toEqual(["B1.4"]);
    expect(videoLessons[0].content.blocks.at(-1)).toMatchObject({
      id: "b1-4-video",
      type: "video",
      status: "draft"
    });
  });

  it("preserves text-first and illustration-second default ordering", () => {
    for (const lesson of allLessons.filter((item) => item.id !== "B1.4")) {
      expect(lesson.content.blocks[0].type, lesson.id).toBe("text");
      expect(lesson.content.blocks[1].type, lesson.id).toBe("illustration");
    }
  });
  it("uses the authored incident-loop visual for B3.2", () => {
    const lesson = allLessons.find((item) => item.id === "B3.2");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "b3-2-incident",
      bindingId: "B3.2:b3-2-incident",
      variant: "incident-loop-v1"
    });
  });

  it("uses the authored queue-state visual for B3.1", () => {
    const lesson = allLessons.find((item) => item.id === "B3.1");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "b3-1-queue",
      bindingId: "B3.1:b3-1-queue",
      variant: "queue-state-v1"
    });
  });

  it("uses the authored recovery visual for B2.3", () => {
    const lesson = allLessons.find((item) => item.id === "B2.3");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "b2-3-recovery",
      bindingId: "B2.3:b2-3-recovery",
      variant: "backup-recovery-v1"
    });
  });

  it("uses the authored observability visual for B2.2", () => {
    const lesson = allLessons.find((item) => item.id === "B2.2");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "b2-2-observability",
      bindingId: "B2.2:b2-2-observability",
      variant: "observability-diagnosis-v1"
    });
  });

  it("uses the authored safe-delivery visual for B2.1", () => {
    const lesson = allLessons.find((item) => item.id === "B2.1");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "b2-1-safe-delivery",
      bindingId: "B2.1:b2-1-safe-delivery",
      variant: "delivery-pipeline-v1"
    });
  });

  it("uses the authored repeatability visual for B1.5", () => {
    const lesson = allLessons.find((item) => item.id === "B1.5");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "b1-5-repeatability",
      bindingId: "B1.5:b1-5-repeatability",
      variant: "repeatable-service-v1"
    });
  });

  it("keeps B1.2 and B1.3 semantic visuals in their own lesson streams", () => {
    const b12 = allLessons.find((item) => item.id === "B1.2");
    const b13 = allLessons.find((item) => item.id === "B1.3");

    expect(b12?.content.blocks.map((block) => block.id)).toEqual([
      "b1-2-problem",
      "b1-2-request-path"
    ]);
    expect(b12?.content.blocks[1]).toMatchObject({
      variant: "request-path-v1",
      bindingId: "B1.2:b1-2-request-path"
    });

    expect(b13?.content.blocks.map((block) => block.id)).toEqual([
      "b1-3-problem",
      "b1-3-request-stack"
    ]);
    expect(b13?.content.blocks[1]).toMatchObject({
      variant: "https-stack-v1",
      bindingId: "B1.3:b1-3-request-stack"
    });

    expect(b12?.content.blocks.some((block) => block.id.startsWith("b1-4-"))).toBe(false);
    expect(b13?.content.blocks.some((block) => block.id.startsWith("b1-4-"))).toBe(false);
  });

  it("uses the authored service execution-context visual for D1.3", () => {
    const lesson = allLessons.find((item) => item.id === "D1.3");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "d1-3-service-context",
      bindingId: "D1.3:d1-3-service-context",
      variant: "service-permission-model-v1"
    });
  });

  it("uses the authored terminal-composition visual for D1.2", () => {
    const lesson = allLessons.find((item) => item.id === "D1.2");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "d1-2-terminal-tool",
      bindingId: "D1.2:d1-2-terminal-tool",
      variant: "terminal-composition-v1"
    });
  });

  it("uses the authored Linux operating model visual for D1.1", () => {
    const lesson = allLessons.find((item) => item.id === "D1.1");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "d1-1-linux-model",
      bindingId: "D1.1:d1-1-linux-model",
      variant: "linux-operating-model-v1"
    });
  });

  it("uses the authored process-diagnosis visual for B1.1", () => {
    const lesson = allLessons.find((item) => item.id === "B1.1");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "b1-1-process-diagnosis",
      bindingId: "B1.1:b1-1-process-diagnosis",
      variant: "process-diagnosis-v1"
    });
  });

  it("uses the authored container-boundary visual for B1.4", () => {
    const lesson = allLessons.find((item) => item.id === "B1.4");
    expect(lesson).toBeDefined();

    const illustration = lesson.content.blocks.find(
      (block) => block.type === "illustration"
    );

    expect(illustration).toMatchObject({
      id: "b1-4-isolation",
      bindingId: "B1.4:b1-4-isolation",
      variant: "container-boundary-v1"
    });
  });

  it("requires every illustration block to carry its curriculum binding identity", () => {
    for (const lesson of allLessons) {
      for (const block of lesson.content.blocks) {
        if (
          block.type === "illustration" ||
          block.type === "interactive-illustration"
        ) {
          expect(block.bindingId, `${lesson.id}:${block.id}`).toBe(
            `${lesson.id}:${block.id}`
          );
        }
      }
    }
  });

});
