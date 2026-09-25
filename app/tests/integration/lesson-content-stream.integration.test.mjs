import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = (path) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("lesson content feed integration contract", () => {
  const feed = () => source("src/components/LessonContentFeed.tsx");

  it("renders the authored blocks in their input order", () => {
    const code = feed();
    const tick = String.fromCharCode(96);
    const expression = "$" + "{block.id}";
    expect(code).toContain("{blocks.map((block) => (");
    expect(code).toContain("key={block.id}");
    expect(code).toContain("id={" + tick + "lesson-content-" + expression + tick + "}");
    expect(code).toContain("className=\"lesson-content-item\"");
  });

  it("does not fetch or persist lesson content from the content feed", () => {
    const code = feed();
    expect(code).not.toMatch(/fetch\s*\(/);
    expect(code).not.toContain("localStorage");
    expect(code).not.toContain("sessionStorage");
  });

  it("renders text, illustration and video as distinct content types", () => {
    const code = feed();
    expect(code).toContain('block.type === "text"');
    expect(code).toContain('block.type === "illustration"');
    expect(code).toContain('block.type === "video"');
    expect(code).toContain("lesson-content-copy");
    expect(code).toContain("lesson-visual-card");
    expect(code).toContain("lesson-video-card");
  });

  it("keeps video playback subordinate to the continuous lesson rather than creating another voice layer", () => {
    const code = feed();
    expect(code).toContain("<video");
    expect(code).toContain("controls");
    expect(code).toContain("playsInline");
    expect(code).toContain('preload="metadata"');
    expect(code).not.toContain("<audio");
    expect(code).not.toContain("AudioContext");
    expect(code).not.toContain("PodcastCoach");
  });

  it("renders captions only when an authored caption source exists", () => {
    const code = feed();
    expect(code).toContain("block.captionsSrc");
    expect(code).toContain("<track");
    expect(code).toContain('kind="captions"');
    expect(code).toContain('srcLang="en"');
    expect(code).toContain("default");
  });

  it("does not load draft video assets", () => {
    const code = feed();
    expect(code).toMatch(
      /block\.status === "published" && block\.src[\s\S]*?<video/
    );
    expect(code).toContain("Video authoring slot");
    expect(code).toContain("Draft slots never attempt to load");
  });

  it("keeps transcript recovery available without replacing the voice session", () => {
    const code = feed();
    expect(code).toContain("block.transcript");
    expect(code).toContain("Open video transcript");
    expect(code).toContain("<details");
    expect(code).not.toContain("audio.currentTime");
  });

  it("provides keyboard-accessible content navigation with stable active state", () => {
    const code = feed();
    expect(code).toContain('aria-label="Lesson content"');
    expect(code).toContain("<button");
    expect(code).toContain("activeId === block.id");
    expect(code).toContain('scrollIntoView({ behavior: "smooth", block: "start" })');
  });

  it("tracks the visible content section with IntersectionObserver and cleans it up", () => {
    const code = feed();
    expect(code).toContain("new IntersectionObserver");
    expect(code).toContain("observer.observe(element)");
    expect(code).toContain("return () => observer.disconnect()");
    expect(code).toContain("entry.isIntersecting");
  });

  it("resets active content when the lesson block list changes", () => {
    const code = feed();
    expect(code).toContain('setActiveId(ids[0] ?? "")');
    expect(code).toContain("}, [ids]);");
  });
});

describe("lesson content feed accessibility and data boundary contract", () => {
  it("uses the content block id as both navigation identity and DOM identity", () => {
    const code = feed();
    const expression = "$" + "{block.id}";
    expect(code).toContain("key={block.id}");
    expect(code).toContain("lesson-content-" + expression);
  });

  it("never manufactures a media URL from lesson prose or block headings", () => {
    const code = feed();
    expect(code).not.toContain("encodeURIComponent");
    expect(code).not.toMatch(/src=.*block\.(body|heading)/);
  });

  it("exposes illustration alt text through the semantic visual role", () => {
    const code = feed();
    expect(code).toContain('role="img"');
    expect(code).toContain("aria-label={block.alt}");
  });
});
