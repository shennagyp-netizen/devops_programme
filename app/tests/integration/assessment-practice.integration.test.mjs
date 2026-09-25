import { describe, expect, it } from "vitest";
import { courses } from "../../src/data/programme.ts";
import { getPracticeForm } from "../../src/data/assessmentItems.ts";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

describe("assessment practice programme integration", () => {
  it("has interactive practice coverage for every pilot section and family", () => {
    for (const course of courses) {
      for (const section of course.sections) {
        for (const family of ["conceptual", "diagnostic", "hands-on"]) {
          const form = getPracticeForm(section.id, family);
          expect(form.length, section.id + " " + family).toBeGreaterThan(0);
        }
      }
    }
  });

  it("renders the adaptive assessment engine instead of a metadata-only panel", async () => {
    const source = await readFile(
      resolve(process.cwd(), "src/components/AssessmentPanel.tsx"),
      "utf8"
    );

    expect(source).toContain("AssessmentPracticePanel");
    expect(source).toContain("Practice is interactive, adaptive and mastery-oriented");
    expect(source).not.toContain("These forms are for architecture and item-writing validation");
  });
});
