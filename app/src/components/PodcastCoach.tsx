import { useEffect, useMemo, useRef, useState } from "react";
import type { Lesson } from "../data/curriculum";
import type { MasteryPlan } from "../data/mastery";
import { buildRecoveryVoiceOptions } from "../data/remediationVoice";
import {
  findActiveCue,
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

export function PodcastCoach({ lesson, remediationPlan }: { lesson: Lesson; remediationPlan?: MasteryPlan | null }) {
  const [phase, setPhase] = useState<VoicePhase>("ready");
  const [turnIndex, setTurnIndex] = useState(0);
  const [prediction, setPrediction] = useState("");
  const [audioStarted, setAudioStarted] = useState(false);
  const [episodeSource, setEpisodeSource] = useState("");
  const [audioTimeMs, setAudioTimeMs] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [recoveryMethodIndex, setRecoveryMethodIndex] = useState(0);
  const [scriptVersions, setScriptVersions] = useState<Record<string, string>>({});
  const [audioManifests, setAudioManifests] = useState<Record<string, PodcastAudioManifest>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
      : rawAudioManifest && audioManifest
        ? "voice-synced"
        : rawAudioManifest
          ? "stale-audio"
          : "guided";

  useEffect(() => {
    let cancelled = false;

    setPhase("ready");
    setTurnIndex(0);
    setPrediction("");
    setAudioStarted(false);
    setAudioTimeMs(0);
    setAudioPlaying(false);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;

    audioRef.current?.pause();
    audioRef.current = null;

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
  const recoveryOptions = useMemo(
    () => (remediationPlan ? buildRecoveryVoiceOptions(lesson as any, remediationPlan) : []),
    [lesson, remediationPlan]
  );
  const activeRecoveryOption = recoveryOptions[recoveryMethodIndex] ?? recoveryOptions[0];

  useEffect(() => {
    if (!audioManifest || !audioRef.current) return;

    const audio = audioRef.current;

    const onTime = () => {
      const timeMs = Math.round(audio.currentTime * 1000);
      const movedBackward = timeMs + 250 < lastAudioTimeMsRef.current;

      if (movedBackward) lastCueIdRef.current = null;
      lastAudioTimeMsRef.current = timeMs;
      setAudioTimeMs(timeMs);

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

      audio.pause();
      setAudioPlaying(false);
      setPhase(nextPhase);
    };

    const onPlay = () => {
      setAudioPlaying(true);
      setAudioStarted(true);
      setPhase("speaking");
    };
    const onPause = () => setAudioPlaying(false);
    const onEnded = () => {
      setAudioPlaying(false);
      setPhase("done");
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

  function startVoice() {
    const audio = audioRef.current;
    if (!audio) {
      setAudioStarted(true);
      setPhase("speaking");
      return;
    }
    setAudioStarted(true);
    void audio.play();
  }

  function toggleVoice() {
    if (audioPlaying) audioRef.current?.pause();
    else startVoice();
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
    audio.currentTime = nextTime;
    lastCueIdRef.current = null;
  }

  function resumeVoice() {
    setPhase("speaking");
    void audioRef.current?.play();
  }

  function reset() {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPhase("ready");
    setTurnIndex(0);
    setPrediction("");
    setAudioStarted(false);
    setAudioTimeMs(0);
    setAudioPlaying(false);
    lastCueIdRef.current = null;
    lastAudioTimeMsRef.current = 0;
  }

  return (
    <aside className="podcast-coach podcast-coach-continuous" aria-label="Continuous co-teacher">
      <div className="coach-banner">
        <div>
          <span className="eyebrow">CO-TEACHER · CONTINUOUS</span>
          <h3>Your voice guide stays with the lesson.</h3>
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

      {audioManifest ? (
        <audio
          ref={audioRef}
          src={audioManifest.audioUrl}
          preload="metadata"
          onLoadedMetadata={(event) =>
            setAudioTimeMs(Math.round(event.currentTarget.currentTime * 1000))
          }
        />
      ) : null}

      <div className="continuous-voice-row">
        <div>
          <strong>
            {current
              ? "Engineer " + current.speaker
              : audioSyncState === "guided"
                ? "Guided co-teacher"
                : "Preparing the voice"}
          </strong>
          <span className="range">
            {audioSyncState === "voice-synced"
              ? "Voice, transcript and authored learner pauses are synchronized."
              : audioSyncState === "stale-audio"
                ? "The recording is from an older lesson script; the safe guided transcript is active."
                : audioSyncState === "checking"
                  ? "Checking that the recording matches the current lesson script."
                  : "A matched recording is not published yet; the guided spoken script remains available."}
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
              <span className="audio-time">
                {Math.floor(audioTimeMs / 1000)}s / {Math.round(audioManifest.durationMs / 1000)}s
              </span>
            </>
          ) : (
            <button className="primary" onClick={startVoice}>Start co-teacher</button>
          )}
        </div>
      </div>

      {current ? (
        <div className="continuous-transcript">
          <span className="eyebrow">LIVE TRANSCRIPT</span>
          <p>{current.text}</p>
        </div>
      ) : null}

      {phase === "ready" ? (
        <div className="content-card continuous-prompt">
          <h4>One voice layer for the whole lesson</h4>
          <p>
            The co-teacher follows you through reading, watching, operating, diagnosing, recalling and designing. There is no separate listening mode.
          </p>
          <p>
            The browser may require one click before audio can start. After that first interaction, the same voice session remains attached to this lesson until you change lessons or explicitly pause it.
          </p>
          {audioSyncState === "voice-synced" ? (
            <button className="primary" onClick={startVoice}>Start the continuous voice lesson</button>
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
            The voice pauses here deliberately. Use Learn, Do, Recall, Design or Assessment without losing the co-teacher session.
          </p>
          <button className="primary" onClick={resumeVoice}>Continue voice</button>
        </div>
      ) : null}

      {remediationPlan && activeRecoveryOption ? (
        <section className="content-card recovery-podcast" aria-label="Recovery podcast">
          <div className="course-path-head">
            <div>
              <span className="eyebrow">RECOVERY PODCAST · ATTEMPT {remediationPlan.attemptNumber}</span>
              <h4>The co-teacher changes method after failure.</h4>
              <p>
                This is not a replay of the same lesson. Pick another explanation method,
                work through it, then return to the assignment with a smaller proof.
              </p>
            </div>
            <span className="coach-phase">{remediationPlan.stage}</span>
          </div>

          <div className="difficulty-grid">
            {recoveryOptions.map((option, index) => (
              <button
                key={option.id}
                className={index === recoveryMethodIndex ? "active" : ""}
                onClick={() => setRecoveryMethodIndex(index)}
              >
                <strong>{option.label}</strong>
                <span>{option.reason}</span>
              </button>
            ))}
          </div>

          <div className="content-card">
            <span className="eyebrow">CO-TEACHER SCRIPT · AUDIO SLOT READY</span>
            <p className="range">
              The current repository has no aligned recovery recording for this episode yet,
              so the app uses the authored spoken script safely. It does not fake audio timing.
            </p>
            <div className="continuous-transcript">
              {activeRecoveryOption.turns.map((turn) => (
                <p key={turn.id}>
                  <strong>Engineer {turn.speaker}:</strong> {turn.text}
                </p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {phase === "done" ? (
        <div className="continuous-prompt">
          <span className="eyebrow">VOICE SESSION COMPLETE</span>
          <h4>The lesson voice reached the end of its authored script.</h4>
          <button className="secondary" onClick={reset}>Replay voice</button>
        </div>
      ) : null}
    </aside>
  );
}
