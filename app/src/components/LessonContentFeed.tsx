"use client";

import { useEffect, useMemo, useState } from "react";
import type { LessonContentBlock } from "../data/lessonContent";
import { LessonIllustration } from "./LessonIllustration";
import { InteractiveLessonIllustration } from "./InteractiveLessonIllustration";

type LessonContentFeedProps = {
  blocks: LessonContentBlock[];
};

export function LessonContentFeed({ blocks }: LessonContentFeedProps) {
  const ids = useMemo(() => blocks.map((block) => block.id), [blocks]);
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    setActiveId(ids[0] ?? "");
  }, [ids]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(`lesson-content-${id}`))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          setActiveId(visible.target.id.replace("lesson-content-", ""));
        }
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0.15, 0.4, 0.7] }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  function jumpTo(id: string) {
    document
      .getElementById(`lesson-content-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  }

  return (
    <section className="lesson-content-stream">
      <div className="lesson-content-stream-head">
        <div>
          <span className="eyebrow">LESSON CONTENT</span>
          <h3>Scroll the lesson</h3>
          <p>
            Read, watch, and inspect the visual explanation in one continuous
            learning feed.
          </p>
        </div>

        <nav className="lesson-content-index" aria-label="Lesson content">
          {blocks.map((block, index) => (
            <button
              key={block.id}
              className={activeId === block.id ? "active" : ""}
              onClick={() => jumpTo(block.id)}
            >
              <span>{index + 1}</span>
              {block.type === "video"
                ? "Video"
                : block.type === "illustration"
                  ? "Visual"
                  : block.type === "interactive-illustration"
                    ? "Interactive visual"
                    : "Read"}
            </button>
          ))}
        </nav>
      </div>

      <div className="lesson-content-feed">
        {blocks.map((block) => (
          <article
            className="lesson-content-item"
            id={`lesson-content-${block.id}`}
            key={block.id}
          >
            {block.type === "text" ? (
              <>
                {block.heading ? <span className="eyebrow">{block.heading}</span> : null}
                <p className="lesson-content-copy">{block.body}</p>
              </>
            ) : null}

            {block.type === "illustration" ? (
              <div
                className="lesson-visual-card"
                role="img"
                aria-label={block.alt}
                data-illustration-variant={block.variant ?? "causal-flow-v1"}
              >
                <div className="lesson-visual-head">
                  <span className="eyebrow">VISUAL EXPLANATION</span>
                  <h4>{block.heading}</h4>
                </div>
                <LessonIllustration block={block} />
                {block.caption ? <p className="range">{block.caption}</p> : null}
              </div>
            ) : null}

            {block.type === "interactive-illustration" ? (
              <div
                className="lesson-visual-card lesson-interactive-visual-card"
                role="group"
                aria-label={block.alt}
                data-illustration-binding={block.bindingId}
              >
                <div className="lesson-visual-head">
                  <span className="eyebrow">INTERACTIVE VISUAL</span>
                  <h4>{block.heading}</h4>
                </div>
                <p className="lesson-content-copy">
                  This visual is controlled by the lesson curriculum. Its
                  learner actions and completion rules come from the bound
                  illustration contract.
                </p>
                <InteractiveLessonIllustration bindingId={block.bindingId} />
                {block.caption ? <p className="range">{block.caption}</p> : null}
              </div>
            ) : null}

            {block.type === "video" ? (
              <div className="lesson-video-card">
                <div className="lesson-video-head">
                  <div>
                    <span className="eyebrow">VIDEO CONTENT</span>
                    <h4>{block.heading}</h4>
                  </div>
                  {block.durationMs ? (
                    <span className="coach-phase">
                      {Math.ceil(block.durationMs / 60000)} min
                    </span>
                  ) : null}
                </div>

                {block.status === "published" && block.src ? (
                  <video
                    className="lesson-video"
                    controls
                    playsInline
                    preload="metadata"
                    poster={block.poster}
                  >
                    <source src={block.src} />
                    {block.captionsSrc ? (
                      <track
                        kind="captions"
                        src={block.captionsSrc}
                        label="English"
                        srcLang="en"
                        default
                      />
                    ) : null}
                    Your browser does not support HTML video.
                  </video>
                ) : (
                  <div className="lesson-video-placeholder">
                    <div className="lesson-video-play">▶</div>
                    <strong>Video authoring slot</strong>
                    <p>
                      Add the published media path to this content block when
                      the recording is ready. Draft slots never attempt to load
                      a missing asset.
                    </p>
                  </div>
                )}

                {block.transcript ? (
                  <details className="lesson-video-transcript">
                    <summary>Open video transcript</summary>
                    <p>{block.transcript}</p>
                  </details>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
