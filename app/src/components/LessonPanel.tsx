import { useEffect, useMemo, useState } from "react";
import type { CourseLesson } from "../data/courseLessons";
import type { PlatformId } from "../data/programme";
import type { DiagnosticRecommendation } from "../data/diagnostics";
import type { MasteryAttemptRecord } from "../lib/mastery-contract";
import { diagnosticBySection } from "../data/diagnostics";
import { addEvidence, recordHandsOnEvidence, recordMachineVerification } from "../data/evidence";
import {
  getHandsOnTask,
  validateHandsOnEvidence,
  type HandsOnTask
} from "../data/handsOn";
import { commandForPlatform } from "../data/platformAdapters";
import { runtimeTaskForLesson } from "../data/runtimeVerification";
import {
  getLocalTerminalToken,
  localTerminalAgentStatus,
  runLocalTerminalTask,
  setLocalTerminalToken
} from "../data/localTerminalAgent";
import { MotionIllustration } from "./MotionIllustration";
import { LessonContentFeed } from "./LessonContentFeed";
import { PodcastCoach } from "./PodcastCoach";
import { LessonVoiceClockProvider } from "./LessonVoiceClock";
import { AssessmentPanel } from "./AssessmentPanel";
import { MasteryRemediation } from "./MasteryRemediation";
import { MasteryPreview } from "./MasteryPreview";
import { recordMasteryAttemptAction } from "../app/actions/progress";
import {
  getMasteryPlan,
  masteryStorageKey,
  readMasteryAttempts,
  recordMasteryFailure,
  resetMasteryAttempts,
  type MasteryPlan
} from "../data/mastery";

export type LessonMode = "learn" | "do" | "recall" | "design" | "assessment";

