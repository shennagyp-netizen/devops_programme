import { useMemo, useState } from "react";
import { days, lessons } from "./data/curriculum";
import { courses, platformProfiles, type CourseLevel, type PlatformId } from "./data/programme";
import { LessonPanel } from "./components/LessonPanel";
import { Progress } from "./components/Progress";

const K = "devops-programme-mastered";

export default function App() {
  const [s, setS] = useState(lessons[0].id);
  const [course, setCourse] = useState<CourseLevel>("intermediate");
  const [platform, setPlatform] = useState<PlatformId>("macos");
  const [m, setM] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(K) || "[]");
    } catch {
      return [];
    }
  });

  const l = useMemo(
    () => lessons.find((x) => x.id === s) ?? lessons[0],
    [s]
  );

  const selectedCourse = courses.find((x) => x.id === course) ?? courses[1];
  const selectedPlatform =
    platformProfiles.find((x) => x.id === platform) ?? platformProfiles[0];

  function toggle(id: string) {
    const n = m.includes(id) ? m.filter((x) => x !== id) : [...m, id];
    setM(n);
    localStorage.setItem(K, JSON.stringify(n));
  }

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">DEVOPS PROGRAMME</span>
          <h1>From scattered knowledge to operational mastery.</h1>
          <p>Three course levels. Platform-aware labs. Evidence-driven assessment.</p>
        </div>
        <Progress total={lessons.length} completed={m.length} />
      </header>

      <section className="content-card">
        <div>
          <h3>Learning profile</h3>
          <p>
            {selectedCourse.title}: {selectedCourse.purpose}
          </p>
        </div>
        <div className="mode-tabs">
          {courses.map((item) => (
            <button
              key={item.id}
              className={course === item.id ? "active" : ""}
              onClick={() => setCourse(item.id)}
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
      </section>

      <main className="layout">
        <aside className="sidebar">
          <h3>Curriculum</h3>
          {days.map((d) => (
            <div className="day" key={d.id}>
              <div className="day-title">{d.title}</div>
              <div className="range">{d.range}</div>
              {lessons
                .filter((x) => x.id.startsWith(d.id))
                .map((x) => (
                  <button
                    key={x.id}
                    className={
                      l.id === x.id ? "lesson-link selected" : "lesson-link"
                    }
                    onClick={() => setS(x.id)}
                  >
                    <span>{x.id}</span>
                    <span>{x.title}</span>
                    {m.includes(x.id) ? <b>✓</b> : null}
                  </button>
                ))}
            </div>
          ))}
        </aside>
        <LessonPanel
          lesson={l}
          mastered={m.includes(l.id)}
          onMaster={() => toggle(l.id)}
        />
      </main>
    </div>
  );
}
