import Link from "next/link";
import type { Metadata } from "next";
import { courses } from "../data/programme";
import { MarketingHeroIllustration } from "../components/MarketingHeroIllustration";

export const metadata: Metadata = {
  title: "DevOps Programme — Production Engineering",
  description:
    "A structured DevOps learning programme built around real systems, controlled failures, diagnosis and recovery."
};

const courseSummaries = [
  {
    id: "beginner",
    eyebrow: "BEGINNER",
    outcome: "Build the operating foundations before the tools become noise.",
    facts: "10 lessons · 3 projects · 7 diagnostics"
  },
  {
    id: "intermediate",
    eyebrow: "INTERMEDIATE",
    outcome: "Operate Linux, networking, containers, Kubernetes, CI/CD and reliability as one system.",
    facts: "32 lessons · 3 projects · 8 diagnostics"
  },
  {
    id: "advanced",
    eyebrow: "ADVANCED",
    outcome: "Reason about capacity, distributed state, failure domains and recovery at scale.",
    facts: "11 lessons · 3 projects · 6 diagnostics"
  }
] as const;

export default function HomePage() {
  return (
    <main className="marketing-shell">
      <nav className="marketing-nav" aria-label="Main navigation">
        <Link className="marketing-brand" href="/">
          <span className="eyebrow">DEVOPS</span>
          <strong>PROGRAMME</strong>
        </Link>
        <div className="marketing-nav-links">
          <a href="#courses">Courses</a>
          <a href="#method">How it works</a>
          <a href="#projects">Projects</a>
          <Link href="/learn">Learning gateway</Link>
        </div>
      </nav>

      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <span className="eyebrow">PRODUCTION ENGINEERING · NOT TOOL MEMORIZATION</span>
          <h1>Learn DevOps by operating systems, breaking them, and recovering them.</h1>
          <p className="marketing-lead">
            A structured programme for people who want to understand what is
            happening inside real infrastructure, not just memorize commands.
            Start from a problem, collect evidence, diagnose the mechanism,
            repair it, and prove recovery.
          </p>
          <div className="marketing-actions">
            <Link className="primary marketing-cta" href="/learn">
              Start learning
            </Link>
            <a className="secondary marketing-cta" href="#courses">
              Explore the programme
            </a>
          </div>
          <div className="marketing-proof-row">
            <span>53 authored lessons</span>
            <span>9 continuous projects</span>
            <span>21 diagnostics</span>
            <span>Real failure work</span>
          </div>
        </div>

        <div className="marketing-hero-panel">
          <div className="eyebrow">THE OPERATING LOOP</div>
          <MarketingHeroIllustration />
          <p>
            The programme turns each concept into an operating loop: understand
            the mechanism, predict the result, make a controlled change, create
            a failure, diagnose the cause, repair it, and prove recovery.
          </p>
        </div>
      </section>

      <section className="marketing-section" id="courses">
        <div className="marketing-section-head">
          <div>
            <span className="eyebrow">PROGRAMME PATH</span>
            <h2>Three levels. One engineering model.</h2>
          </div>
          <p>
            Move from concrete operational problems to production systems and
            then to large-scale distributed-system reasoning.
          </p>
        </div>

        <div className="marketing-course-grid">
          {courseSummaries.map((summary) => {
            const course = courses.find((item) => item.id === summary.id)!;
            return (
              <article className="marketing-course-card" key={summary.id}>
                <div className="marketing-card-topline">
                  <span className="eyebrow">{summary.eyebrow}</span>
                  <span className="marketing-card-count">{summary.facts}</span>
                </div>
                <h3>{course.title}</h3>
                <p>{summary.outcome}</p>
                <div className="marketing-section-list">
                  {course.sections.slice(0, 4).map((section) => (
                    <span key={section.id}>
                      <b>{section.id}</b>
                      {section.title}
                    </span>
                  ))}
                </div>
                <Link href="/learn" className="secondary marketing-course-link">
                  View learning path
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="marketing-section marketing-method" id="method">
        <div>
          <span className="eyebrow">HOW LEARNING WORKS</span>
          <h2>Less passive watching. More controlled engineering.</h2>
          <p>
            Every section connects theory to evidence and every required
            exercise has a recovery boundary. Diagnostics can reduce repeated
            theory, but they do not remove the hands-on work.
          </p>
        </div>

        <div className="marketing-method-grid">
          <article>
            <span className="marketing-number">01</span>
            <h3>Build a mental model</h3>
            <p>Use clear mechanisms and predictions before touching the system.</p>
          </article>
          <article>
            <span className="marketing-number">02</span>
            <h3>Operate a real task</h3>
            <p>Run commands, inspect state, make a controlled change and observe the result.</p>
          </article>
          <article>
            <span className="marketing-number">03</span>
            <h3>Break it on purpose</h3>
            <p>Failure is part of the lesson, not a surprise at the end.</p>
          </article>
          <article>
            <span className="marketing-number">04</span>
            <h3>Prove recovery</h3>
            <p>Finish with evidence that the system returned to the intended state.</p>
          </article>
        </div>
      </section>

      <section className="marketing-section marketing-projects" id="projects">
        <div className="marketing-section-head">
          <div>
            <span className="eyebrow">PROJECT SPINE</span>
            <h2>Learning stays connected to systems.</h2>
          </div>
          <p>
            Projects are continuous environments rather than one-off final
            assignments. You change them, break them, recover them and redesign
            them as your skills grow.
          </p>
        </div>

        <div className="marketing-project-rail">
          {[
            ["B", "Foundation systems", "Concrete Linux, networking, delivery and recovery problems."],
            ["I", "Production platform", "Containers, Kubernetes, infrastructure, observability and incidents."],
            ["A", "Distributed scale", "Global traffic, partial failure, capacity and recovery constraints."]
          ].map(([code, title, description]) => (
            <article key={code}>
              <span className="marketing-project-code">{code}</span>
              <div>
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-final-cta">
        <div>
          <span className="eyebrow">READY TO WORK?</span>
          <h2>Start the programme immediately.</h2>
          <p>
            This MVP has no account or sign-in flow. Your learning progress is
            stored only in this browser so you can start without setup.
          </p>
        </div>
        <Link className="primary marketing-cta" href="/learn">
          Start learning
        </Link>
      </section>

      <footer className="marketing-footer">
        <span>DevOps Programme</span>
        <span>Structured learning · Real failure work · Browser-local MVP progress</span>
      </footer>
    </main>
  );
}
