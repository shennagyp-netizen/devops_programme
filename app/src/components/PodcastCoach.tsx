"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Lesson } from "../data/curriculum";
import {
  buildPodcastTtsBundle,
  podcastExplanationUrl,
  podcastLevelDescription,
  podcastLevelId,
  podcastLevelLabel,
  type PodcastExplanationLevel,
  type PodcastTtsBundle
} from "../data/podcastSync";
import { getEpisodeText, parseTurns, type Turn } from "../data/podcastsRaw";
import { useLessonVoiceClock } from "./LessonVoiceClock";

type VoicePhase =
  | "ready"
  | "speaking"
  | "coach"
  | "learner-action"
  | "paused"
  | "done";

type ScriptManifest = {
  schemaVersion: number;
  source: string;
  episodes: Record<string, string>;
  cognitiveLevels?: Record<string, Record<string, string>>;
};

const EXPLANATION_LEVELS: ReadonlyArray<{
  level: PodcastExplanationLevel;
  label: string;
  description: string;
}> = [
  { level: 1, label: "Foundation", description: podcastLevelDescription(1) },
  { level: 2, label: "Mechanism", description: podcastLevelDescription(2) },
  { level: 3, label: "Diagnosis", description: podcastLevelDescription(3) },
  { level: 4, label: "Design & transfer", description: podcastLevelDescription(4) }
];

function getSpeechSynthesis() {
  return typeof window !== "undefined" ? window.speechSynthesis : undefined;
}

