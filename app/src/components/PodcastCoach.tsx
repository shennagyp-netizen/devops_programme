import { useEffect, useMemo, useRef, useState } from "react";
import type { Lesson } from "../data/curriculum";
import {
  findActiveCue,
  findCurrentTurnId,
  loadPodcastAudioManifest,
  type PodcastAudioBundle,
  type PodcastAudioManifest,
  type PodcastCognitiveLevel,
  type PodcastCueKind
} from "../data/podcastSync";
import {
  cognitivePodcastUrl,
  type Turn
} from "../data/podcastsRaw";
import { useLessonVoiceClock } from "./LessonVoiceClock";

type VoicePhase =
  | "ready"
  | "speaking"
  | "coach"
  | "learner-action"
  | "done";

type ScriptManifest = {
  schemaVersion: number;
  source: string;
  episodes: Record<string, string>;
  cognitiveLevels?: Record<string, Record<string, string>>;
};

const cueToPhase: Partial<Record<PodcastCueKind, VoicePhase>> = {
  prediction: "coach",
  lab: "learner-action",
  recall: "learner-action"
};

const GUIDED_TURN_INTERVAL_MS = 6500;

const COGNITIVE_LEVELS: ReadonlyArray<{
  level: PodcastCognitiveLevel;
  id: PodcastAudioManifest["cognitiveLevelId"];
  label: string;
  description: string;
}> = [
  {
    level: 1,
    id: "foundation",
    label: "Foundation",
    description: "Simple mental model and purpose."
  },
  {
    level: 2,
    id: "mechanism",
    label: "Mechanism",
    description: "How the system actually works."
  },
  {
    level: 3,
    id: "diagnosis",
    label: "Diagnosis",
    description: "Failure analysis and evidence."
  },
  {
    level: 4,
    id: "design",
    label: "Design & transfer",
    description: "System design and transfer to new cases."
  }
];

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
  const [cognitiveLevel, setCognitiveLevel] = useState<PodcastCognitiveLevel>(1);
  const [scriptVersions, setScriptVersions] = useState<Record<string, string>>({});
  const [audioManifests, setAudioManifests] =
    useState<Record<string, PodcastAudioBundle>>({});
  const [mediaFailed, setMediaFailed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const transcriptRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const lastCueIdRef = useRef<string | null>(null);
  const lastAudioTimeMsRef = useRef(0);

  const rawBundle = audioManifests[lesson.id];
  const rawSpeech = rawBundle?.speeches.find(
    (speech) => speech.cognitiveLevel === cognitiveLevel
  );
  const expectedScriptVersion = scriptVersions[String(cognitiveLevel)];
  const audioManifest =
    rawSpeech &&
    expectedScriptVersion &&
    expectedScriptVersion === rawSpeech.scriptVersion
      ? rawSpeech
      : undefined;

  const audioSyncState =
    mediaFailed
      ? "media-error"
      : rawSpeech && !expectedScriptVersion
        ? "checking"
        : audioManifest
          ? "voice-synced"
          : rawSpeech
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
    setCognitiveLevel(1);
    setScriptVersions({});
    setAudioManifests({});
    setMediaFailed(false);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;
    audioRef.current?.pause();
    audioRef.current = null;

    Promise.all([
      fetch("/podcasts/manifest.json")
        .then((response) =>
          response.ok
            ? (response.json() as Promise<ScriptManifest>)
            : { schemaVersion: 0, source: "", episodes: {}, cognitiveLevels: {} }
        )
        .catch(() => ({
          schemaVersion: 0,
          source: "",
          episodes: {},
          cognitiveLevels: {}
        })),
      loadPodcastAudioManifest()
    ])
      .then(([manifest, audio]) => {
        if (cancelled) return;

        setScriptVersions(manifest.cognitiveLevels?.[lesson.id] ?? {});
        setAudioManifests(audio);
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
      audioRef.current?.pause();
    };
  }, [lesson.id, lesson.podcast]);

  useEffect(() => {
    let cancelled = false;

    setPhase("ready");
    setEpisodeSource("");
    setTurnIndex(0);
    setPrediction("");
    setAudioTimeMs(0);
    setAudioPlaying(false);
    setAudioStarted(false);
    setGuidedPlaying(false);
    setMediaFailed(false);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;

    audioRef.current?.pause();
    audioRef.current = null;

    fetch(cognitivePodcastUrl(lesson.podcast, cognitiveLevel))
      .then((response) => (response.ok ? response.text() : ""))
      .then((text) => {
        if (!cancelled) setEpisodeSource(text);
      })
      .catch(() => {
        if (!cancelled) setEpisodeSource("");
      });

    return () => {
      cancelled = true;
    };
  }, [cognitiveLevel, lesson.id, lesson.podcast]);

  const episode = useMemo(
    () => episodeSource.trim(),
    [episodeSource]
  );

  const turns = useMemo(
    () => {
      if (!episode) return [];
      const body = episode.replace(/^EPISODE [^\n]+\n?/i, "").trim();
      return body
        ? body.split(/\n\s*\n/).map((text, index) => ({
            id: `${lesson.id}.T${String(index + 1).padStart(3, "0")}`,
            speaker: "Narrator" as const,
            text: text.trim(),
            kind: "dialogue" as const
          }))
        : [];
    },
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
    }, GUIDED_TURN_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [audioManifest, guidedPlaying, turns.length]);

  useEffect(() => {
    if (current) {
      transcriptRefs.current[current.id]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [current?.id]);

  function pauseAudio() {
    audioRef.current?.pause();
    setAudioPlaying(false);
  }

  function syncFromAudio() {
    if (!audioManifest || !audioRef.current) return;

    const timeMs = Math.min(
      audioManifest.durationMs,
      Math.round(audioRef.current.currentTime * 1000)
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

    const activeCue = findActiveCue(audioManifest, timeMs);
    if (!activeCue || activeCue.id === lastCueIdRef.current) return;

    lastCueIdRef.current = activeCue.id;
    const nextPhase = cueToPhase[activeCue.kind];
    if (!nextPhase) return;

    pauseAudio();
    setPhase(nextPhase);
  }

  function startVoice() {
    if (!audioManifest || mediaFailed) {
      setAudioStarted(true);
      setPhase("speaking");
      setGuidedPlaying(true);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    setAudioStarted(true);
    setPhase("speaking");
    void audio.play().catch(() => {
      setMediaFailed(true);
      setAudioPlaying(false);
      setGuidedPlaying(true);
      setPhase("speaking");
    });
  }

  function toggleVoice() {
    if (!audioManifest || mediaFailed) {
      setAudioStarted(true);
      setPhase("speaking");
      setGuidedPlaying((playing) => !playing);
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    if (audioPlaying) {
      audio.pause();
      setAudioPlaying(false);
    } else {
      startVoice();
    }
  }

  function seek(deltaSeconds: number) {
    if (!audioManifest || !audioRef.current || mediaFailed) return;

    const nextTime = Math.max(
      0,
      Math.min(audioManifest.durationMs, audioTimeMs + deltaSeconds * 1000)
    );

    audioRef.current.currentTime = nextTime / 1000;
    setAudioTimeMs(Math.round(nextTime));
    lastAudioTimeMsRef.current = Math.round(nextTime);
    lastCueIdRef.current = null;

    const targetTurnIndex = findCurrentTurnId(audioManifest, nextTime);
    if (targetTurnIndex) {
      const index = turns.findIndex((turn) => turn.id === targetTurnIndex);
      if (index >= 0) setTurnIndex(index);
    }
  }

  function resumeVoice() {
    setPhase("speaking");

    if (audioManifest && !mediaFailed) {
      void audioRef.current?.play().catch(() => {
        setMediaFailed(true);
        setGuidedPlaying(true);
      });
      return;
    }

    setGuidedPlaying(true);
  }

  function reset() {
    pauseAudio();
    if (audioRef.current) audioRef.current.currentTime = 0;

    setPhase("ready");
    setTurnIndex(0);
    setPrediction("");
    setAudioStarted(false);
    setAudioTimeMs(0);
    setGuidedPlaying(false);
    setMediaFailed(false);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;
  }

  function selectCognitiveLevel(level: PodcastCognitiveLevel) {
    if (level === cognitiveLevel) return;

    pauseAudio();
    if (audioRef.current) audioRef.current.currentTime = 0;

    setCognitiveLevel(level);
    setPhase("ready");
    setTurnIndex(0);
    setPrediction("");
    setAudioTimeMs(0);
    setAudioStarted(false);
    setGuidedPlaying(false);
    setMediaFailed(false);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;
  }

  const selectedLevel = COGNITIVE_LEVELS.find(
    (item) => item.level === cognitiveLevel
  ) ?? COGNITIVE_LEVELS[0];

  return (
    <aside
      className="podcast-coach podcast-coach-continuous"
      aria-label="Continuous fixed co-teacher"
    >
      <div className="coach-banner">
        <div>
          <span className="eyebrow">CO-TEACHER · FIXED</span>
          <h3>Four authored speeches. Four cognitive levels.</h3>
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
                  : "speech complete"}
        </div>
      </div>

      <div className="cognitive-level-picker" aria-label="Podcast cognitive level">
        {COGNITIVE_LEVELS.map((item) => {
          const available = rawBundle?.speeches.some(
            (speech) => speech.cognitiveLevel === item.level
          );

          return (
            <button
              key={item.level}
              type="button"
              className={item.level === cognitiveLevel ? "active" : ""}
              aria-pressed={item.level === cognitiveLevel}
              onClick={() => selectCognitiveLevel(item.level)}
            >
              <strong>Level {item.level}</strong>
              <span>{item.label}</span>
              <small>{item.description}</small>
              {!available ? <em>script fallback</em> : null}
            </button>
          );
        })}
      </div>

      {audioManifest ? (
        <audio
          ref={audioRef}
          src={audioManifest.audioUrl}
          preload="metadata"
          className="podcast-audio-source"
          onTimeUpdate={syncFromAudio}
          onPlay={() => {
            setAudioPlaying(true);
            setAudioStarted(true);
            setPhase("speaking");
          }}
          onPause={() => setAudioPlaying(false)}
          onEnded={() => {
            setAudioPlaying(false);
            setAudioTimeMs(audioManifest.durationMs);
            publishVoiceClock?.({
              timeMs: audioManifest.durationMs,
              manifest: audioManifest
            });
            setPhase("done");
          }}
          onError={() => {
            setMediaFailed(true);
            setAudioPlaying(false);
          }}
        />
      ) : null}

      <div className="continuous-voice-row">
        <div>
          <strong>
            Level {selectedLevel.level} · {selectedLevel.label}
          </strong>
          <span className="range">
            {selectedLevel.description}
          </span>
          <span className="range">
            {audioSyncState === "voice-synced"
              ? "A fixed recording drives the real audio clock."
              : audioSyncState === "stale-audio"
                ? "The recording does not match the selected speech."
                : audioSyncState === "media-error"
                  ? "The recording could not be played. The authored speech remains available."
                  : audioSyncState === "checking"
                    ? "Checking the selected fixed recording against its authored speech."
                    : "No fixed recording is published for this level. The authored speech remains available."}
          </span>
        </div>

        <div className="audio-controls">
          {audioManifest && !mediaFailed ? (
            <>
              <button onClick={() => seek(-10)} aria-label="Rewind 10 seconds">−10s</button>
              <button className="primary" onClick={toggleVoice}>
                {audioPlaying ? "Pause voice" : audioStarted ? "Resume voice" : "Start voice"}
              </button>
              <button onClick={() => seek(10)} aria-label="Forward 10 seconds">+10s</button>
            </>
          ) : (
            <button className="primary" onClick={toggleVoice}>
              {guidedPlaying ? "Pause speech" : audioStarted ? "Resume speech" : "Start speech"}
            </button>
          )}

          {audioManifest ? (
            <span className="audio-time">
              {Math.floor(audioTimeMs / 1000)}s / {Math.round(audioManifest.durationMs / 1000)}s
            </span>
          ) : null}
        </div>
      </div>

      <div className="continuous-transcript" role="log" aria-label="Podcast transcript">
        <div className="transcript-header">
          <span className="eyebrow">AUTHORED SPEECH</span>
          <span className="range">
            {audioManifest && !mediaFailed
              ? "Live position follows the selected fixed speech."
              : "The transcript is the authoritative fallback when audio is unavailable."}
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
              <span className="transcript-speaker">Narrator · Level {cognitiveLevel}</span>
              <p>{turn.text}</p>
            </div>
          ))}
        </div>
      </div>

      {phase === "ready" ? (
        <div className="content-card continuous-prompt">
          <h4>{selectedLevel.label}</h4>
          <p>
            This is a separate fixed speech for this cognitive level. Changing
            level changes the explanation itself — its reasoning depth, evidence
            and abstraction — rather than merely changing TTS playback rate.
          </p>
          <p>
            The private tutor is separate. It may discuss the lesson with the
            learner, but it does not rewrite or regenerate these speeches.
          </p>
          {audioSyncState === "voice-synced" && turns.length > 0 ? (
            <button className="primary" onClick={startVoice}>
              Start Level {selectedLevel.level} speech
            </button>
          ) : null}
        </div>
      ) : null}

      {phase === "coach" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">YOUR PREDICTION</span>
          <h4>Say it before the speech continues.</h4>
          <p>{lesson.recall[1] ?? lesson.recall[0]}</p>
          <textarea
            value={prediction}
            onChange={(event) => setPrediction(event.target.value)}
            placeholder="Explain your prediction in your own words."
          />
          <button className="primary" disabled={!prediction.trim()} onClick={resumeVoice}>
            Continue
          </button>
        </div>
      ) : null}

      {phase === "learner-action" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">YOUR TURN</span>
          <h4>Work with the learner controls, then return to the speech.</h4>
          <p>
            The fixed speech pauses here deliberately. Use Learn, Do, Recall,
            Design or Assessment, then return to this same cognitive-level speech.
          </p>
          <button className="primary" onClick={resumeVoice}>Continue speech</button>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">SPEECH COMPLETE</span>
          <h4>The selected cognitive-level speech reached the end.</h4>
          <button className="secondary" onClick={reset}>Replay speech</button>
        </div>
      ) : null}
    </aside>
  );
}
