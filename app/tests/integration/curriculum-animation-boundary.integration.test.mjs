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

describe("curriculum/animation dependency boundary", () => {
  it("keeps the reusable animation library independent from curriculum sources", () => {
    const root = resolve(process.cwd(), "src/animations");
    const forbiddenImports = [
      "../data/",
      "../../data/",
      "courseLessons",
      "lessonContent",
      "illustrationBindings",
      "PodcastCoach",
      "LessonPanel"
    ];

    for (const file of filesUnder(root)) {
      const code = readFileSync(file, "utf8");

      for (const forbidden of forbiddenImports) {
        expect(code, file).not.toContain(forbidden);
      }
    }
  });

  it("keeps the curriculum binding layer above animation contracts", () => {
    const file = resolve(process.cwd(), "src/data/illustrationBindings.ts");
    const code = readFileSync(file, "utf8");

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
