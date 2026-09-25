import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("continuous voice architecture", () => {
  it("keeps the co-teacher outside the lesson mode switch", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonPanel).toContain("<PodcastCoach lesson={lesson} />");
    expect(lessonPanel).not.toContain('"listen"');
    expect(lessonPanel).not.toContain('item === "listen"');
  });

  it("does not encode a separate listening mode in the voice component", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("CO-TEACHER · CONTINUOUS");
    expect(podcastCoach).toContain("same voice session remains attached to this lesson");
    expect(podcastCoach).toContain("voice pauses here deliberately");
    expect(podcastCoach).toContain("Continue voice");
  });

  it("treats the voice pause as an authored learner-action boundary rather than episode termination", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('setPhase(nextPhase);');
    expect(podcastCoach).toContain('setPhase("done")');
    expect(podcastCoach).toContain('phase === "learner-action"');
    expect(podcastCoach).not.toContain("Now stop listening and work on the system");
  });
});