export function LessonPanel({
  lesson,
  mastered,
  platform,
  onMaster,
  diagnosticRecommendation,
  onSelectLesson,
  onEvidenceRecorded,
  progressReady = true,
  progressSaving = false,
  initialMasteryHistory = [],
  onModeChange
}: {
  lesson: CourseLesson;
  mastered: boolean;
  platform: PlatformId;
  onMaster: () => void;
  diagnosticRecommendation?: DiagnosticRecommendation;
  onSelectLesson?: (lessonId: string) => void;
  onEvidenceRecorded?: () => void;
  progressReady?: boolean;
  progressSaving?: boolean;
  initialMasteryHistory?: MasteryAttemptRecord[];
  onModeChange?: (mode: LessonMode) => void;
}) {
  void initialMasteryHistory;
  const [mode, setMode] = useState<LessonMode>("learn");
  const [showTheory, setShowTheory] = useState(true);
  const evidenceKey = `devops-programme-hands-on-evidence:${lesson.id}`;
  const [handsOnEvidence, setHandsOnEvidence] = useState<Record<string, string>>({});
  const [exerciseRecorded, setExerciseRecorded] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [masteryPlan, setMasteryPlan] = useState<MasteryPlan | null>(null);
  const [masteryReadyForRetry, setMasteryReadyForRetry] = useState(true);
  const [masteryAttempts, setMasteryAttempts] = useState(0);
  const [exerciseCheckpointAnswer, setExerciseCheckpointAnswer] = useState<number | null>(null);
  const [machineVerificationMessage, setMachineVerificationMessage] = useState("");
  const [localAgentAvailable, setLocalAgentAvailable] = useState(false);
  const [localAgentPlatform, setLocalAgentPlatform] = useState<string | null>(null);
  const [localAgentInfo, setLocalAgentInfo] = useState("Not connected");
  const [localAgentToken, setLocalAgentTokenState] = useState(getLocalTerminalToken());
  const [localAgentRunning, setLocalAgentRunning] = useState(false);
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
  const runtimeTask = runtimeTaskForLesson(lesson.id);
  const handsOnTask: HandsOnTask = getHandsOnTask(lesson);
  const masteryCheckpoint = useMemo(
    () => getMasteryPlan(lesson, handsOnTask, [], 0).checkpoint,
    [lesson, handsOnTask]
  );
  const masteryKey = masteryStorageKey(lesson.id);

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
        validated?: boolean;
        verified?: boolean;
      };
      setHandsOnEvidence(parsed.evidence ?? {});
      setExerciseRecorded(parsed.validated === true || parsed.verified === true);
      setMachineResults([]);
    } catch {
      setHandsOnEvidence({});
      setExerciseRecorded(false);
      setMachineResults([]);
      setMachineVerificationMessage("");
    }
  }, [evidenceKey]);

  useEffect(() => {
    const attempts = readMasteryAttempts(lesson.id);
    setMasteryAttempts(attempts);
    setMasteryPlan(null);
    setMasteryReadyForRetry(true);
    setExerciseCheckpointAnswer(null);
  }, [lesson.id, masteryKey]);

  useEffect(() => {
    setShowTheory(diagnosticRecommendation !== "skip-theory");
  }, [diagnosticRecommendation]);

  useEffect(() => {
    setMode("learn");
    onModeChange?.("learn");
  }, [lesson.id, onModeChange]);

  useEffect(() => {
    let active = true;

    async function checkAgent() {
      const status = await localTerminalAgentStatus();
      if (!active) return;

      if (status.available) {
        setLocalAgentAvailable(true);
        setLocalAgentPlatform(status.platform);
        setLocalAgentInfo(
          `Connected · ${status.platform} · agent ${status.version}`
        );
      } else {
        setLocalAgentAvailable(false);
        setLocalAgentPlatform(null);
        setLocalAgentInfo(status.reason);
      }
    }

    void checkAgent();
    const interval = window.setInterval(() => {
      void checkAgent();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  async function runOnLaptop() {
    if (!runtimeTask) return;

    if (!localAgentToken.trim()) {
      setMachineVerificationMessage(
        "Start the DevOps terminal agent and enter its pairing token first."
      );
      return;
    }

    setLocalAgentRunning(true);
    setMachineVerificationMessage(
      "Running the verified exercise on this laptop..."
    );

    try {
      const envelope = await runLocalTerminalTask({
        taskId: runtimeTask.taskId,
        platform,
        token: localAgentToken
      });

      const result = recordMachineVerification({
        course: lesson.course,
        projectId: lesson.projectId,
        task: runtimeTask,
        envelope,
        summary: `Verified laptop execution for ${lesson.id}`
      });

      if (!result.recorded) {
        setExerciseRecorded(false);
        setMachineResults(envelope.stepResults ?? []);
        setMachineVerificationMessage(
          `Laptop execution returned invalid evidence: ${result.failures.join(" ")}`
        );
        startMasteryRemediation(result.failures, "mechanism-reteach");
        return;
      }

      const isFullExerciseVerification = runtimeTask.scope === "exercise";
      setExerciseRecorded(isFullExerciseVerification);
      setMachineResults(envelope.stepResults ?? []);
      setMachineVerificationMessage(
        runtimeTask.scope === "exercise"
          ? "Laptop terminal execution verified for this session."
          : "Laptop probe execution verified for this session. Complete the required hands-on exercise below to unlock the lesson."
      );
      onEvidenceRecorded?.();
    } catch (error) {
      setExerciseRecorded(false);
      const message =
        error instanceof Error
          ? error.message
          : "Laptop terminal execution failed.";
      setMachineVerificationMessage(
        `Laptop terminal execution failed: ${message}`
      );
      startMasteryRemediation([message], "mechanism-reteach");
    } finally {
      setLocalAgentRunning(false);
    }
  }

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

      const isFullExerciseVerification = runtimeTask.scope === "exercise";
      setExerciseRecorded(isFullExerciseVerification);
      setMachineResults(envelope.stepResults ?? []);
      setMachineVerificationMessage(
        isFullExerciseVerification
          ? "Verified execution evidence was accepted for this session."
          : "Machine probe evidence was accepted. Complete the required hands-on exercise below to unlock the lesson."
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

  function startMasteryRemediation(failures: string[], stageOverride?: MasteryPlan["stage"]) {
    const attempt = recordMasteryFailure(lesson.id);
    const plan = getMasteryPlan(
      lesson,
      handsOnTask,
      failures,
      attempt - 1
    );

    const finalPlan =
      stageOverride && stageOverride !== plan.stage
        ? { ...plan, stage: stageOverride }
        : plan;

    setMasteryAttempts(attempt);
    setMasteryPlan(finalPlan);
    setMasteryReadyForRetry(false);
    setExerciseRecorded(false);
    setExerciseCheckpointAnswer(null);

    void recordMasteryAttemptAction({
      lessonId: lesson.id,
      taskId: handsOnTask.id,
      outcome: "failure",
      stage: finalPlan.stage,
      summary: failures.join(" ")
    }).catch(() => {
      // Local remediation remains available if server telemetry is temporarily unavailable.
    });
  }

  const remediationTarget =
    diagnosticBySection[lesson.sectionId]?.remediationLessonIds[0];

  return (
    <LessonVoiceClockProvider>
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
          disabled={
            !progressReady ||
            progressSaving ||
            (!exerciseRecorded && !mastered)
          }
        >
          {!progressReady
            ? "Loading saved progress..."
            : progressSaving
              ? "Saving..."
              : mastered
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

      <PodcastCoach lesson={lesson} />

      {mode === "learn" ? (
        <>
          <LessonContentFeed blocks={lesson.content.blocks} />
          <MasteryPreview lesson={lesson} task={handsOnTask} />
        </>
      ) : null}

      <nav className="mode-tabs">
        {(["learn", "do", "recall", "design", "assessment"] as LessonMode[]).map((item) => (
          <button
            key={item}
            className={mode === item ? "active" : ""}
            onClick={() => {
            setMode(item);
            onModeChange?.(item);
          }}
          >
            {item}
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

      {mode === "do" && (
        <div className="content-card">
          <h3>Operate on {platform}</h3>
          <p>{lesson.lab.objective}</p>
          <pre>
            <code>{command}</code>
          </pre>

          {runtimeTask ? (
            <div className="content-card">
              <span className="eyebrow">VERIFIED LAPTOP TERMINAL</span>
              <h4>Run this exercise directly from the website</h4>
              <p>
                The website can use the DevOps terminal agent installed on this
                laptop. The browser never receives arbitrary shell access; it
                sends only this lesson's allowlisted task to the local agent.
              </p>

              <p className="range">{localAgentInfo}</p>
              {localAgentAvailable && localAgentPlatform !== platform ? (
                <p className="range">
                  Select {localAgentPlatform} as the course environment to run
                  this lesson directly on this laptop, or use the manual
                  terminal path.
                </p>
              ) : null}

              {!localAgentAvailable ? (
                <>
                  <p>Start the local agent once on this laptop:</p>
                  <pre>
                    <code>npm run terminal-agent</code>
                  </pre>
                </>
              ) : null}

              <label className="evidence-field">
                <strong>Pair this browser with the local agent</strong>
                <input
                  type="password"
                  value={localAgentToken}
                  onChange={(event) => {
                    const value = event.target.value;
                    setLocalAgentTokenState(value);
                    setLocalTerminalToken(value);
                  }}
                  placeholder="Paste the pairing token printed by the agent"
                />
              </label>

              <button
                className="primary"
                disabled={
                  !localAgentAvailable ||
                  !localAgentToken.trim() ||
                  localAgentRunning ||
                  localAgentPlatform !== platform
                }
                onClick={() => {
                  void runOnLaptop();
                }}
              >
                {localAgentRunning
                  ? "Running on this laptop..."
                  : "Run verified exercise on this laptop"}
              </button>

              <p className="range">
                This uses the laptop's real terminal environment. If the agent
                is not available, use the manual terminal instructions below.
              </p>

              {machineVerificationMessage ? (
                <p className="range">{machineVerificationMessage}</p>
              ) : null}

              {machineResults.length ? (
                <div className="content-card">
                  <span className="eyebrow">LAPTOP TERMINAL RESULTS</span>
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

              {platform !== "windows" ? (
                <details>
                  <summary>Optional remote machine</summary>
                  <p>
                    SSH remote execution remains available for a real VM or
                    physical machine.
                  </p>
                  <pre>
                    <code>{`npm run hands-on:remote -- --execute --lesson ${runtimeTask.lessonId} --platform ${platform} --host <host> --user <user>`}</code>
                  </pre>
                  <label className="evidence-field">
                    <strong>Import remote verification JSON</strong>
                    <input
                      type="file"
                      accept="application/json,.json"
                      onChange={(event) => {
                        void importMachineEvidence(event.target.files?.[0]);
                      }}
                    />
                  </label>
                </details>
              ) : null}
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

            {masteryCheckpoint ? (
              <div className="content-card">
                <span className="eyebrow">MASTERY PROOF CHECK</span>
                <h4>Predict before you submit</h4>
                <p>{masteryCheckpoint.prompt}</p>
                <div className="difficulty-grid">
                  {masteryCheckpoint.options.map((option, index) => (
                    <button
                      key={option}
                      className={exerciseCheckpointAnswer === index ? "active" : ""}
                      onClick={() => {
                        setExerciseCheckpointAnswer(index);
                        setValidationMessage("");
                      }}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

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
              disabled={!masteryReadyForRetry || Boolean(masteryCheckpoint && exerciseCheckpointAnswer === null)}
              onClick={() => {
                if (
                  masteryCheckpoint &&
                  exerciseCheckpointAnswer !== masteryCheckpoint.correctOption
                ) {
                  startMasteryRemediation(
                    ["The mastery proof check was answered incorrectly. Rebuild the concept before retrying."],
                    "foundation-reteach"
                  );
                  setValidationMessage(
                    "The proof check did not match the required prediction. Complete the remediation before retrying."
                  );
                  return;
                }

                const validation = validateHandsOnEvidence(
                  handsOnTask,
                  handsOnEvidence
                );
                if (!validation.valid) {
                  const attempt = recordMasteryFailure(lesson.id);
                  const plan = getMasteryPlan(
                    lesson,
                    handsOnTask,
                    validation.failures,
                    attempt - 1
                  );

                  setMasteryAttempts(attempt);
                  setMasteryPlan(plan);
                  setMasteryReadyForRetry(false);
                  setExerciseRecorded(false);
                  setValidationMessage(
                    "Attempt " +
                      attempt +
                      " did not yet prove the exercise contract. Complete the guided remediation before retrying."
                  );

                  addEvidence({
                    course: lesson.course,
                    projectId: lesson.projectId,
                    lessonId: lesson.id,
                    kind: "failure",
                    summary:
                      "Hands-on attempt " +
                      attempt +
                      " failed: " +
                      validation.failures.join(" "),
                    taskId: handsOnTask.id,
                    verificationLevel: handsOnTask.verificationLevel,
                    evidencePayload: { ...handsOnEvidence }
                  });


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
                      validated: true,
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

                resetMasteryAttempts(lesson.id);
                setMasteryAttempts(0);
                setMasteryPlan(null);
                setMasteryReadyForRetry(true);
                setExerciseCheckpointAnswer(null);
                setExerciseRecorded(true);
                setValidationMessage("Evidence structure validated and saved locally.");


                onEvidenceRecorded?.();
              }}
            >
              {masteryReadyForRetry
                ? "Validate and record evidence"
                : "Complete remediation first"}
            </button>

            {masteryPlan ? (
              <MasteryRemediation
                plan={masteryPlan}
                onReadyForRetry={() => {
                  setMasteryReadyForRetry(true);
                  setExerciseCheckpointAnswer(null);
                  setValidationMessage(
                    "Remediation complete after attempt " +
                      masteryAttempts +
                      ". Retry the assignment with the new explanation path."
                  );
                }}
              />
            ) : null}

            {validationMessage ? (
              <p className="range">{validationMessage}</p>
            ) : null}

            {exerciseRecorded ? (
              <p className="range">
                This task is structurally validated from learner-entered evidence only. It is not machine-verified in the MVP.
              </p>
            ) : null}

            <p className="range">
              Success criteria: {handsOnTask.successCriteria.join(" · ")}
            </p>
            <p className="range">
              {handsOnTask.verificationNote}
              <br />
              MVP note: browser-local evidence is a learning aid, not an authoritative certification record.
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
    </LessonVoiceClockProvider>
  );
}