export function PodcastCoach({ lesson }: { lesson: Lesson }) {
  const voiceClock = useLessonVoiceClock();
  const publishVoiceClock = voiceClock?.publishVoiceClock;

  const [phase, setPhase] = useState<VoicePhase>("ready");
  const [turnIndex, setTurnIndex] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [episodeSource, setEpisodeSource] = useState("");
  const [explanationLevel, setExplanationLevel] = useState<PodcastExplanationLevel>(1);
  const [speechRate, setSpeechRate] = useState<1 | 1.5 | 2>(1);
  const [scriptVersions, setScriptVersions] = useState<Record<string, string>>({});
  const [ttsSupported, setTtsSupported] = useState(false);
  const [ttsBundle, setTtsBundle] = useState<PodcastTtsBundle>();
  const [ttsStarted, setTtsStarted] = useState(false);

  const transcriptRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const sessionIdRef = useRef(0);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speechRateRef = useRef<1 | 1.5 | 2>(1);
  const sessionStartedAtRef = useRef<number | null>(null);
  const nextTurnIndexRef = useRef(0);

  useEffect(() => {
    setTtsSupported(Boolean(getSpeechSynthesis()));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const reset = () => {
      sessionIdRef.current += 1;
      getSpeechSynthesis()?.cancel();
      currentUtteranceRef.current = null;
      sessionStartedAtRef.current = null;
      nextTurnIndexRef.current = 0;
      setPhase("ready");
      setTurnIndex(0);
      setPrediction("");
      setEpisodeSource("");
      setTtsStarted(false);
    };

    reset();

    fetch("/podcasts/manifest.json")
      .then((response) =>
        response.ok
          ? (response.json() as Promise<ScriptManifest>)
          : { schemaVersion: 0, source: "", episodes: {}, cognitiveLevels: {} }
      )
      .then((manifest) => {
        if (cancelled) return;

        const versions = manifest.cognitiveLevels?.[lesson.id] ?? {};
        setScriptVersions(versions);
        setTtsBundle(buildPodcastTtsBundle(lesson.id, versions));
      })
      .catch(() => {
        if (!cancelled) {
          setScriptVersions({});
          setTtsBundle(undefined);
        }
      });

    return () => {
      cancelled = true;
      sessionIdRef.current += 1;
      getSpeechSynthesis()?.cancel();
      currentUtteranceRef.current = null;
    };
  }, [lesson.id]);

  useEffect(() => {
    let cancelled = false;

    sessionIdRef.current += 1;
    getSpeechSynthesis()?.cancel();
    currentUtteranceRef.current = null;
    sessionStartedAtRef.current = null;
    nextTurnIndexRef.current = 0;

    setPhase("ready");
    setTurnIndex(0);
    setPrediction("");
    setEpisodeSource("");
    setTtsStarted(false);

    fetch(podcastExplanationUrl(lesson.podcast, explanationLevel))
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
  }, [explanationLevel, lesson.podcast]);

  const episode = useMemo(
    () => getEpisodeText(episodeSource, lesson.id),
    [episodeSource, lesson.id]
  );

  const turns = useMemo(
    () => parseTurns(episode, lesson.id),
    [episode, lesson.id]
  );

  const current: Turn | undefined = turns[turnIndex];
  const selectedLevel = EXPLANATION_LEVELS.find((item) => item.level === explanationLevel) ?? EXPLANATION_LEVELS[0];

  const selectedSpeech = ttsBundle?.speeches.find(
    (speech) => speech.explanationLevel === explanationLevel
  );

  const scriptReady =
    Boolean(scriptVersions[String(explanationLevel)]) &&
    Boolean(selectedSpeech) &&
    turns.length > 0;

  useEffect(() => {
    if (current) {
      transcriptRefs.current[current.id]?.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      });
    }
  }, [current?.id]);

  function publish(state: "idle" | "speaking" | "paused" | "done", turnId?: string) {
    publishVoiceClock?.({
      cognitiveLevel: explanationLevel,
      turnId,
      elapsedMs: sessionStartedAtRef.current
        ? Math.max(0, performance.now() - sessionStartedAtRef.current)
        : 0,
      state
    });
  }

  function handleTurnBoundary(turn: Turn) {
    if (turn.kind === "prediction") {
      setPhase("coach");
      return true;
    }

    if (turn.kind === "lab" || turn.kind === "recall") {
      setPhase("learner-action");
      return true;
    }

    return false;
  }

  function speakTurn(index: number, sessionId: number) {
    const synthesis = getSpeechSynthesis();
    const turn = turns[index];

    if (!synthesis || !turn || sessionId !== sessionIdRef.current) {
      return;
    }

    nextTurnIndexRef.current = index;

    const utterance = new SpeechSynthesisUtterance(turn.text);
    utterance.rate = speechRateRef.current;
    utterance.pitch = 1;
    utterance.onstart = () => {
      if (sessionId !== sessionIdRef.current) return;

      currentUtteranceRef.current = utterance;
      setTurnIndex(index);
      setPhase("speaking");
      setTtsStarted(true);
      publish("speaking", turn.id);
    };

    utterance.onend = () => {
      if (sessionId !== sessionIdRef.current) return;

      currentUtteranceRef.current = null;
      const stoppedForLearner = handleTurnBoundary(turn);

      if (stoppedForLearner) {
        nextTurnIndexRef.current = index + 1;
        setTtsStarted(true);
        publish("paused", turn.id);
        return;
      }

      const nextIndex = index + 1;
      if (nextIndex >= turns.length) {
        setTurnIndex(Math.max(0, turns.length - 1));
        setPhase("done");
        publish("done", turn.id);
        return;
      }

      speakTurn(nextIndex, sessionId);
    };

    utterance.onerror = () => {
      if (sessionId !== sessionIdRef.current) return;

      currentUtteranceRef.current = null;
      setPhase("ready");
      publish("idle", turn.id);
    };

    synthesis.speak(utterance);
  }

  function startVoice(fromIndex = nextTurnIndexRef.current) {
    const synthesis = getSpeechSynthesis();
    if (!synthesis || !scriptReady) return;

    sessionIdRef.current += 1;
    const sessionId = sessionIdRef.current;

    synthesis.cancel();
    currentUtteranceRef.current = null;
    sessionStartedAtRef.current = performance.now();
    nextTurnIndexRef.current = Math.max(0, Math.min(fromIndex, turns.length - 1));
    setTtsStarted(true);
    setPhase("speaking");

    speakTurn(nextTurnIndexRef.current, sessionId);
  }

  function toggleVoice() {
    const synthesis = getSpeechSynthesis();
    if (!synthesis || !scriptReady) return;

    if (synthesis.speaking && !synthesis.paused) {
      synthesis.pause();
      setPhase("paused");
      publish("paused", current?.id);
      return;
    }

    if (synthesis.paused) {
      synthesis.resume();
      setPhase("speaking");
      publish("speaking", current?.id);
      return;
    }

    startVoice();
  }

  function stopVoice() {
    sessionIdRef.current += 1;
    getSpeechSynthesis()?.cancel();
    currentUtteranceRef.current = null;
    nextTurnIndexRef.current = 0;
    sessionStartedAtRef.current = null;
    setPhase("ready");
    setTurnIndex(0);
    setTtsStarted(false);
    publish("idle");
  }

  function resumeVoice() {
    const nextIndex = nextTurnIndexRef.current;

    if (nextIndex >= turns.length) {
      stopVoice();
      return;
    }

    startVoice(nextIndex);
  }

  function selectExplanationLevel(level: PodcastExplanationLevel) {
    if (level === explanationLevel) return;
    stopVoice();
    setExplanationLevel(level);
  }

  function selectSpeechRate(rate: 1 | 1.5 | 2) {
    if (rate === speechRate) return;
    setSpeechRate(rate);
    speechRateRef.current = rate;

    const synthesis = getSpeechSynthesis();
    if (!ttsStarted || !synthesis || (!synthesis.speaking && !synthesis.paused)) return;

    const restartIndex = nextTurnIndexRef.current;
    sessionIdRef.current += 1;
    const sessionId = sessionIdRef.current;
    synthesis.cancel();
    currentUtteranceRef.current = null;
    setPhase("speaking");
    setTtsStarted(true);
    speakTurn(restartIndex, sessionId);
  }

  return (
    <aside
      className="podcast-coach podcast-coach-continuous"
      aria-label="Continuous fixed TTS co-teacher"
    >
      <div className="coach-banner">
        <div>
          <span className="eyebrow">CO-TEACHER · FIXED TTS</span>
          <h3>One podcast. Four explanation levels.</h3>
        </div>
        <div className="coach-phase">
          {phase === "ready"
            ? "ready"
            : phase === "speaking"
              ? "speaking"
              : phase === "paused"
                ? "paused"
                : phase === "coach"
                  ? "your prediction"
                  : phase === "learner-action"
                    ? "your turn"
                    : "speech complete"}
        </div>
      </div>

      <div className="cognitive-level-picker" aria-label="Podcast explanation level">
        {COGNITIVE_LEVELS.map((item) => (
          <button
            key={item.level}
            type="button"
            className={item.level === cognitiveLevel ? "active" : ""}
            aria-pressed={item.level === cognitiveLevel}
            onClick={() => selectExplanationLevel(item.level)}
          >
            <strong>Explanation {item.level}</strong>
            <span>{item.label}</span>
            <small>{item.description}</small>
          </button>
        ))}
      </div>

      <div className="continuous-voice-row">
        <div>
          <strong>
            Explanation {selectedLevel.level} · {selectedLevel.label}
          </strong>
          <span className="range">{selectedLevel.description}</span>
          <span className="range">
            {ttsSupported
              ? "This level is spoken from its fixed authored script by TTS."
              : "TTS is unavailable in this browser. The fixed authored script remains readable."}
          </span>
        </div>

        <div className="audio-controls">
          <label className="tts-rate-control">
            <span>Speech</span>
            <select
              aria-label="TTS speech speed"
              value={speechRate}
              onChange={(event) =>
                selectSpeechRate(Number(event.target.value) as 1 | 1.5 | 2)
              }
            >
              <option value="1">1×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2×</option>
            </select>
          </label>

          {ttsSupported && scriptReady ? (
            <>
              <button className="primary" onClick={toggleVoice}>
                {phase === "paused"
                  ? "Resume TTS"
                  : phase === "speaking"
                    ? "Pause TTS"
                    : ttsStarted
                      ? "Restart TTS"
                      : "Start TTS"}
              </button>
              {ttsStarted ? (
                <button onClick={stopVoice} aria-label="Stop TTS">Stop</button>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="continuous-transcript" role="log" aria-label="Podcast transcript">
        <div className="transcript-header">
          <span className="eyebrow">
            LEVEL {cognitiveLevel} · {podcastLevelId(cognitiveLevel)}
          </span>
          <span className="range">
            {scriptReady
              ? "The authored script is the source for this TTS version."
              : "Loading the fixed authored script."}
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
              <span className="transcript-speaker">TTS narrator</span>
              <p>{turn.text}</p>
            </div>
          ))}
        </div>
      </div>

      {phase === "ready" ? (
        <div className="content-card continuous-prompt">
          <h4>{selectedLevel.label}</h4>
          <p>
            This is one of four authored explanations of the same complete information.
            The explanation style changes; the information does not.
          </p>
          <p>
            The private tutor is separate. It may discuss the learner's
            reasoning, but it never rewrites or regenerates these podcast scripts.
          </p>
          {!ttsSupported ? (
            <p>TTS is not available in this browser, so the transcript remains the usable fallback.</p>
          ) : null}
        </div>
      ) : null}

      {phase === "coach" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">YOUR PREDICTION</span>
          <h4>Say it before the next cognitive step.</h4>
          <p>{lesson.recall[1] ?? lesson.recall[0]}</p>
          <textarea
            value={prediction}
            onChange={(event) => setPrediction(event.target.value)}
            placeholder="Explain your prediction in your own words."
          />
          <button className="primary" disabled={!prediction.trim()} onClick={resumeVoice}>
            Continue TTS
          </button>
        </div>
      ) : null}

      {phase === "learner-action" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">YOUR TURN</span>
          <h4>Use the learner activity, then return to TTS.</h4>
          <p>
            The fixed cognitive speech pauses here by design.
          </p>
          <button className="primary" onClick={resumeVoice}>Continue TTS</button>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">SPEECH COMPLETE</span>
          <h4>The selected cognitive version has finished speaking.</h4>
          <button className="secondary" onClick={() => startVoice(0)}>Replay TTS</button>
        </div>
      ) : null}
    </aside>
  );
}
