import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("continuous fixed podcast architecture", () => {
  it("keeps the co-teacher outside the lesson mode switch", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonPanel).toContain("<PodcastCoach lesson={lesson} />");
    expect(lessonPanel).toContain(
      'type Mode = "learn" | "do" | "recall" | "design" | "assessment"'
    );
    expect(lessonPanel).not.toContain('type Mode = "learn" | "listen"');
    expect(lessonPanel).not.toContain('item === "listen"');
  });

  it("models the podcast as fixed authored content with a separate private tutor", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('CO-TEACHER · FIXED');
    expect(podcastCoach).toContain("The authored conversation stays the same.");
    expect(podcastCoach).toContain(
      "The private tutor is a separate learner-specific conversation."
    );
    expect(podcastCoach).toContain(
      "does not rewrite or regenerate this podcast."
    );
  });

  it("supports four fixed speech segments on one shared timeline", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audioManifest.segments.map");
    expect(podcastCoach).toContain("findCurrentSegment(audioManifest, timeMs)");
    expect(podcastCoach).toContain("handleSegmentEnded");
    expect(podcastCoach).toContain("const nextIndex = segmentIndex + 1");
  });

  it("uses the real audio clock and never estimates timing from text", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audio.currentTime");
    expect(podcastCoach).toContain("Math.round(segment.startMs + audio.currentTime * 1000)");
    expect(podcastCoach).toContain("findCurrentTurnId(audioManifest, timeMs)");
    expect(podcastCoach).toContain("findActiveCue(audioManifest, timeMs)");
    expect(podcastCoach).not.toMatch(/words?\\.length/);
    expect(podcastCoach).not.toMatch(/text\\.length/);
    expect(podcastCoach).not.toContain("wordsPerMinute");
    expect(podcastCoach).not.toContain("averageSpeakingRate");
  });

  it("offers 1x through 2x playback speed for fixed audio and fallback transcript", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain(
      "const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 1.75, 2]"
    );
    expect(podcastCoach).toContain('aria-label="Podcast playback speed"');
    expect(podcastCoach).toContain("audio.playbackRate = speed");
    expect(podcastCoach).toContain(
      "GUIDED_TURN_INTERVAL_MS / playbackSpeed"
    );
  });

  it("keeps the entire transcript visible and highlights the active turn", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('aria-label="Podcast transcript"');
    expect(podcastCoach).toContain("transcript-list");
    expect(podcastCoach).toContain("transcript-turn");
    expect(podcastCoach).toContain('className={"transcript-turn" + (index === turnIndex ? " active" : "")}');
    expect(podcastCoach).toContain('aria-current={index === turnIndex ? "true" : undefined}');
    expect(podcastCoach).toContain("scrollIntoView");
  });

  it("pauses at authored learner-action cues and resumes the same fixed segment", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('prediction: "coach"');
    expect(podcastCoach).toContain('lab: "learner-action"');
    expect(podcastCoach).toContain('recall: "learner-action"');
    expect(podcastCoach).toContain("pauseAllAudio()");
    expect(podcastCoach).toContain("function resumeVoice()");
    expect(podcastCoach).toContain("void audio.play()");
  });

  it("resets the voice session when the lesson changes", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('setPhase("ready")');
    expect(podcastCoach).toContain("setTurnIndex(0)");
    expect(podcastCoach).toContain('setPrediction("")');
    expect(podcastCoach).toContain("setAudioStarted(false)");
    expect(podcastCoach).toContain("setAudioTimeMs(0)");
    expect(podcastCoach).toContain("setCurrentSegmentIndex(0)");
    expect(podcastCoach).toContain("audioRefs.current = {}");
    expect(podcastCoach).toContain("[lesson.id, lesson.podcast]");
  });

  it("keeps the fixed-audio path fail-closed", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");
    const sync = source("src/data/podcastSync.ts");

    expect(sync).toContain("if (!response.ok) return {}");
    expect(sync).toContain("catch {");
    expect(sync).toContain("return {}");
    expect(podcastCoach).toContain('audioSyncState === "guided"');
    expect(podcastCoach).toContain(
      "No fixed recording is published for this lesson."
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

  it("does not create a separate listen mode", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");
    expect(podcastCoach).not.toContain('type VoicePhase = "listen"');
    expect(podcastCoach).not.toContain("listen mode");
  });
});
