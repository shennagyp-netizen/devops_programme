import { useEffect, useMemo, useRef, useState } from "react";
import type { Lesson } from "../data/curriculum";
import {
  findActiveCue,
  findCurrentSegment,
  findCurrentTurnId,
  loadPodcastAudioManifest,
  type PodcastCueKind,
  type PodcastAudioManifest
} from "../data/podcastSync";
import {
  getEpisodeText,
  parseTurns,
  podcastUrl,
  type Turn
} from "../data/podcastsRaw";
import { useLessonVoiceClock } from "./LessonVoiceClock";

type VoicePhase =
  | "ready"
  | "speaking"
  | "coach"
  | "learner-action"
  | "done";

const cueToPhase: Partial<Record<PodcastCueKind, VoicePhase>> = {
  prediction: "coach",
  lab: "learner-action",
  recall: "learner-action"
};

const GUIDED_TURN_INTERVAL_MS = 6500;
const PLAYBACK_SPEEDS = [1, 1.25, 1.5, 1.75, 2] as const;
type PlaybackSpeed = typeof PLAYBACK_SPEEDS[number];

export function PodcastCoach({ lesson }: { lesson: Lesson }) {
  const voiceClock = useLessonVoiceClock();
  const publishVoiceClock = voiceClock?.publishVoiceClock;

  const [phase, setPhase] = useState<VoicePhase>("ready");
  const [turnIndex, setTurnIndex] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [episodeSource, setEpisodeSource] = useState("");
  const [audioTimeMs, setAudioTimeMs] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioStarted, setAudioStarted] = useState(false);
  const [guidedPlaying, setGuidedPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [scriptVersions, setScriptVersions] = useState<Record<string, string>>({});
  const [audioManifests, setAudioManifests] = useState<Record<string, PodcastAudioManifest>>({});
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);

  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const transcriptRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastCueIdRef = useRef<string | null>(null);
  const lastAudioTimeMsRef = useRef(0);

  const rawAudioManifest = audioManifests[lesson.id];
  const scriptVersion = scriptVersions[lesson.id];
  const audioManifest =
    rawAudioManifest && scriptVersion === rawAudioManifest.scriptVersion
      ? rawAudioManifest
      : undefined;

  const audioSyncState =
    rawAudioManifest && !scriptVersion
      ? "checking"
      : audioManifest
        ? "voice-synced"
        : rawAudioManifest
          ? "stale-audio"
          : "guided";

  useEffect(() => {
    let cancelled = false;

    setPhase("ready");
    setTurnIndex(0);
    setPrediction("");
    setEpisodeSource("");
    setAudioTimeMs(0);
    setAudioPlaying(false);
    setAudioStarted(false);
    setGuidedPlaying(false);
    setCurrentSegmentIndex(0);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;

    Object.values(audioRefs.current).forEach((audio) => audio?.pause());
    audioRefs.current = {};

    Promise.all([
      fetch(podcastUrl(lesson.podcast)).then((response) =>
        response.ok ? response.text() : ""
      ),
      fetch("/podcasts/manifest.json")
        .then((response) =>
          response.ok
            ? (response.json() as Promise<{
                schemaVersion: number;
                source: string;
                episodes: Record<string, string>;
              }>)
            : { schemaVersion: 0, source: "", episodes: {} }
        )
        .catch(() => ({ schemaVersion: 0, source: "", episodes: {} }))
    ])
      .then(([text, manifest]) => {
        if (!cancelled) {
          setEpisodeSource(text);
          setScriptVersions(manifest.episodes ?? {});
        }
        return loadPodcastAudioManifest();
      })
      .then((manifests) => {
        if (!cancelled) setAudioManifests(manifests);
      })
      .catch(() => {
        if (!cancelled) {
          setEpisodeSource("");
          setScriptVersions({});
          setAudioManifests({});
        }
      });

    return () => {
      cancelled = true;
      Object.values(audioRefs.current).forEach((audio) => audio?.pause());
    };
  }, [lesson.id, lesson.podcast]);

  const episode = useMemo(
    () => getEpisodeText(episodeSource, lesson.id),
    [episodeSource, lesson.id]
  );

  const turns = useMemo(
    () => parseTurns(episode, lesson.id),
    [episode, lesson.id]
  );

  const current: Turn | undefined = turns[turnIndex];

  useEffect(() => {
    if (audioManifest || !guidedPlaying || turns.length === 0) return;

    const interval = window.setInterval(() => {
      setTurnIndex((index) => {
        if (index >= turns.length - 1) {
          setGuidedPlaying(false);
          setPhase("done");
          return index;
        }
        return index + 1;
      });
    }, GUIDED_TURN_INTERVAL_MS / playbackSpeed);

    return () => window.clearInterval(interval);
  }, [audioManifest, guidedPlaying, playbackSpeed, turns.length]);

  useEffect(() => {
    if (current) {
      transcriptRefs.current[current.id]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [current?.id]);

  function activeAudio() {
    if (!audioManifest) return null;
    return audioRefs.current[audioManifest.segments[currentSegmentIndex]?.id ?? ""] ?? null;
  }

  function pauseAllAudio() {
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) {
        audio.pause();
        audio.playbackRate = playbackSpeed;
      }
    });
    setAudioPlaying(false);
  }

  function syncFromAudio(segmentIndex: number) {
    if (!audioManifest) return;
    const segment = audioManifest.segments[segmentIndex];
    const audio = audioRefs.current[segment.id];
    if (!audio || segmentIndex !== currentSegmentIndex) return;

    const timeMs = Math.min(
      segment.endMs,
      Math.round(segment.startMs + audio.currentTime * 1000)
    );
    const movedBackward = timeMs + 250 < lastAudioTimeMsRef.current;

    if (movedBackward) lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = timeMs;
    setAudioTimeMs(timeMs);
    publishVoiceClock?.({ timeMs, manifest: audioManifest });

    const currentTurnId = findCurrentTurnId(audioManifest, timeMs);
    if (currentTurnId) {
      const targetIndex = turns.findIndex((turn) => turn.id === currentTurnId);
      if (targetIndex >= 0) setTurnIndex(targetIndex);
    }

    const currentSegment = findCurrentSegment(audioManifest, timeMs);
    if (currentSegment) {
      const targetSegmentIndex = audioManifest.segments.findIndex(
        (candidate) => candidate.id === currentSegment.id
      );
      if (targetSegmentIndex >= 0 && targetSegmentIndex !== currentSegmentIndex) {
        setCurrentSegmentIndex(targetSegmentIndex);
      }
    }

    const activeCue = findActiveCue(audioManifest, timeMs);
    if (!activeCue || activeCue.id === lastCueIdRef.current) return;

    lastCueIdRef.current = activeCue.id;
    const nextPhase = cueToPhase[activeCue.kind];
    if (!nextPhase) return;

    pauseAllAudio();
    setPhase(nextPhase);
  }

  function handleSegmentEnded(segmentIndex: number) {
    if (!audioManifest || segmentIndex !== currentSegmentIndex) return;

    const nextIndex = segmentIndex + 1;
    setAudioPlaying(false);

    if (nextIndex >= audioManifest.segments.length) {
      setAudioTimeMs(audioManifest.durationMs);
      publishVoiceClock?.({
        timeMs: audioManifest.durationMs,
        manifest: audioManifest
      });
      setPhase("done");
      return;
    }

    const nextSegment = audioManifest.segments[nextIndex];
    const nextAudio = audioRefs.current[nextSegment.id];

    setCurrentSegmentIndex(nextIndex);
    setTurnIndex(
      Math.max(
        0,
        turns.findIndex((turn) => turn.id === nextSegment.turnId)
      )
    );

    if (nextAudio) {
      nextAudio.currentTime = 0;
      nextAudio.playbackRate = playbackSpeed;
      setAudioStarted(true);
      setPhase("speaking");
      void nextAudio.play().catch(() => setAudioPlaying(false));
    }
  }

  function startVoice() {
    if (!audioManifest) {
      setAudioStarted(true);
      setPhase("speaking");
      setGuidedPlaying(true);
      return;
    }

    const audio = activeAudio();
    if (!audio) return;

    pauseAllAudio();
    audio.playbackRate = playbackSpeed;
    setAudioStarted(true);
    setPhase("speaking");
    void audio.play().catch(() => setAudioPlaying(false));
  }

  function toggleVoice() {
    if (!audioManifest) {
      setAudioStarted(true);
      setPhase("speaking");
      setGuidedPlaying((playing) => !playing);
      return;
    }

    const audio = activeAudio();
    if (!audio) return;

    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      startVoice();
    }
  }

  function seek(deltaSeconds: number) {
    if (!audioManifest) return;

    const wasPlaying = audioPlaying;
    const nextTime = Math.max(
      0,
      Math.min(audioManifest.durationMs, audioTimeMs + deltaSeconds * 1000)
    );

    if (nextTime >= audioManifest.durationMs) {
      reset();
      return;
    }

    const target = findCurrentSegment(audioManifest, nextTime);
    if (!target) return;

    pauseAllAudio();

    const targetIndex = audioManifest.segments.findIndex(
      (segment) => segment.id === target.id
    );
    const targetAudio = audioRefs.current[target.id];
    if (!targetAudio || targetIndex < 0) return;

    setCurrentSegmentIndex(targetIndex);
    targetAudio.currentTime = Math.max(0, (nextTime - target.startMs) / 1000);
    targetAudio.playbackRate = playbackSpeed;
    setAudioTimeMs(Math.round(nextTime));
    lastAudioTimeMsRef.current = Math.round(nextTime);
    lastCueIdRef.current = null;

    const targetTurnIndex = turns.findIndex((turn) => turn.id === target.turnId);
    if (targetTurnIndex >= 0) setTurnIndex(targetTurnIndex);

    if (wasPlaying) {
      setPhase("speaking");
      setAudioStarted(true);
      void targetAudio.play().catch(() => setAudioPlaying(false));
    }
  }

  function resumeVoice() {
    setPhase("speaking");

    if (audioManifest) {
      const audio = activeAudio();
      if (audio) {
        audio.playbackRate = playbackSpeed;
        void audio.play().catch(() => setAudioPlaying(false));
      }
      return;
    }

    setGuidedPlaying(true);
  }

  function reset() {
    pauseAllAudio();
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.currentTime = 0;
    });

    setPhase("ready");
    setTurnIndex(0);
    setPrediction("");
    setAudioStarted(false);
    setAudioTimeMs(0);
    setGuidedPlaying(false);
    setCurrentSegmentIndex(0);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;
  }

  function onPlaybackSpeedChange(value: string) {
    const speed = Number(value) as PlaybackSpeed;
    setPlaybackSpeed(speed);
    Object.values(audioRefs.current).forEach((audio) => {
      if (audio) audio.playbackRate = speed;
    });
  }

  return (
    <aside
      className="podcast-coach podcast-coach-continuous"
      aria-label="Continuous fixed co-teacher"
    >
      <div className="coach-banner">
        <div>
          <span className="eyebrow">CO-TEACHER · FIXED</span>
          <h3>The authored conversation stays the same.</h3>
        </div>
        <div className="coach-phase">
          {phase === "ready"
            ? "ready"
            : phase === "speaking"
              ? "speaking"
              : phase === "coach"
                ? "your prediction"
                : phase === "learner-action"
                  ? "your turn"
                  : "episode complete"}
        </div>
      </div>

      {audioManifest
        ? audioManifest.segments.map((segment) => (
            <audio
              key={segment.id}
              ref={(element) => {
                audioRefs.current[segment.id] = element;
              }}
              src={segment.audioUrl}
              preload="auto"
              className="podcast-audio-source"
              onTimeUpdate={() =>
                syncFromAudio(
                  audioManifest.segments.findIndex((item) => item.id === segment.id)
                )
              }
              onPlay={() => {
                if (segment.id === audioManifest.segments[currentSegmentIndex]?.id) {
                  setAudioPlaying(true);
                  setAudioStarted(true);
                  setPhase("speaking");
                }
              }}
              onPause={() => {
                if (segment.id === audioManifest.segments[currentSegmentIndex]?.id) {
                  setAudioPlaying(false);
                }
              }}
              onEnded={() =>
                handleSegmentEnded(
                  audioManifest.segments.findIndex((item) => item.id === segment.id)
                )
              }
              onLoadedMetadata={(event) => {
                event.currentTarget.playbackRate = playbackSpeed;
              }}
            />
          ))
        : null}

      <div className="continuous-voice-row">
        <div>
          <strong>
            {current ? "Engineer " + current.speaker : "Fixed co-teacher"}
          </strong>
          <span className="range">
            {audioSyncState === "voice-synced"
              ? "Four fixed speech files drive the real voice clock and transcript."
              : audioSyncState === "stale-audio"
                ? "The recording does not match the current script. The transcript remains available."
                : audioSyncState === "checking"
                  ? "Checking that the fixed recording matches the current script."
                  : "No fixed recording is published for this lesson. The authored transcript remains available."}
          </span>
        </div>

        <div className="audio-controls">
          {audioManifest ? (
            <>
              <button onClick={() => seek(-10)} aria-label="Rewind 10 seconds">−10s</button>
              <button className="primary" onClick={toggleVoice}>
                {audioPlaying ? "Pause voice" : audioStarted ? "Resume voice" : "Start voice"}
              </button>
              <button onClick={() => seek(10)} aria-label="Forward 10 seconds">+10s</button>
            </>
          ) : (
            <button className="primary" onClick={toggleVoice}>
              {guidedPlaying ? "Pause transcript" : audioStarted ? "Resume transcript" : "Start transcript"}
            </button>
          )}

          <label className="guided-speed-control">
            <span>Speed</span>
            <select
              aria-label="Podcast playback speed"
              value={playbackSpeed}
              onChange={(event) => onPlaybackSpeedChange(event.target.value)}
            >
              {PLAYBACK_SPEEDS.map((speed) => (
                <option key={speed} value={speed}>{speed}x</option>
              ))}
            </select>
          </label>

          {audioManifest ? (
            <span className="audio-time">
              {Math.floor(audioTimeMs / 1000)}s / {Math.round(audioManifest.durationMs / 1000)}s
            </span>
          ) : null}
        </div>
      </div>

      <div className="continuous-transcript" role="log" aria-label="Podcast transcript">
        <div className="transcript-header">
          <span className="eyebrow">PODCAST TRANSCRIPT</span>
          <span className="range">
            {audioManifest
              ? "Live position follows the fixed recording."
              : "Transcript mode remains available without audio."}
          </span>
        </div>

        <div className="transcript-list">
          {turns.map((turn, index) => (
            <div
              key={turn.id}
              ref={(element) => {
                transcriptRefs.current[turn.id] = element;
              }}
              className={"transcript-turn" + (index === turnIndex ? " active" : "")}
              aria-current={index === turnIndex ? "true" : undefined}
            >
              <span className="transcript-speaker">Engineer {turn.speaker}</span>
              <p>{turn.text}</p>
            </div>
          ))}
        </div>
      </div>

      {phase === "ready" ? (
        <div className="content-card continuous-prompt">
          <h4>One fixed co-teacher for the whole lesson</h4>
          <p>
            The spoken lesson is authored once. Playback can be faster or slower,
            but the educational content does not change.
          </p>
          <p>
            The private tutor is a separate learner-specific conversation. It
            does not rewrite or regenerate this podcast.
          </p>
          {audioSyncState === "voice-synced" ? (
            <button className="primary" onClick={startVoice}>Start the fixed voice lesson</button>
          ) : null}
        </div>
      ) : null}

      {phase === "coach" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">YOUR PREDICTION</span>
          <h4>Say it before the co-teacher continues.</h4>
          <p>{lesson.recall[1] ?? lesson.recall[0]}</p>
          <textarea
            value={prediction}
            onChange={(event) => setPrediction(event.target.value)}
            placeholder="Explain your prediction in your own words."
          />
          <button className="primary" disabled={!prediction.trim()} onClick={resumeVoice}>
            Continue with the co-teacher
          </button>
        </div>
      ) : null}

      {phase === "learner-action" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">YOUR TURN</span>
          <h4>Work with the learner controls, then return to the voice.</h4>
          <p>
            The fixed voice pauses here deliberately. Use Learn, Do, Recall,
            Design or Assessment without losing the co-teacher session.
          </p>
          <button className="primary" onClick={resumeVoice}>Continue voice</button>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">VOICE SESSION COMPLETE</span>
          <h4>The fixed recording reached the end of its authored timeline.</h4>
          <button className="secondary" onClick={reset}>Replay voice</button>
        </div>
      ) : null}
    </aside>
  );
}
