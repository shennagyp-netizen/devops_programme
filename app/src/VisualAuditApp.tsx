"use client";

import { useMemo, useState } from "react";
import {
  courses,
  platformProfiles,
  type CourseLevel,
  type PlatformId
} from "../data/programme";
import { lessonsByCourse } from "../data/courseLessons";
import { LessonPanel } from "../components/LessonPanel";
import { Progress } from "../components/Progress";
import { DiagnosticPanel } from "../components/DiagnosticPanel";
import type { DiagnosticRecommendation } from "../data/diagnostics";
import { projectsByCourse } from "../data/projects";
import { ProjectPanel } from "../components/ProjectPanel";

export default function VisualAuditApp() {
  const [course, setCourse] = useState<CourseLevel>("intermediate");
  const [platform, setPlatform] = useState<PlatformId>("macos");
  const [selectedLessonId, setSelectedLessonId] = useState("D1.1");
  const [recommendations, setRecommendations] = useState<
    Record<string, DiagnosticRecommendation>
  >({});
  const [mastered, setMastered] = useState<string[]>([]);
  const [evidenceVersion, setEvidenceVersion] = useState(0);

  const selectedCourse = courses.find((item) => item.id === course) ?? courses[1];
  const selectedLessons = lessonsByCourse[course];
  const selectedPlatform =
    platformProfiles.find((item) => item.id === platform) ?? platformProfiles[0];

  const lesson =
    selectedLessons.find((item) => item.id === selectedLessonId) ??
    selectedLessons[0]!;

  const completedInCourse = useMemo(
    () => selectedLessons.filter((item) => mastered.includes(item.id)).length,
    [mastered, selectedLessons]
  );

  function changeCourse(next: CourseLevel) {
    setCourse(next);
    setSelectedLessonId(lessonsByCourse[next][0]?.id ?? "");
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">DEVOPS PROGRAMME · VISUAL AUDIT</span>
          <h1>From scattered knowledge to operational mastery.</h1>
          <p>
            Hard engineering. Easy English. Human speech. Real failure work.
          </p>
          <p className="range">
            Temporary authentication-independent visual QA route. Learner
            authentication and persistent progress remain on the protected
            production path.
          </p>
        </div>
        <Progress total={selectedLessons.length} completed={completedInCourse} />
      </header>

      <section className="content-card">
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
          onRecommendation={(sectionId, recommendation) =>
            setRecommendations((current) => ({
              ...current,
              [sectionId]: recommendation
            }))
          }
        />

        <ProjectPanel
          projects={projectsByCourse[course]}
          refreshToken={evidenceVersion}
        />
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
                      lesson.id === item.id
                        ? "lesson-link selected"
                        : "lesson-link"
                    }
                    onClick={() => setSelectedLessonId(item.id)}
                  >
                    <span>{item.id}</span>
                    <span>{item.title}</span>
                    {mastered.includes(item.id) ? <b>✓</b> : null}
                  </button>
                ))}
              </div>
            );
          })}
        </aside>

        <LessonPanel
          lesson={lesson}
          platform={platform}
          mastered={mastered.includes(lesson.id)}
          diagnosticRecommendation={recommendations[lesson.sectionId]}
          onSelectLesson={setSelectedLessonId}
          onEvidenceRecorded={() => setEvidenceVersion((value) => value + 1)}
          progressReady={true}
          progressSaving={false}
          onMaster={() =>
            setMastered((current) =>
              current.includes(lesson.id) ? current : [...current, lesson.id]
            )
          }
        />
      </main>
    </div>
  );
}
