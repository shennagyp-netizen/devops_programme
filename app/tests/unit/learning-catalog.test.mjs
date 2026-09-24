import { describe, expect, it } from "vitest";
import { resolvePublishedLearningItem } from "../../src/lib/server/learning-catalog.ts";

describe("published learning-item boundary", () => {
  it("resolves an authored lesson to canonical server metadata", () => {
    expect(
      resolvePublishedLearningItem({ itemType: "lesson", itemId: "B1.2" })
    ).toEqual({
      itemType: "lesson",
      itemId: "B1.2",
      course: "beginner",
      projectId: "B1"
    });
  });

  it("rejects fabricated lesson IDs instead of creating unbounded rows", () => {
    expect(() =>
      resolvePublishedLearningItem({
        itemType: "lesson",
        itemId: "not-a-real-lesson"
      })
    ).toThrow("Published learning item not found.");
  });

  it("rejects item types whose published registry does not yet exist", () => {
    expect(() =>
      resolvePublishedLearningItem({
        itemType: "question",
        itemId: "attacker-created-question"
      })
    ).toThrow("Learning item type question is not currently published.");

    expect(() =>
      resolvePublishedLearningItem({
        itemType: "assignment",
        itemId: "attacker-created-assignment"
      })
    ).toThrow("Learning item type assignment is not currently published.");
  });

  it("rejects fabricated projects", () => {
    expect(() =>
      resolvePublishedLearningItem({
        itemType: "project",
        itemId: "PWNED"
      })
    ).toThrow("Published learning item not found.");
  });
});
