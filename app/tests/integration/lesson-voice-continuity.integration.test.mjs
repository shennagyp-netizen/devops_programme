import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("continuous fixed TTS explanation architecture", () => {
  it("keeps the co-teacher outside the lesson mode switch", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonPanel).toContain("<PodcastCoach lesson={lesson} />");
    expect(lessonPanel).toContain(
      'type Mode = "learn" | "do" | "recall" | "design" | "assessment"'
    );
    expect(lessonPanel).not.toContain('type Mode = "listen"');
  });

  it("models one podcast with four explanation levels", () => {
    const coach = source("src/components/PodcastCoach.tsx");
    const sync = source("src/data/podcastSync.ts");

    expect(coach).toContain("One podcast. Four explanation levels.");
    expect(coach).toContain("Very simple");
    expect(coach).toContain("Simple technical");
    expect(coach).toContain("Professional");
    expect(coach).toContain("Expert");
    expect(coach).toContain("SpeechSynthesisUtterance");
    expect(sync).toContain("PodcastExplanationLevel");
    expect(sync).toContain("PodcastTtsSpeech");
    expect(coach).not.toContain("audioUrl");
    expect(coach).not.toContain("AudioManifest");
  });

  it("keeps speech speed independent from explanation level", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).toContain("TTS speech speed");
    expect(coach).toContain("PODCAST_SPEECH_RATES");
    expect(coach).toContain("1.25");
    expect(coach).toContain("utterance.rate = speechRateRef.current");
    expect(coach).toContain("speakTurn(restartIndex, sessionId)");
    expect(coach).toContain("This explanation contains the complete authored information");
    expect(coach).toContain("The explanation style changes; the information does not.");
    expect(coach).toContain("selectSpeechRate(rate: PodcastSpeechRate)");
  });

  it("does not skip or branch learning content by speech rate", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).not.toMatch(/speechRate[^\n]*turns\.slice/);
    expect(coach).not.toMatch(/speechRate[^\n]*turnIndex/);
    expect(coach).not.toMatch(/speechRate[^\n]*skip/);
    expect(coach).toContain("const turn = turns[index]");
    expect(coach).toContain("new SpeechSynthesisUtterance(turn.text)");
  });

  it("uses runtime TTS events rather than invented recording timestamps", () => {
    const coach = source("src/components/PodcastCoach.tsx");
    const animation = source("src/data/lessonVoiceAnimation.ts");

    expect(coach).toContain("utterance.onstart");
    expect(coach).toContain("utterance.onend");
    expect(coach).toContain("publishVoiceClock");
    expect(animation).toContain("runtime speech timing");
    expect(animation).not.toContain("averageSpeakingRate");
  });

  it("keeps the selected complete transcript visible", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).toContain('aria-label="Podcast transcript"');
    expect(coach).toContain("transcript-list");
    expect(coach).toContain("transcript-turn");
    expect(coach).toContain("scrollIntoView");
    expect(coach).toContain(
      'aria-current={index === turnIndex ? "true" : undefined}'
    );
  });

  it("keeps private tutoring outside podcast generation", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).toContain("The private tutor is separate.");
    expect(coach).toContain("never rewrites or regenerates these podcast scripts");
  });

  it("keeps the transcript usable when browser TTS is unavailable", () => {
    const coach = source("src/components/PodcastCoach.tsx");

    expect(coach).toContain("TTS is unavailable in this browser");
    expect(coach).toContain("fixed authored script remains readable");
  });
});
