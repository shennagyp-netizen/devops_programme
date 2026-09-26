import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("continuous voice architecture", () => {
  it("keeps the co-teacher outside the lesson mode switch", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonPanel).toContain("<PodcastCoach lesson={lesson} />");
    expect(lessonPanel).toContain('type Mode = "learn" | "do" | "recall" | "design" | "assessment"');
    expect(lessonPanel).not.toContain('type Mode = "learn" | "listen"');
    expect(lessonPanel).not.toContain('"listen"');
    expect(lessonPanel).not.toContain('item === "listen"');
  });

  it("renders all learner modes without remounting the co-teacher", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");
    const coachIndex = lessonPanel.indexOf("<PodcastCoach lesson={lesson} />");
    const modeTabsIndex = lessonPanel.indexOf('className="mode-tabs"');
    const learnIndex = lessonPanel.indexOf('mode === "learn"');

    expect(coachIndex).toBeGreaterThanOrEqual(0);
    expect(modeTabsIndex).toBeGreaterThan(coachIndex);
    expect(learnIndex).toBeGreaterThan(coachIndex);
    expect(lessonPanel).toContain("[\"learn\", \"do\", \"recall\", \"design\", \"assessment\"]");
  });

  it("does not encode a separate listening mode in the voice component", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("CO-TEACHER · CONTINUOUS");
    expect(podcastCoach).toContain("The authored conversation stays the same.");
    expect(podcastCoach).toContain("One fixed co-teacher for the whole lesson");
    expect(podcastCoach).toContain("The private tutor is a separate learner-specific conversation.");
    expect(podcastCoach).toContain("fixed recording reached the end of its authored timeline");
    expect(podcastCoach).toContain("Continue voice");
  });

  it("models only persistent lesson voice phases", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");
    const phasePattern =
      /type VoicePhase =\s*\| "ready"\s*\| "speaking"\s*\| "coach"\s*\| "learner-action"\s*\| "done"/;

    expect(podcastCoach).toMatch(phasePattern);
    expect(podcastCoach).not.toContain('type VoicePhase = "listen"');
    expect(podcastCoach).not.toContain('setPhase("lab")');
    expect(podcastCoach).not.toContain('setPhase("recall")');
  });

  it("maps authored prediction, lab and recall cues to deliberate pauses", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('prediction: "coach"');
    expect(podcastCoach).toContain('lab: "learner-action"');
    expect(podcastCoach).toContain('recall: "learner-action"');
    expect(podcastCoach).toContain("const activeCue = findActiveCue");
    expect(podcastCoach).toContain("audio.pause()");
    expect(podcastCoach).toContain("setAudioPlaying(false)");
    expect(podcastCoach).toContain("setPhase(nextPhase)");
  });

  it("treats the voice pause as an authored learner-action boundary rather than episode termination", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('phase === "learner-action"');
    expect(podcastCoach).toContain("The voice pauses here deliberately.");
    expect(podcastCoach).toContain("Use Learn, Do, Recall, Design or Assessment without losing the co-teacher session.");
    expect(podcastCoach).toContain("onClick={resumeVoice}");
    expect(podcastCoach).toContain('setPhase("done")');
    expect(podcastCoach).not.toContain("Now stop listening and work on the system");
  });

  it("uses the real audio clock for transcript and authored cue synchronization", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audio.currentTime");
    expect(podcastCoach).toContain("Math.round(audio.currentTime * 1000)");
    expect(podcastCoach).toContain("findCurrentTurnId(audioManifest, timeMs)");
    expect(podcastCoach).toContain("findActiveCue(audioManifest, timeMs)");
    expect(podcastCoach).not.toMatch(/words?\.length/);
    expect(podcastCoach).not.toMatch(/text\.length/);
    expect(podcastCoach).not.toContain("setTimeout");
  });

  it("offers an explicit 1x to 2x guided-text pace when aligned audio is unavailable", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("GUIDED_TURN_INTERVAL_MS");
    expect(podcastCoach).toContain("Podcast playback speed");
    expect(podcastCoach).toContain("[1, 1.25, 1.5, 1.75, 2]");
    expect(podcastCoach).toContain("Pause transcript");
    expect(podcastCoach).toContain("Resume transcript");
  });

  it("supports a fixed four-speech manifest and a 1x to 2x playback control", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audioManifest.segments.map");
    expect(podcastCoach).toContain("Four fixed speech files drive the real voice clock and transcript.");
    expect(podcastCoach).toContain("const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 1.75, 2]");
    expect(podcastCoach).toContain('aria-label="Podcast playback speed"');
    expect(podcastCoach).toContain("audio.currentTime");
    expect(podcastCoach).toContain("setAudioTimeMs");
  });

  it("binds all four fixed speech files to real audio elements", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audioManifest.segments.map");
    expect(podcastCoach).toContain("preload="auto"");
    expect(podcastCoach).toContain("onTimeUpdate");
    expect(podcastCoach).toContain("onPlay");
    expect(podcastCoach).toContain("onPause");
    expect(podcastCoach).toContain("onEnded");
  });

  it("pauses before learner action and resumes the current fixed segment", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audio.pause();");
    expect(podcastCoach).toContain("function resumeVoice()");
    expect(podcastCoach).toContain("void audio.play()");
    expect(podcastCoach).toContain("audioRefs.current");
    expect(podcastCoach).not.toContain("new Audio(");
    expect(podcastCoach).not.toContain("new AudioContext(");
  });

  it("resets voice state when the lesson changes and does not carry another lesson's session forward", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain(
      "useEffect(() => {"
    );
    expect(podcastCoach).toContain("setPhase(\"ready\")");
    expect(podcastCoach).toContain("setTurnIndex(0)");
    expect(podcastCoach).toContain("setPrediction(\"\")");
    expect(podcastCoach).toContain("setAudioStarted(false)");
    expect(podcastCoach).toContain("setAudioTimeMs(0)");
    expect(podcastCoach).toContain("lastCueIdRef.current = null");
    expect(podcastCoach).toContain("lastAudioTimeMsRef.current = 0");
    expect(podcastCoach).toContain("[lesson.id, lesson.podcast]");
    expect(podcastCoach).toContain("audioRef.current?.pause()");
  });

  it("handles backward seeking by clearing the consumed-cue guard", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("const movedBackward = timeMs + 250 < lastAudioTimeMsRef.current;");
    expect(podcastCoach).toContain("if (movedBackward) lastCueIdRef.current = null;");
    expect(podcastCoach).toContain("lastCueIdRef.current = null;");
  });

  it("does not infer audio timing from lesson text", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).not.toMatch(/Math\.max\(1,.*text/i);
    expect(podcastCoach).not.toMatch(/text\.split\(/);
    expect(podcastCoach).not.toMatch(/wordsPerMinute/i);
    expect(podcastCoach).not.toMatch(/averageSpeakingRate/i);
  });

  it("requires an explicit learner gesture to start playback", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("Start the fixed voice lesson");
    expect(podcastCoach).toContain("function startVoice()");
    expect(podcastCoach).toContain("void audio.play()");
  });

  it("provides explicit controls without creating a second voice session", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain('aria-label="Rewind 10 seconds"');
    expect(podcastCoach).toContain('aria-label="Forward 10 seconds"');
    expect(podcastCoach).toContain("Pause voice");
    expect(podcastCoach).toContain("Resume voice");
    expect(podcastCoach).toContain("Replay voice");
    expect(podcastCoach).not.toContain("listen mode");
  });

  it("keeps video content independent from voice ownership", () => {
    const lessonFeed = source("src/components/LessonContentFeed.tsx");
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonFeed).not.toContain("PodcastCoach");
    expect(lessonFeed).not.toContain("<audio");
    expect(lessonFeed).toContain("<video");
    expect(lessonPanel).toContain("<PodcastCoach lesson={lesson} />");
    expect(lessonPanel).toContain("<LessonContentFeed blocks={lesson.content.blocks} />");
  });
});
