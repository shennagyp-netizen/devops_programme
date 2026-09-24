import { useEffect, useState } from "react";
import type { CourseLesson } from "../data/courseLessons";
import type { PlatformId } from "../data/programme";
import type { DiagnosticRecommendation } from "../data/diagnostics";
import { diagnosticBySection } from "../data/diagnostics";
import { recordHandsOnEvidence } from "../data/evidence";
import {
  getHandsOnTask,
  validateHandsOnEvidence,
  type HandsOnTask
} from "../data/handsOn";
import { commandForPlatform } from "../data/platformAdapters";
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
  const command = commandForPlatform(lesson, platform);
  const handsOnTask: HandsOnTask = getHandsOnTask(lesson);

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
    setShowTheory(diagnosticRecommendation !== "skip-theory");
  }, [diagnosticRecommendation]);

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
          <h4>Break / fix</h4>
          <p>{lesson.lab.challenge}</p>

          <div className="content-card">
            <span className="eyebrow">EXERCISE EVIDENCE · ${handsOnTask.verificationLevel}</span>
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
