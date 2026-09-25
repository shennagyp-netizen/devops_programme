import Link from "next/link";
import type { Metadata } from "next";
import { animationLibrary } from "../../animations";

export const metadata: Metadata = {
  title: "Animation Library | DevOps Programme",
  description: "Standalone reusable DevOps system animations."
};

export default function AnimationsPage() {
  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <div className="eyebrow">VISUAL CAPABILITY LIBRARY</div>
          <h1>Standalone DevOps Animations</h1>
          <p>
            Reusable visual capabilities can be opened and played without entering a course,
            lesson, assessment or learner-progress flow.
          </p>
        </div>
      </section>

      <section className="animation-gallery" aria-labelledby="animation-gallery-title">
        <div>
          <div className="eyebrow">AVAILABLE CAPABILITIES</div>
          <h2 id="animation-gallery-title">Animation library</h2>
        </div>

        <div className="animation-gallery-grid">
          {animationLibrary.map((animation) => (
            <article className="animation-gallery-card" key={animation.id}>
              <div className="animation-gallery-card-head">
                <span className="eyebrow">ANIMATION</span>
                <code>{animation.id}</code>
              </div>
              <h3>{animation.title}</h3>
              <p>{animation.accessibility.description}</p>
              <Link className="primary animation-open-link" href={"/animations/" + animation.id}>
                Open standalone preview
              </Link>
            </article>
          ))}
        </div>
      </section>

      <Link className="secondary animation-back-link" href="/learn">
        Return to learning gateway
      </Link>
    </main>
  );
}
