import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("continuous voice architecture", () => {
  it("keeps the co-teacher outside the lesson mode switch", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");

    expect(lessonPanel).toContain("<PodcastCoach");
    expect(lessonPanel).toContain('type Mode = "learn" | "do" | "recall" | "design" | "assessment"');
    expect(lessonPanel).not.toContain('type Mode = "learn" | "listen"');
    expect(lessonPanel).not.toContain('"listen"');
    expect(lessonPanel).not.toContain('item === "listen"');
  });

  it("renders all learner modes without remounting the co-teacher", () => {
    const lessonPanel = source("src/components/LessonPanel.tsx");
    const coachIndex = lessonPanel.indexOf("<PodcastCoach");
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
    expect(podcastCoach).toContain("Your voice guide stays with the lesson.");
    expect(podcastCoach).toContain("One voice layer for the whole lesson");
    expect(podcastCoach).toContain("There is no separate listening mode.");
    expect(podcastCoach).toContain("same voice session remains attached to this lesson");
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

  it("attaches and cleans up all audio event listeners", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    for (const event of ["timeupdate", "play", "pause", "ended"]) {
      expect(podcastCoach).toContain('addEventListener("' + event + '"');
      expect(podcastCoach).toContain('removeEventListener("' + event + '"');
    }
    expect(podcastCoach).toContain("return () => {");
  });

  it("pauses before learner action and resumes the same audio element", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("audio.pause();");
    expect(podcastCoach).toContain("function resumeVoice()");
    expect(podcastCoach).toContain("audioRef.current?.play()");
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

  it("keeps browser autoplay as an initial-gesture concern only", () => {
    const podcastCoach = source("src/components/PodcastCoach.tsx");

    expect(podcastCoach).toContain("The browser may require one click before audio can start.");
    expect(podcastCoach).toContain("After that first interaction");
    expect(podcastCoach).toContain("until you change lessons or explicitly pause it");
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
    expect(lessonPanel).toContain("<PodcastCoach");
    expect(lessonPanel).toContain("<LessonContentFeed blocks={lesson.content.blocks} />");
  });
});
