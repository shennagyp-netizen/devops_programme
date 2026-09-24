import { useEffect, useState } from "react";
import type { CourseLesson } from "../data/courseLessons";
import type { PlatformId } from "../data/programme";
import type { DiagnosticRecommendation } from "../data/diagnostics";
import { diagnosticBySection } from "../data/diagnostics";
import { recordHandsOnEvidence, recordMachineVerification } from "../data/evidence";
import {
  getHandsOnTask,
  validateHandsOnEvidence,
  type HandsOnTask
} from "../data/handsOn";
import { commandForPlatform } from "../data/platformAdapters";
import { runtimeTaskForLesson } from "../data/runtimeVerification";
import { MotionIllustration } from "./MotionIllustration";
import { PodcastCoach } from "./PodcastCoach";
import { AssessmentPanel } from "./AssessmentPanel";

type Mode =
  | "learn"
  | "listen"
  | "do"
  | "recall"
  | "design"
  | "assessment";

export function LessonPanel({
  lesson,
  mastered,
  platform,
  onMaster,
  diagnosticRecommendation,
  onSelectLesson,
  onEvidenceRecorded
}: {
  lesson: CourseLesson;
  mastered: boolean;
  platform: PlatformId;
  onMaster: () => void;
  diagnosticRecommendation?: DiagnosticRecommendation;
  onSelectLesson?: (lessonId: string) => void;
  onEvidenceRecorded?: () => void;
}) {
  const [mode, setMode] = useState<Mode>("learn");
  const [showTheory, setShowTheory] = useState(true);
  const evidenceKey = `devops-programme-hands-on-evidence:${lesson.id}`;
  const [handsOnEvidence, setHandsOnEvidence] = useState<Record<string, string>>({});
  const [exerciseRecorded, setExerciseRecorded] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [machineVerificationMessage, setMachineVerificationMessage] = useState("");
  const [machineResults, setMachineResults] = useState<
    Array<{
      stepId: string;
      stdout: string;
      stderr: string;
      exitCode: number;
      result: string;
    }>
  >([]);
  const command = commandForPlatform(lesson, platform);
  const handsOnTask: HandsOnTask = getHandsOnTask(lesson);
  const runtimeTask = runtimeTaskForLesson(lesson.id);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(evidenceKey);
      if (!stored) {
        setHandsOnEvidence({});
        setExerciseRecorded(false);
        setMachineResults([]);
        setMachineVerificationMessage("");
        return;
      }

      const parsed = JSON.parse(stored) as {
        evidence?: Record<string, string>;
        verified?: boolean;
        machineEnvelope?: {
          stepResults?: Array<{
            stepId: string;
            stdout: string;
            stderr: string;
            exitCode: number;
            result: string;
          }>;
        };
      };
      setHandsOnEvidence(parsed.evidence ?? {});
      setExerciseRecorded(parsed.verified === true);
      setMachineResults(parsed.machineEnvelope?.stepResults ?? []);
    } catch {
      setHandsOnEvidence({});
      setExerciseRecorded(false);
      setMachineResults([]);
      setMachineVerificationMessage("");
    }
  }, [evidenceKey]);

  useEffect(() => {
    setShowTheory(diagnosticRecommendation !== "skip-theory");
  }, [diagnosticRecommendation]);

  async function importMachineEvidence(file: File | undefined) {
    if (!file) return;

    if (!runtimeTask) {
      setMachineVerificationMessage(
        "No verified execution contract is published for this lesson. Use the manual terminal path."
      );
      return;
    }

    try {
      const source = await file.text();
      const envelope = JSON.parse(source);
      const result = recordMachineVerification({
        course: lesson.course,
        projectId: lesson.projectId,
        task: runtimeTask,
        envelope,
        summary: `Verified remote execution for ${lesson.id}`
      });

      if (!result.recorded) {
        setExerciseRecorded(false);
        setMachineVerificationMessage(
          `Machine evidence rejected: ${result.failures.join(" ")}`
        );
        return;
      }

      setExerciseRecorded(true);
      setMachineResults(envelope.stepResults ?? []);
      try {
        const existing = localStorage.getItem(evidenceKey);
        const parsedExisting = existing ? JSON.parse(existing) : {};
        localStorage.setItem(
          evidenceKey,
          JSON.stringify({
            ...parsedExisting,
            taskId: runtimeTask.taskId,
            verified: true,
            verificationLevel: "machine-verified",
            machineEnvelope: envelope,
            savedAt: new Date().toISOString()
          })
        );
      } catch {
        // Machine evidence already entered the ledger; browser persistence is best-effort.
      }
      setMachineVerificationMessage(
        "Verified execution evidence was accepted and saved locally."
      );
    } catch (error) {
      setExerciseRecorded(false);
      setMachineVerificationMessage(
        error instanceof Error
          ? `Could not read machine evidence: ${error.message}`
          : "Could not read machine evidence."
      );
    }
  }

  const remediationTarget =
    diagnosticBySection[lesson.sectionId]?.remediationLessonIds[0];

  return (
    <section className="lesson">
      <div className="lesson-head">
        <div>
          <span className="eyebrow">
            {lesson.id} · {lesson.domain} · {lesson.projectId}
          </span>
          <h2>{lesson.title}</h2>
          <p>{lesson.objective}</p>
        </div>
        <button
          className={mastered ? "mastered" : "primary"}
          onClick={onMaster}
          disabled={!exerciseRecorded && !mastered}
        >
          {mastered
            ? "Mastered"
            : exerciseRecorded
              ? "Mark complete"
              : "Complete the required exercise first"}
        </button>
      </div>

      <div className="content-card">
        <span className="eyebrow">{lesson.kind.toUpperCase()}</span>
        <h3>Remember this</h3>
        <p>{lesson.humanExample}</p>
        <p className="range">
          Course section: {lesson.sectionId} · Project: {lesson.projectId}
        </p>
      </div>

      <MotionIllustration lesson={lesson} />

      <nav className="mode-tabs">
        {(
          ["learn", "listen", "do", "recall", "design", "assessment"] as Mode[]
        ).map((item) => (
          <button
            key={item}
            className={mode === item ? "active" : ""}
            onClick={() => setMode(item)}
          >
            {item === "listen" ? "co-teacher" : item}
          </button>
        ))}
      </nav>

      {mode === "learn" && (
        <>
          <div className="content-card">
            <span className="eyebrow">THEORY ADAPTATION</span>
            <h3>
              {diagnosticRecommendation === "skip-theory"
                ? "Theory skipped"
                : diagnosticRecommendation === "condense-theory"
                  ? "Theory can be condensed"
                  : diagnosticRecommendation === "remediate"
                    ? "Remediation first"
                    : "Mental model"}
            </h3>

            {diagnosticRecommendation === "skip-theory" && !showTheory ? (
              <>
                <p>Your diagnostic shows strong prior knowledge.</p>
                <button className="secondary" onClick={() => setShowTheory(true)}>
                  Open theory anyway
                </button>
              </>
            ) : (
              <>
                <p>{lesson.objective}</p>
                <p>
                  {diagnosticRecommendation === "skip-theory"
                    ? "Theory was skipped by default. Use the exercise as the proof step, and reopen this model only when you need it."
                    : diagnosticRecommendation === "condense-theory"
                      ? "You already have the main idea. Read this once, then prove it in the exercise."
                      : diagnosticRecommendation === "remediate"
                        ? "Your prerequisite diagnostic found a knowledge gap. Complete the remediation target before relying on this theory."
                        : "Start with the smallest question that can separate two possible causes. Then test that question."}
                </p>
              </>
            )}
          </div>
          {diagnosticRecommendation === "remediate" ? (
            <div className="content-card">
              <h4>Targeted remediation</h4>
              <p>
                {diagnosticBySection[lesson.sectionId]?.remediationLessonIds.join(" · ") ??
                  "A targeted remediation lesson is not yet mapped for this section."}
              </p>
              {onSelectLesson && remediationTarget ? (
                <button
                  className="primary"
                  onClick={() => onSelectLesson(remediationTarget)}
                >
                  Open remediation
                </button>
              ) : null}
            </div>
          ) : null}
        </>
      )}

      {mode === "listen" &&
        (lesson.podcastStatus === "script-ready" && lesson.podcast ? (
          <PodcastCoach lesson={lesson} />
        ) : (
          <div className="content-card">
            <span className="eyebrow">SCRIPT READY · VOICE NOT YET ALIGNED</span>
            <h3>The spoken lesson is ready for recording</h3>
            <p>
              The script, lab, recall and assessment are ready. The voice
              recording is kept separate and React will use it only after its
              timing manifest matches this exact script version.
            </p>
          </div>
        ))}

      {mode === "do" && (
        <div className="content-card">
          <h3>Operate on {platform}</h3>
          <p>{lesson.lab.objective}</p>
          <pre>
            <code>{command}</code>
          </pre>

          {runtimeTask ? (
            <div className="content-card">
              <span className="eyebrow">OPTIONAL VERIFIED EXECUTION</span>
              <h4>Run this exercise on a real machine</h4>
              {platform === "windows" ? (
                <p>
                  Verified SSH execution is currently available for Linux and
                  macOS targets. Run the command above manually on Windows; the
                  manual path is always supported.
                </p>
              ) : (
                <>
                  <p>
                    The browser does not open SSH itself. Run the repository
                    runner from your development machine; it connects to the
                    selected real VM or physical machine, executes only the
                    allowlisted task, and returns a verification envelope.
                  </p>
                  <pre>
                    <code>{`npm run hands-on:remote -- --execute --lesson ${runtimeTask.lessonId} --platform ${platform} --host <host> --user <user>`}</code>
                  </pre>
                  <p className="range">
                    SSH host-key checking is strict. The target must already be
                    trusted by your SSH known_hosts configuration.
                  </p>
                  <label className="evidence-field">
                    <strong>Import the returned verification JSON</strong>
                    <input
                      type="file"
                      accept="application/json,.json"
                      onChange={(event) => {
                        void importMachineEvidence(event.target.files?.[0]);
                      }}
                    />
                  </label>
                  {machineVerificationMessage ? (
                    <p className="range">{machineVerificationMessage}</p>
                  ) : null}

                  {machineResults.length ? (
                    <div className="content-card">
                      <span className="eyebrow">REMOTE RESULTS</span>
                      {machineResults.map((step) => (
                        <div key={step.stepId}>
                          <h4>
                            {step.stepId} · {step.result} · exit {step.exitCode}
                          </h4>
                          {step.stdout ? (
                            <pre>
                              <code>{step.stdout}</code>
                            </pre>
                          ) : null}
                          {step.stderr ? (
                            <pre>
                              <code>{step.stderr}</code>
                            </pre>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          ) : null}

          <h4>Break / fix</h4>
          <p>{lesson.lab.challenge}</p>

          <div className="content-card">
            <span className="eyebrow">EXERCISE EVIDENCE · {handsOnTask.verificationLevel}</span>
            <h4>{handsOnTask.title}</h4>
            <p>{handsOnTask.objective}</p>
            <ol>
              {handsOnTask.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <h4>Evidence required</h4>
            {handsOnTask.evidenceFields.map((field) => (
              <label key={field.id} className="evidence-field">
                <strong>{field.label}</strong>
                <textarea
                  value={handsOnEvidence[field.id] ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setHandsOnEvidence((current) => ({
                      ...current,
                      [field.id]: value
                    }));
                    setExerciseRecorded(false);
                    setValidationMessage("");
                  }}
                  placeholder={field.kind}
                />
              </label>
            ))}

            <button
              className="primary"
              onClick={() => {
                const validation = validateHandsOnEvidence(
                  handsOnTask,
                  handsOnEvidence
                );
                if (!validation.valid) {
                  setExerciseRecorded(false);
                  setValidationMessage(validation.failures.join(" "));
                  return;
                }

                const summary = handsOnTask.evidenceFields
                  .map((field) => handsOnEvidence[field.id]?.trim())
                  .filter(Boolean)
                  .join(" | ");

                try {
                  localStorage.setItem(
                    evidenceKey,
                    JSON.stringify({
                      taskId: handsOnTask.id,
                      evidence: handsOnEvidence,
                      verified: true,
                      verificationLevel: handsOnTask.verificationLevel,
                      savedAt: new Date().toISOString()
                    })
                  );
                } catch {
                  // Local evidence is best-effort in the MVP.
                }

                recordHandsOnEvidence({
                  course: lesson.course,
                  projectId: lesson.projectId,
                  lessonId: lesson.id,
                  taskId: handsOnTask.id,
                  summary,
                  verificationLevel: handsOnTask.verificationLevel,
                  evidencePayload: handsOnEvidence
                });

                setExerciseRecorded(true);
                setValidationMessage("Evidence structure validated and saved locally.");
                onEvidenceRecorded?.();
              }}
            >
              Validate and record evidence
            </button>

            {validationMessage ? (
              <p className="range">{validationMessage}</p>
            ) : null}

            {exerciseRecorded ? (
              <p className="range">
                This task is structurally validated. It is not yet machine-verified against the learner's environment.
              </p>
            ) : null}

            <p className="range">
              Success criteria: {handsOnTask.successCriteria.join(" · ")}
            </p>
            <p className="range">
              {handsOnTask.verificationNote}
            </p>
          </div>
        </div>
      )}

      {mode === "recall" && (
        <div className="content-card">
          <h3>Retrieval</h3>
          <ol>
            {lesson.recall.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ol>
        </div>
      )}

      {mode === "design" && (
        <div className="content-card">
          <h3>Production design</h3>
          <p>
            Put this concept into a system serving millions of users. Name the
            dependency, first signal, failure domain, safe action and recovery
            check.
          </p>
        </div>
      )}

      {mode === "assessment" && (
        <AssessmentPanel
          courseId={lesson.course}
          sectionId={lesson.sectionId}
        />
      )}
    </section>
  );
}
