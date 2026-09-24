import { describe, expect, it } from "vitest";
import { courseLessons } from "../../src/data/courseLessons.ts";
import { windowsCommands, commandForPlatform } from "../../src/data/platformAdapters.ts";
import { podcastEpisodes, getEpisodeText } from "../../src/data/podcastsRaw.ts";

describe("platform and content integration", () => {
  it("has a Windows adapter for every authored lesson", () => {
    for (const lesson of courseLessons) {
      expect(windowsCommands[lesson.id]).toBeTruthy();
      expect(commandForPlatform(lesson, "windows")).toBe(
        windowsCommands[lesson.id]
      );
    }
  });

  it("keeps every authored lesson backed by a spoken script status", () => {
    expect(courseLessons).toHaveLength(53);
    expect(courseLessons.every((lesson) => lesson.podcastStatus === "script-ready")).toBe(true);
  });

  it("parses every known spoken episode into non-empty turns", () => {
    expect(podcastEpisodes.length).toBeGreaterThanOrEqual(53);

    for (const episode of podcastEpisodes) {
      const text = getEpisodeText(episode);
      expect(text.length).toBeGreaterThan(100);
    }
  });
});
