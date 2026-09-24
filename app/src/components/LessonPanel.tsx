import { useEffect, useState } from "react";
import type { CourseLesson } from "../data/courseLessons";
import type { PlatformId } from "../data/programme";
import type { DiagnosticRecommendation } from "../data/diagnostics";
import { diagnosticBySection } from "../data/diagnostics";
import { addEvidence } from "../data/evidence";
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
  const evidenceKey = `devops-programme-exercise-evidence:${lesson.id}`;
  const [exerciseEvidence, setExerciseEvidence] = useState(() => {
    try {
      return localStorage.getItem(evidenceKey) ?? "";
    } catch {
      return "";
    }
  });
  const [exerciseRecorded, setExerciseRecorded] = useState(() => {
    try {
      return Boolean(localStorage.getItem(evidenceKey));
    } catch {
      return false;
    }
  });
  const command = lesson.platformCommands[platform] ?? lesson.lab.command;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(evidenceKey) ?? "";
      setExerciseEvidence(stored);
      setExerciseRecorded(Boolean(stored));
    } catch {
      setExerciseEvidence("");
      setExerciseRecorded(false);
    }
  }, [evidenceKey]);
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
                ? "Theory can be skipped"
                : diagnosticRecommendation === "condense-theory"
                  ? "Theory can be condensed"
                  : diagnosticRecommendation === "remediate"
                    ? "Remediation first"
                    : "Mental model"}
            </h3>
            <p>{lesson.objective}</p>
            <p>
              {diagnosticRecommendation === "skip-theory"
                ? "Your prerequisite diagnostic shows strong prior knowledge. Go straight to the exercise, and return to this model only when you need it."
                : diagnosticRecommendation === "condense-theory"
                  ? "You already have the main idea. Read this once, then prove it in the exercise."
                  : diagnosticRecommendation === "remediate"
                    ? "Your prerequisite diagnostic found a knowledge gap. Complete the remediation target before relying on this theory."
                    : "Start with the smallest question that can separate two possible causes. Then test that question."}
            </p>
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
            <span className="eyebrow">EXERCISE EVIDENCE</span>
            <h4>What did you actually observe?</h4>
            <p>
              Record the key observation and the evidence that supports your
              diagnosis or recovery. This is a local self-report for now; the
              future hands-on engine will replace it with machine-verified evidence.
            </p>
            <textarea
              value={exerciseEvidence}
              onChange={(event) => {
                const value = event.target.value;
                setExerciseEvidence(value);
                setExerciseRecorded(false);
                try {
                  if (value.trim()) {
                    localStorage.setItem(evidenceKey, value);
                  } else {
                    localStorage.removeItem(evidenceKey);
                  }
                } catch {
                  // Local evidence is best-effort in the MVP.
                }
              }}
              placeholder="Example: DNS resolved, TCP connected, but TLS failed after the certificate changed."
            />
            <button
              className="primary"
              disabled={!exerciseEvidence.trim()}
              onClick={() => {
                try {
                  localStorage.setItem(evidenceKey, exerciseEvidence);
                } catch {
                  // Local evidence is best-effort in the MVP.
                }
                addEvidence({
                  course: lesson.course,
                  projectId: lesson.projectId,
                  lessonId: lesson.id,
                  kind: "exercise",
                  summary: exerciseEvidence.trim()
                });
                setExerciseRecorded(true);
                onEvidenceRecorded?.();
              }}
            >
              Record exercise evidence
            </button>
            {exerciseRecorded ? (
              <p className="range">
                Exercise evidence recorded locally. You can now mark this lesson complete.
              </p>
            ) : null}
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
