import { useEffect, useMemo, useState } from "react";
import type { CourseLesson } from "../data/courseLessons";
import type { PlatformId } from "../data/programme";
import type { DiagnosticRecommendation } from "../data/diagnostics";
import { diagnosticBySection } from "../data/diagnostics";
import { addEvidence, recordHandsOnEvidence } from "../data/evidence";
import {
  getHandsOnTask,
  validateHandsOnEvidence,
  type HandsOnTask
} from "../data/handsOn";
import { commandForPlatform } from "../data/platformAdapters";
import { MotionIllustration } from "./MotionIllustration";
import { LessonContentFeed } from "./LessonContentFeed";
import { PodcastCoach } from "./PodcastCoach";
import { LessonVoiceClockProvider } from "./LessonVoiceClock";
import { AssessmentPanel } from "./AssessmentPanel";
import { MasteryRemediation } from "./MasteryRemediation";
import { MasteryPreview } from "./MasteryPreview";
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
  onModeChange?: (mode: LessonMode) => void;
}) {
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
  const command = commandForPlatform(lesson, platform);
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
        return;
      }

      const parsed = JSON.parse(stored) as {
        evidence?: Record<string, string>;
        verified?: boolean;
      };
      setHandsOnEvidence(parsed.evidence ?? {});
      setExerciseRecorded(parsed.verified === true);
    } catch {
      setHandsOnEvidence({});
      setExerciseRecorded(false);
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

          <div className="content-card">
            <span className="eyebrow">MVP VERIFICATION</span>
            <h4>Run the command manually</h4>
            <p>
              Machine execution and remote evidence import are intentionally
              disabled in this MVP. Enter the observations and recovery evidence
              below; this browser stores the structured evidence locally.
            </p>
          </div>

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
