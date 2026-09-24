import { useState } from "react";
import type { CourseLesson } from "../data/courseLessons";
import type { PlatformId } from "../data/programme";
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
  onMaster
}: {
  lesson: CourseLesson;
  mastered: boolean;
  platform: PlatformId;
  onMaster: () => void;
}) {
  const [mode, setMode] = useState<Mode>("learn");
  const command = lesson.platformCommands[platform] ?? lesson.lab.command;

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
        >
          {mastered ? "Mastered" : "Mark mastered"}
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
        <div className="content-card">
          <h3>Mental model</h3>
          <p>{lesson.objective}</p>
          <p>
            Start with the smallest question that can separate two possible
            causes. Then test that question.
          </p>
        </div>
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
