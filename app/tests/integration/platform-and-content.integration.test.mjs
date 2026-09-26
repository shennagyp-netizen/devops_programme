import { describe, expect, it } from "vitest";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { courseLessons } from "../../src/data/courseLessons.ts";
import { windowsCommands, commandForPlatform } from "../../src/data/platformAdapters.ts";
import { parseTurns, getEpisodeText } from "../../src/data/podcastsRaw.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const podcastRoot = path.resolve(here, "../../../podcasts");

describe("platform and spoken-content integration", () => {
  it("has a Windows adapter for every authored lesson", () => {
    for (const lesson of courseLessons) {
      expect(windowsCommands[lesson.id]).toBeTruthy();
      expect(commandForPlatform(lesson, "windows")).toBe(windowsCommands[lesson.id]);
    }
  });

  it("keeps every authored lesson marked script-ready", () => {
    expect(courseLessons).toHaveLength(53);
    expect(courseLessons.every((lesson) => lesson.podcastStatus === "script-ready")).toBe(true);
  });

  it("contains all 53 episode scripts", async () => {
    const expectedIds = courseLessons.map((lesson) => lesson.id);
    const files = [
      ...(await readdir(path.join(podcastRoot, "beginner"))).filter((name) => name.endsWith(".txt") && !/\.cognitive-[1-4]\.txt$/i.test(name)),
      ...(await readdir(path.join(podcastRoot, "advanced"))).filter((name) => name.endsWith(".txt"))
    ];
    const grouped = [
      await readFile(path.join(podcastRoot, "day-1.txt"), "utf8"),
      await readFile(path.join(podcastRoot, "day-2.txt"), "utf8"),
      await readFile(path.join(podcastRoot, "day-3.txt"), "utf8"),
      await readFile(path.join(podcastRoot, "day-4.txt"), "utf8"),
      await readFile(path.join(podcastRoot, "day-5.txt"), "utf8")
    ];

    expect(files).toHaveLength(21);
    const intermediateText = grouped.join("\\n");
    for (const lesson of courseLessons) {
      const source =
        lesson.id.startsWith("B")
          ? await readFile(path.join(podcastRoot, "beginner", lesson.id + ".txt"), "utf8")
          : lesson.id.startsWith("A")
            ? await readFile(path.join(podcastRoot, "advanced", lesson.id + ".txt"), "utf8")
            : intermediateText;

      const episode = getEpisodeText(source, lesson.id);
      expect(episode.length).toBeGreaterThan(100);
      expect(parseTurns(episode, lesson.id).length).toBeGreaterThan(4);
    }
  });

  it("preserves prediction, lab and recall cues in spoken scripts", async () => {
    const sample = await readFile(path.join(podcastRoot, "beginner", "B1.2.txt"), "utf8");
    const turns = parseTurns(sample, "B1.2");

    expect(turns.some((turn) => turn.kind === "prediction")).toBe(true);
    expect(turns.some((turn) => turn.kind === "lab")).toBe(true);
    expect(turns.some((turn) => turn.kind === "recall")).toBe(true);
  });
});
