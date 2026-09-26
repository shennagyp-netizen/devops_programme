import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("continuous fixed cognitive podcast architecture", () => {
  it("keeps the co-teacher outside the lesson mode switch", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonPanel).toContain("<PodcastCoach lesson={lesson} />");
    expect(lessonPanel).toContain(
      'type Mode = "learn" | "do" | "recall" | "design" | "assessment"'
    );
    expect(lessonPanel).not.toContain('type Mode = "listen"');
    expect(lessonPanel).not.toContain('item === "listen"');
  });

  it("models four fixed authored speeches instead of playback-rate variants", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("Four authored speeches. Four cognitive levels.");
    expect(podcastCoach).toContain('COGNITIVE_LEVELS');
    expect(podcastCoach).toContain("Foundation");
    expect(podcastCoach).toContain("Mechanism");
    expect(podcastCoach).toContain("Diagnosis");
    expect(podcastCoach).toContain("Design & transfer");
    expect(podcastCoach).toContain("The private tutor is separate.");
    expect(podcastCoach).toContain(
      "does not rewrite or regenerate these speeches."
    );
  });

  it("uses one complete audio file for the selected cognitive level", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audioManifest.audioUrl");
    expect(podcastCoach).toContain("audioRef");
    expect(podcastCoach).toContain("selectCognitiveLevel");
    expect(podcastCoach).not.toContain("audioManifest.segments");
    expect(podcastCoach).not.toContain("currentSegmentIndex");
    expect(podcastCoach).not.toContain("handleSegmentEnded");
  });

  it("uses the real audio clock and never estimates timing from text", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audioRef.current.currentTime");
    expect(podcastCoach).toContain(
      "Math.round(audioRef.current.currentTime * 1000)"
    );
    expect(podcastCoach).toContain("findCurrentTurnId(audioManifest, timeMs)");
    expect(podcastCoach).toContain("findActiveCue(audioManifest, timeMs)");
    expect(podcastCoach).not.toMatch(/words?\.length/);
    expect(podcastCoach).not.toMatch(/text\.length/);
    expect(podcastCoach).not.toContain("wordsPerMinute");
    expect(podcastCoach).not.toContain("averageSpeakingRate");
    expect(podcastCoach).not.toContain("playbackRate");
  });

  it("does not implement cognitive levels as TTS playback speed", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).not.toContain("PLAYBACK_SPEEDS");
    expect(podcastCoach).not.toContain("Podcast playback speed");
    expect(podcastCoach).toContain("cognitive podcast level");
    expect(podcastCoach).toContain("changing the explanation itself");
  });

  it("keeps the entire selected speech transcript visible and highlights its active section", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('aria-label="Podcast transcript"');
    expect(podcastCoach).toContain("transcript-list");
    expect(podcastCoach).toContain("transcript-turn");
    expect(podcastCoach).toContain(
      'className={"transcript-turn" + (index === turnIndex ? " active" : "")}'
    );
    expect(podcastCoach).toContain(
      'aria-current={index === turnIndex ? "true" : undefined}'
    );
    expect(podcastCoach).toContain("scrollIntoView");
  });

  it("keeps fixed audio fail-closed and falls back to the authored speech", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");
    const sync = source("src/data/podcastSync.ts");

    expect(sync).toContain("if (!response.ok) return {}");
    expect(sync).toContain("catch {");
    expect(sync).toContain("return {}");
    expect(podcastCoach).toContain('audioSyncState === "guided"');
    expect(podcastCoach).toContain("audioSyncState === "media-error"");
    expect(podcastCoach).toContain(
      "The authored speech remains available."
    );
  });

  it("keeps video/content feed independent from voice ownership", () => {
    const lessonFeed = source("src/components/LessonContentFeed.tsx");
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonFeed).not.toContain("PodcastCoach");
    expect(lessonFeed).not.toContain("<audio");
    expect(lessonFeed).toContain("<video");
    expect(lessonPanel).toContain("<PodcastCoach lesson={lesson} />");
    expect(lessonPanel).toContain(
      "<LessonContentFeed blocks={lesson.content.blocks} />"
    );
  });

  it("does not create a separate listen mode or LLM-generated podcast mode", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");
    expect(podcastCoach).not.toContain('type VoicePhase = "listen"');
    expect(podcastCoach).not.toContain("listen mode");
    expect(podcastCoach).toContain("The private tutor is separate.");
  });
});
