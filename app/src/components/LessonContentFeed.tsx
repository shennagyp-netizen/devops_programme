"use client";

import { useEffect, useMemo, useState } from "react";
import type { LessonContentBlock } from "../data/lessonContent";

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
              <div className="lesson-visual-card" role="img" aria-label={block.alt}>
                <div className="lesson-visual-head">
                  <span className="eyebrow">VISUAL EXPLANATION</span>
                  <h4>{block.heading}</h4>
                </div>
                <div className="lesson-visual-flow">
                  {block.nodes.map((node, index) => (
                    <div className="lesson-visual-node" key={`${block.id}-${node}`}>
                      <span className="pulse-dot" />
                      <strong>{node}</strong>
                      {index < block.nodes.length - 1 ? <span className="lesson-visual-arrow">→</span> : null}
                    </div>
                  ))}
                </div>
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
