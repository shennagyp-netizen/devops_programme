"use client";

import { useEffect, useMemo, useState } from "react";
import type { MasteryPlan } from "../data/mastery";
import {
  tutorModes,
  type TutorMode,
  type TutorResponse
} from "../data/tutorContract";

type TutorCoachProps = {
  lessonId: string;
  lessonTitle: string;
  course: string;
  projectId: string;
  currentLessonMode: "learn" | "do" | "recall" | "design" | "assessment";
  masteryPlan: MasteryPlan | null;
  learnerEvidence: Record<string, string>;
  exerciseRecorded: boolean;
  machineResults: Array<{
    stepId: string;
    result: string;
    exitCode: number;
  }>;
};

type ChatMessage = {
  role: "learner" | "tutor";
  text: string;
  response?: TutorResponse;
};

const modeLabels: Record<TutorMode, string> = {
  teaching: "Teach me",
  "failure-investigation": "Investigate failure",
  "assignment-coach": "Coach the assignment",
  "incident-review": "Review incident",
  "design-defense": "Defend the design",
  "oral-assessment": "Interview me"
};

const lessonModeDefaults: Record<
  TutorCoachProps["currentLessonMode"],
  TutorMode
> = {
  learn: "teaching",
  do: "assignment-coach",
  recall: "teaching",
  design: "design-defense",
  assessment: "oral-assessment"
};

export function TutorCoach({
  lessonId,
  lessonTitle,
  course,
  projectId,
  currentLessonMode,
  masteryPlan,
  learnerEvidence,
  exerciseRecorded,
  machineResults
}: TutorCoachProps) {
  const storageKey = "devops-programme-tutor-session:" + lessonId;
  const [selectedMode, setSelectedMode] = useState<TutorMode>(
    lessonModeDefaults[currentLessonMode]
  );
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setSelectedMode(lessonModeDefaults[currentLessonMode]);
  }, [currentLessonMode]);

  useEffect(() => {
    setMessages([]);
    setError("");
    setInput("");

    try {
      const saved = sessionStorage.getItem(storageKey);
      setSessionId(saved || undefined);
    } catch {
      setSessionId(undefined);
    }
  }, [lessonId, storageKey]);

  const verificationSummary = useMemo(
    () => ({
      exerciseRecorded,
      steps: machineResults.slice(0, 12).map((item) => ({
        stepId: item.stepId,
        result: item.result,
        exitCode: item.exitCode
      }))
    }),
    [exerciseRecorded, machineResults]
  );

  function rememberSession(nextSessionId: string) {
    setSessionId(nextSessionId);
    try {
      sessionStorage.setItem(storageKey, nextSessionId);
    } catch {
      // Session persistence is best-effort; server ownership remains authoritative.
    }
  }

  async function sendMessage() {
    const message = input.trim();
    if (!message || busy) return;

    setBusy(true);
    setError("");
    setInput("");
    setMessages((current) => [...current, { role: "learner", text: message }]);

    try {
      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId,
          lessonId,
          mode: selectedMode,
          message,
          learnerEvidence,
          mastery: masteryPlan
            ? {
                attemptNumber: masteryPlan.attemptNumber,
                stage: masteryPlan.stage,
                failureSummary: masteryPlan.failureSummary
              }
            : undefined,
          verificationSummary
        })
      });

      const payload = (await response.json()) as {
        error?: string;
        sessionId?: string;
        response?: TutorResponse;
      };

      if (!response.ok || !payload.response || !payload.sessionId) {
        throw new Error(payload.error || "The tutor could not answer safely.");
      }

      rememberSession(payload.sessionId);
      setMessages((current) => [
        ...current,
        {
          role: "tutor",
          text: payload.response!.message,
          response: payload.response
        }
      ]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "The tutor could not answer safely."
      );
    } finally {
      setBusy(false);
    }
  }

  function newSession() {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      // The next request will simply create a new server-owned session.
    }
    setSessionId(undefined);
    setMessages([]);
    setError("");
  }

  return (
    <section className="content-card tutor-coach" aria-label="Interactive senior DevOps tutor">
      <div className="course-path-head">
        <div>
          <span className="eyebrow">LIVE TUTOR · {course.toUpperCase()}</span>
          <h3>Discuss the real lesson, failure and project.</h3>
          <p>
            This tutor can explain the mechanism, ask questions, inspect the evidence you provide,
            challenge your reasoning and review a design. It cannot certify your work.
          </p>
        </div>
        <div className="coach-phase">
          {sessionId ? "SESSION SAVED" : "NEW SESSION"}
        </div>
      </div>

      <div className="difficulty-grid">
        {tutorModes.map((mode) => (
          <button
            key={mode}
            className={selectedMode === mode ? "active" : ""}
            onClick={() => setSelectedMode(mode)}
            disabled={busy}
          >
            {modeLabels[mode]}
          </button>
        ))}
      </div>

      {masteryPlan ? (
        <div className="content-card">
          <span className="eyebrow">FAILURE CONTEXT LOADED</span>
          <p>
            Attempt {masteryPlan.attemptNumber}, {masteryPlan.stage}. The tutor has the bounded
            failure summary and can explain the concept using a different method.
          </p>
          <p className="range">
            {masteryPlan.failureSummary.join(" · ") || "No failure summary was supplied."}
          </p>
        </div>
      ) : null}

      <div className="content-card">
        <span className="eyebrow">CURRENT CONTEXT</span>
        <p>
          <strong>{lessonId}</strong> · {lessonTitle} · project {projectId}
        </p>
        <p className="range">
          Learner-entered evidence is treated as unverified. Machine verification is only treated
          as verified when the deterministic runtime contract says so.
        </p>
      </div>

      <div className="continuous-transcript">
        {messages.length === 0 ? (
          <p>
            Start with a real question. Example: “The service is running. Why can the browser still
            fail to reach it?”
          </p>
        ) : (
          messages.map((message, index) => (
            <div key={index}>
              <strong>{message.role === "learner" ? "You" : "Senior engineer"}:</strong>
              <p>{message.text}</p>

              {message.response ? (
                <div className="range">
                  {message.response.nextQuestion ? (
                    <p>
                      <strong>Next question:</strong> {message.response.nextQuestion}
                    </p>
                  ) : null}
                  {message.response.requestedEvidence.length ? (
                    <p>
                      <strong>Evidence to collect:</strong>{" "}
                      {message.response.requestedEvidence.join(" · ")}
                    </p>
                  ) : null}
                  {message.response.suggestedAction ? (
                    <p>
                      <strong>Safe next action:</strong> {message.response.suggestedAction}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>

      <textarea
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={(event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
            event.preventDefault();
            void sendMessage();
          }
        }}
        placeholder="Ask the senior engineer about the mechanism, your failure, your evidence or your design."
        disabled={busy}
        aria-label="Message the tutor"
      />

      <div className="continuous-voice-row">
        <div>
          <strong>{modeLabels[selectedMode]}</strong>
          <span className="range">
            The tutor conversation is attached to {lessonId} and project {projectId}.
            Use Ctrl/Cmd + Enter to send.
          </span>
        </div>
        <div className="audio-controls">
          <button className="primary" onClick={() => void sendMessage()} disabled={busy || !input.trim()}>
            {busy ? "Tutor is thinking…" : "Ask tutor"}
          </button>
          <button className="secondary" onClick={newSession} disabled={busy}>
            New conversation
          </button>
        </div>
      </div>

      {error ? (
        <p className="range">
          <strong>Tutor status:</strong> {error}
        </p>
      ) : null}
    </section>
  );
}
