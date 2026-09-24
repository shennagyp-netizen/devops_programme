import { useEffect, useMemo, useRef, useState } from "react";
import type { Lesson } from "../data/curriculum";
import {
  findActiveCue,
  findCurrentTurnId,
  getPodcastAudioManifest,
  type PodcastCueKind
} from "../data/podcastSync";
import {
  getEpisodeText,
  parseTurns,
  podcastUrl,
  type Turn
} from "../data/podcastsRaw";

type Phase = "brief" | "listen" | "coach" | "lab" | "recall" | "done";

const cueToPhase: Partial<Record<PodcastCueKind, Phase>> = {
  prediction: "coach",
  lab: "lab",
  recall: "recall"
};

export function PodcastCoach({ lesson }: { lesson: Lesson }) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [turnIndex, setTurnIndex] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [coachAnswer, setCoachAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [recallAnswers, setRecallAnswers] = useState<string[]>(() =>
    lesson.recall.map(() => "")
  );
  const [recallDone, setRecallDone] = useState<boolean[]>(() =>
    lesson.recall.map(() => false)
  );
  const [seconds, setSeconds] = useState(20);
  const [episodeSource, setEpisodeSource] = useState("");
  const [audioTimeMs, setAudioTimeMs] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [scriptVersions, setScriptVersions] = useState<Record<string, string>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCueIdRef = useRef<string | null>(null);
  const lastAudioTimeMsRef = useRef(0);

  const rawAudioManifest = getPodcastAudioManifest(lesson.id);
  const scriptVersion = scriptVersions[lesson.id];
  const audioManifest =
    rawAudioManifest && scriptVersion === rawAudioManifest.scriptVersion
      ? rawAudioManifest
      : undefined;
  const audioSyncState =
    rawAudioManifest && !scriptVersion
      ? "checking"
      : rawAudioManifest && audioManifest
        ? "voice-synced"
        : rawAudioManifest
          ? "stale-audio"
          : "guided";

  useEffect(() => {
    let cancelled = false;

    setPhase("brief");
    setTurnIndex(0);
    setPrediction("");
    setCoachAnswer("");
    setShowHint(false);
    setRecallAnswers(lesson.recall.map(() => ""));
    setRecallDone(lesson.recall.map(() => false));
    setSeconds(20);
    setAudioTimeMs(0);
    setAudioPlaying(false);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;

    audioRef.current?.pause();
    audioRef.current = null;

    Promise.all([
      fetch(podcastUrl(lesson.podcast)).then((r) => (r.ok ? r.text() : "")),
      fetch("/podcasts/manifest.json")
        .then((r) =>
          r.ok
            ? (r.json() as Promise<{
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
      })
      .catch(() => {
        if (!cancelled) {
          setEpisodeSource("");
          setScriptVersions({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lesson.id, lesson.recall]);

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
    if (!audioManifest || !audioRef.current) return;

    const audio = audioRef.current;

    const onTime = () => {
      const timeMs = Math.round(audio.currentTime * 1000);
      const movedBackward = timeMs + 250 < lastAudioTimeMsRef.current;

      if (movedBackward) {
        lastCueIdRef.current = null;
      }
      lastAudioTimeMsRef.current = timeMs;
      setAudioTimeMs(timeMs);

      const currentTurnId = findCurrentTurnId(audioManifest, timeMs);
      if (currentTurnId) {
        const targetIndex = turns.findIndex(
          (turn) => turn.id === currentTurnId
        );
        if (targetIndex >= 0) {
          setTurnIndex(targetIndex);
        }
      }

      const activeCue = findActiveCue(audioManifest, timeMs);
      if (!activeCue || activeCue.id === lastCueIdRef.current) {
        return;
      }

      lastCueIdRef.current = activeCue.id;

      const nextPhase = cueToPhase[activeCue.kind];
      if (nextPhase) {
        audio.pause();
        setAudioPlaying(false);
        setPhase(nextPhase);
      }
    };

    const onPlay = () => setAudioPlaying(true);
    const onPause = () => setAudioPlaying(false);
    const onEnded = () => {
      setAudioPlaying(false);
      setPhase("lab");
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioManifest, turns]);

  function startAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    void audio.play();
  }

  function pauseAudio() {
    audioRef.current?.pause();
  }

  function seek(deltaSeconds: number) {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Math.max(
      0,
      Math.min(
        Number.isFinite(audio.duration) ? audio.duration : Number.MAX_SAFE_INTEGER,
        audio.currentTime + deltaSeconds
      )
    );

    audio.currentTime = nextTime * 1;
    lastCueIdRef.current = null;
  }

  const nextTurn = () => {
    if (turnIndex >= turns.length - 1) {
      setPhase("lab");
      return;
    }
    setTurnIndex(turnIndex + 1);
  };

  const resumeAfterCoach = () => {
    setPhase("listen");
    void audioRef.current?.play();
  };

  const reset = () => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;

    setPhase("brief");
    setTurnIndex(0);
    setPrediction("");
    setCoachAnswer("");
    setShowHint(false);
    setRecallAnswers(lesson.recall.map(() => ""));
    setRecallDone(lesson.recall.map(() => false));
    setSeconds(20);
    setAudioTimeMs(0);
    setAudioPlaying(false);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;
  };

  const allRecall = recallDone.every(Boolean);

  return (
    <div className="podcast-coach">
      <div className="coach-banner">
        <div>
          <span className="eyebrow">CO-TEACHER MODE</span>
          <h3>The podcast teaches. I make you think.</h3>
        </div>
        <div className="coach-phase">
          {audioSyncState === "voice-synced"
            ? "voice-synced"
            : audioSyncState === "stale-audio"
              ? "stale audio"
              : audioSyncState === "checking"
                ? "checking audio"
                : "guided transcript"}
        </div>
      </div>

      {audioManifest ? (
        <audio
          ref={audioRef}
          src={audioManifest.audioUrl}
          preload="metadata"
          onLoadedMetadata={(event) => {
            setAudioTimeMs(Math.round(event.currentTarget.currentTime * 1000));
          }}
        />
      ) : null}

      {phase === "brief" && (
        <div className="coach-grid">
          <div className="content-card">
            <h4>Before you press play</h4>
            <p>
              Do not try to memorize this episode. Listen for the causal chain:
              what talks to what, what state changes, and what evidence would
              expose a failure.
            </p>
            <p>
              <strong>Prediction:</strong> In one sentence, what do you expect
              to be the first thing that breaks when this concept is
              misconfigured?
            </p>
            <textarea
              value={prediction}
              onChange={(e) => setPrediction(e.target.value)}
              placeholder="Write your prediction in your own words."
            />
            <button
              className="primary"
              onClick={() => {
                setPhase("listen");
                if (audioManifest) startAudio();
              }}
              disabled={!prediction.trim()}
            >
              {audioManifest ? "Start voice-synced lesson" : "Start guided listening"}
            </button>
          </div>

          <div className="content-card coach-rule">
            <h4>
              {audioManifest ? "Voice + React are synchronized" : "Audio sync is not yet available"}
            </h4>
            <p>
              {audioSyncState === "voice-synced"
                ? "The audio clock drives the transcript and exercise cues. React never guesses timing from sentence length."
                : audioSyncState === "stale-audio"
                  ? "This recording was made from an older script. React will not use it until the voice is matched to the current script."
                  : audioSyncState === "checking"
                    ? "Checking that the recording matches the current episode script."
                    : "There is no matched voice recording for this episode yet. The guided transcript is the safe fallback."
              }
            </p>
          </div>
        </div>
      )}

      {phase === "listen" && (
        <div className="content-card">
          <div className="coach-row">
            <strong>{current ? `Speaker ${current.speaker}` : "Guided transcript"}</strong>
            <span>
              {turns.length
                ? `${Math.min(turnIndex + 1, turns.length)}/${turns.length} turns`
                : "loading transcript…"}
            </span>
          </div>

          {audioManifest ? (
            <div className="audio-controls">
              <button onClick={() => seek(-10)}>−10s</button>
              <button
                className="primary"
                onClick={audioPlaying ? pauseAudio : startAudio}
              >
                {audioPlaying ? "Pause voice" : "Play voice"}
              </button>
              <button onClick={() => seek(10)}>+10s</button>
              <span className="audio-time">
                {Math.floor(audioTimeMs / 1000)}s
                {Number.isFinite(audioManifest.durationMs)
                  ? ` / ${Math.round(audioManifest.durationMs / 1000)}s`
                  : ""}
              </span>
            </div>
          ) : null}

          {current ? (
            <div className="turn-card">
              <strong>Speaker {current.speaker}</strong>
              <p>{current.text}</p>
            </div>
          ) : (
            <p>
              Transcript unavailable for this episode. Continue with the
              exercise cards.
            </p>
          )}

          <div className="coach-actions">
            {!audioManifest ? (
              <>
                {current?.kind === "prediction" ? (
                  <button onClick={() => setPhase("coach")}>
                    Stop here — make the prediction
                  </button>
                ) : null}
                <button className="primary" onClick={nextTurn}>
                  {turnIndex >= turns.length - 1
                    ? "Finish listening"
                    : "Next spoken section"}
                </button>
              </>
            ) : (
              <span className="range">
                React will stop the voice automatically at authored exercise
                cues.
              </span>
            )}
          </div>
        </div>
      )}

      {phase === "coach" && (
        <div className="coach-grid">
          <div className="content-card">
            <span className="eyebrow">STOP HERE</span>
            <h4>Say it before you see it</h4>
            <p>{lesson.recall[1] ?? lesson.recall[0]}</p>
            <textarea
              value={coachAnswer}
              onChange={(e) => setCoachAnswer(e.target.value)}
              placeholder="Explain it like you are talking to another engineer."
            />
            <div className="timer-row">
              <button onClick={() => setSeconds((s) => Math.max(0, s - 5))}>
                −5s
              </button>
              <strong>{seconds}s</strong>
              <button onClick={() => setSeconds((s) => s + 5)}>+5s</button>
            </div>
            <button
              className="secondary"
              onClick={() => setShowHint((v) => !v)}
            >
              {showHint ? "Hide hint" : "Show a hint"}
            </button>
            {showHint ? (
              <p className="hint">
                Start from the layer below the current concept. Name the
                request, the state change, and the evidence you expect to
                observe.
              </p>
            ) : null}
            <button className="primary" onClick={resumeAfterCoach}>
              Resume podcast
            </button>
          </div>
          <div className="content-card">
            <h4>Co-teacher note</h4>
            <p>
              A good answer is specific enough that another engineer could
              test it. “The network is broken” is a symptom-shaped guess, not
              a useful hypothesis.
            </p>
          </div>
        </div>
      )}

      {phase === "lab" && (
        <div className="content-card">
          <span className="eyebrow">OPERATE → BREAK → DIAGNOSE</span>
          <h4>Now stop listening and work on the system</h4>
          <p>{lesson.lab.objective}</p>
          <pre>
            <code>{lesson.lab.command}</code>
          </pre>
          <p>
            <strong>Challenge:</strong> {lesson.lab.challenge}
          </p>
          <div className="coach-actions">
            <button className="primary" onClick={() => setPhase("recall")}>
              I ran the lab — test me
            </button>
          </div>
        </div>
      )}

      {phase === "recall" && (
        <div className="content-card">
          <span className="eyebrow">RETRIEVAL</span>
          <h4>No notes now.</h4>
          {lesson.recall.map((q, i) => (
            <label className="recall-row" key={q}>
              <span>
                {i + 1}. {q}
              </span>
              <textarea
                value={recallAnswers[i]}
                onChange={(e) =>
                  setRecallAnswers((a) =>
                    a.map((v, j) => (j === i ? e.target.value : v))
                  )
                }
                placeholder="Answer in your own words."
              />
              <button
                onClick={() =>
                  setRecallDone((r) =>
                    r.map((v, j) => (j === i ? !v : v))
                  )
                }
              >
                {recallDone[i] ? "Done ✓" : "Mark answer checked"}
              </button>
            </label>
          ))}
          <button
            className="primary"
            disabled={!allRecall}
            onClick={() => setPhase("done")}
          >
            Finish episode
          </button>
        </div>
      )}

      {phase === "done" && (
        <div className="content-card success-card">
          <span className="eyebrow">EPISODE COMPLETE</span>
          <h4>You listened, predicted, operated and recalled.</h4>
          <p>
            Your next move is not another video. Repeat the failure challenge
            until you can explain the evidence before running the command.
          </p>
          <button className="primary" onClick={reset}>
            Replay as a second pass
          </button>
        </div>
      )}
    </div>
  );
}
