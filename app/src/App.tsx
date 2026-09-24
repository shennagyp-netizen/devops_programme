import { useCallback, useEffect, useMemo, useState } from "react";
import { courses, platformProfiles, type CourseLevel, type PlatformId } from "./data/programme";
import { lessonsByCourse } from "./data/courseLessons";
import { LessonPanel } from "./components/LessonPanel";
import { Progress } from "./components/Progress";
import { DiagnosticPanel } from "./components/DiagnosticPanel";
import type { DiagnosticRecommendation } from "./data/diagnostics";
import { projectsByCourse } from "./data/projects";
import { ProjectPanel } from "./components/ProjectPanel";
import {
  completeLearningItem,
  listCompletedItems,
  uncompleteLearningItem
} from "./data/learnerProgress";

export default function App() {
  const [course, setCourse] = useState<CourseLevel>("intermediate");
  const [platform, setPlatform] = useState<PlatformId>("macos");
  const [s, setS] = useState("D1.1");
  const [diagnosticRecommendations, setDiagnosticRecommendations] =
    useState<Record<string, DiagnosticRecommendation>>({});
  const [evidenceVersion, setEvidenceVersion] = useState(0);
  const [m, setM] = useState<string[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);
  const [progressError, setProgressError] = useState("");
  const [progressBusyId, setProgressBusyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    void listCompletedItems()
      .then((items) => {
        if (!active) return;
        setM(items.filter((item) => item.itemType === "lesson").map((item) => item.itemId));
        setProgressError("");
      })
      .catch((error) => {
        if (!active) return;
        setProgressError(
          error instanceof Error
            ? "Saved progress could not be loaded: " + error.message
            : "Saved progress could not be loaded."
        );
      })
      .finally(() => {
        if (active) setProgressLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const selectedCourse = courses.find((item) => item.id === course) ?? courses[1];
  const selectedPlatform =
    platformProfiles.find((item) => item.id === platform) ?? platformProfiles[0];
  const selectedLessons = lessonsByCourse[course];

  const l = useMemo(
    () =>
      selectedLessons.find((item) => item.id === s) ??
      selectedLessons[0]!,
    [selectedLessons, s]
  );

  const completedInCourse = selectedLessons.filter((item) =>
    m.includes(item.id)
  ).length;

  const recordDiagnosticRecommendation = useCallback(
    (sectionId: string, recommendation: DiagnosticRecommendation) => {
      setDiagnosticRecommendations((current) => ({
        ...current,
        [sectionId]: recommendation
      }));
    },
    []
  );

  function changeCourse(next: CourseLevel) {
    setCourse(next);
    const first = lessonsByCourse[next][0];
    if (first) setS(first.id);
  }

  async function toggle(id: string) {
    if (progressBusyId === id) return;

    setProgressBusyId(id);
    setProgressError("");

    try {
      if (m.includes(id)) {
        await uncompleteLearningItem({
          itemType: "lesson",
          itemId: id
        });
        setM((current) => current.filter((item) => item !== id));
      } else {
        const selected = selectedLessons.find((item) => item.id === id);
        if (!selected) throw new Error("Selected lesson no longer exists.");

        await completeLearningItem({
          itemType: "lesson",
          itemId: id,
          course: selected.course,
          projectId: selected.projectId,
          verificationLevel: "exercise-validated"
        });
        setM((current) => [...current, id]);
      }
    } catch (error) {
      setProgressError(
        error instanceof Error
          ? "Progress was not saved: " + error.message
          : "Progress was not saved."
      );
    } finally {
      setProgressBusyId(null);
    }
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">DEVOPS PROGRAMME</span>
          <h1>From scattered knowledge to operational mastery.</h1>
          <p>
            Hard engineering. Easy English. Human speech. Real failure work.
          </p>
        </div>
        <Progress total={selectedLessons.length} completed={completedInCourse} />
      </header>

      <section className="content-card">
        {progressLoading ? (
          <p className="range">Loading saved progress...</p>
        ) : null}
        {progressError ? (
          <p className="range">{progressError}</p>
        ) : null}
        <div>
          <span className="eyebrow">{selectedCourse.id.toUpperCase()}</span>
          <h3>{selectedCourse.title}</h3>
          <p>{selectedCourse.purpose}</p>
        </div>

        <div className="mode-tabs">
          {courses.map((item) => (
            <button
              key={item.id}
              className={course === item.id ? "active" : ""}
              onClick={() => changeCourse(item.id)}
            >
              {item.title}
            </button>
          ))}
        </div>

        <div className="mode-tabs">
          {platformProfiles.map((item) => (
            <button
              key={item.id}
              className={platform === item.id ? "active" : ""}
              onClick={() => setPlatform(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <p className="range">
          Environment: {selectedPlatform.label} · {selectedPlatform.shell}
        </p>

        <DiagnosticPanel
          course={course}
          onRecommendation={recordDiagnosticRecommendation}
        />

        <ProjectPanel
          projects={projectsByCourse[course]}
          refreshToken={evidenceVersion}
        />

        <div className="content-card course-path">
          <div className="course-path-head">
            <div>
              <h4>Course path</h4>
              <p>
                Foundations and application sections stay separate, but they
                are used together inside the projects.
              </p>
            </div>
            <span className="coach-phase">
              {selectedCourse.projects.join(" · ")}
            </span>
          </div>

          <ol>
            {selectedCourse.sections.map((section) => (
              <li key={section.id}>
                <strong>{section.id}</strong> — {section.title}
                <span className="range"> · {section.kind}</span>
                <div>{section.humanExample}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <main className="layout">
        <aside className="sidebar">
          <h3>
            {selectedCourse.title} · {selectedLessons.length} lessons
          </h3>

          {selectedCourse.projects.map((projectId) => {
            const projectLessons = selectedLessons.filter(
              (item) => item.projectId === projectId
            );

            if (!projectLessons.length) return null;

            return (
              <div className="day" key={projectId}>
                <div className="day-title">{projectId}</div>
                <div className="range">
                  {projectLessons.length} lesson
                  {projectLessons.length === 1 ? "" : "s"}
                </div>

                {projectLessons.map((item) => (
                  <button
                    key={item.id}
                    className={
                      l.id === item.id
                        ? "lesson-link selected"
                        : "lesson-link"
                    }
                    onClick={() => setS(item.id)}
                  >
                    <span>{item.id}</span>
                    <span>{item.title}</span>
                    {m.includes(item.id) ? <b>✓</b> : null}
                  </button>
                ))}
              </div>
            );
          })}
        </aside>

        <LessonPanel
          lesson={l}
          platform={platform}
          mastered={m.includes(l.id)}
          diagnosticRecommendation={diagnosticRecommendations[l.sectionId]}
          onSelectLesson={setS}
          onEvidenceRecorded={() => setEvidenceVersion((value) => value + 1)}
          progressReady={!progressLoading}
          progressSaving={progressBusyId === l.id}
          onMaster={() => void toggle(l.id)}
        />
      </main>
    </div>
  );
}
