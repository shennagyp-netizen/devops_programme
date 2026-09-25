import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

function filesUnder(directory) {
  const result = [];

  for (const entry of readdirSync(directory)) {
    const fullPath = resolve(directory, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      result.push(...filesUnder(fullPath));
    } else if (/\.(ts|tsx|mjs|js)$/.test(entry)) {
      result.push(fullPath);
    }
  }

  return result;
}

function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1");
}

describe("curriculum/animation dependency boundary", () => {
  it("keeps the reusable animation library independent from curriculum sources", () => {
    const root = resolve(process.cwd(), "src/animations");
    const forbiddenImportPatterns = [
      /\bfrom\s*["'][^"']*(?:courseLessons|lessonContent|illustrationBindings|PodcastCoach|LessonPanel)[^"']*["']/,
      /\bimport\s*(?:type\s*)?[^"']*["'][^"']*(?:courseLessons|lessonContent|illustrationBindings|PodcastCoach|LessonPanel)[^"']*["']/,
      /\bfrom\s*["'][^"']*\.\.\/data\//,
      /\bimport\s*(?:type\s*)?[^"']*["'][^"']*\.\.\/data\//
    ];

    for (const file of filesUnder(root)) {
      const source = stripComments(readFileSync(file, "utf8"));

      for (const forbiddenPattern of forbiddenImportPatterns) {
        expect(source, file).not.toMatch(forbiddenPattern);
      }
    }
  });

  it("keeps the curriculum binding layer above animation contracts", () => {
    const file = resolve(process.cwd(), "src/data/illustrationBindings.ts");
    const code = stripComments(readFileSync(file, "utf8"));

    expect(code).toContain("../animations/contracts");
    expect(code).not.toContain("../animations/runtime");
    expect(code).not.toContain("../animations/AnimationStage");
    expect(code).not.toContain("PodcastCoach");
  });

  it("keeps lesson content authoritative for illustration placement", () => {
    const content = readFileSync(
      resolve(process.cwd(), "src/data/lessonContent.ts"),
      "utf8"
    );

    expect(content).toContain("bindingId: string");
    expect(content).toContain('type: "interactive-illustration"');
  });
});
