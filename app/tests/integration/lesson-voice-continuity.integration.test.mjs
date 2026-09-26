import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("continuous fixed TTS cognitive podcast architecture", () => {
  it("keeps the co-teacher outside the lesson mode switch", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonPanel).toContain("<PodcastCoach lesson={lesson} />");
    expect(lessonPanel).toContain(
      'type Mode = "learn" | "do" | "recall" | "design" | "assessment"'
    );
    expect(lessonPanel).not.toContain('type Mode = "listen"');
  });

  it("defines one podcast with four authored cognitive versions", () => {
    const coach = source("src/components/PodcastCoach.tsx");
    const sync = source("src/data/podcastSync.ts");

    expect(coach).toContain("One podcast. Four cognitive versions.");
    expect(coach).toContain("COGNITIVE_LEVELS");
    expect(coach).toContain("SpeechSynthesisUtterance");
    expect(coach).toContain("Start TTS");
    expect(sync).toContain("PodcastTtsSpeech");
    expect(sync).toContain("buildPodcastTtsBundle");
    expect(coach).not.toContain("audioManifest");
    expect(coach).not.toContain("audioUrl");
    expect(coach).not.toContain("playbackRate");
  });

  it("uses cognitive level as authored content, not speaking speed", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).toContain("changing the explanation itself");
    expect(coach).toContain("The difference is cognitive depth, not speaking speed.");
    expect(coach).not.toContain("PLAYBACK_SPEEDS");
    expect(coach).not.toContain("Podcast playback speed");
    expect(coach).not.toContain("1.25");
    expect(coach).not.toContain("1.5");
    expect(coach).not.toContain("1.75");
    expect(coach).not.toContain("2x");
  });

  it("uses runtime TTS events for voice progress rather than invented audio timing", () => {
    const coach = source("src/components/PodcastCoach.tsx");
    const animation = source("src/data/lessonVoiceAnimation.ts");

    expect(coach).toContain("utterance.onstart");
    expect(coach).toContain("utterance.onend");
    expect(coach).toContain("publishVoiceClock");
    expect(animation).toContain("does not synthesize");
    expect(animation).toContain("runtime start/end/boundary events");
    expect(animation).not.toContain("averageSpeakingRate");
  });

  it("keeps the entire selected cognitive transcript visible and highlights the speaking turn", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).toContain('aria-label="Podcast transcript"');
    expect(coach).toContain("transcript-list");
    expect(coach).toContain("transcript-turn");
    expect(coach).toContain("scrollIntoView");
    expect(coach).toContain('aria-current={index === turnIndex ? "true" : undefined}');
  });

  it("keeps private tutoring outside podcast generation", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).toContain("The private tutor is separate.");
    expect(coach).toContain("never rewrites or regenerates these podcast scripts");
  });

  it("has a transcript fallback when browser TTS is unavailable", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).toContain("TTS is unavailable in this browser");
    expect(coach).toContain("fixed authored script remains readable");
  });
});
