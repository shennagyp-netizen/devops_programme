import { describe, expect, it } from "vitest";
import { getHandsOnTask } from "../../src/data/handsOn.ts";
import {
  getMasteryPlan,
  masteryRepresentations
} from "../../src/data/mastery.ts";

function lesson(id = "B1.1") {
  return {
    id,
    title: "The App Is Slow — Where Do We Look?",
    domain: "beginner-foundation",
    course: "beginner",
    projectId: "B1",
    sectionId: "B-F1",
    kind: "foundation",
    objective: "Separate a symptom from the process, resource and dependency that cause it.",
    humanExample: "A slow clinic screen can be investigated by checking one room, one system and then the shared dependency.",
    podcast: "",
    podcastStatus: "script-ready",
    platformCommands: {
      macos: "ps aux",
      linux: "ps aux",
      windows: "Get-Process"
    },
    content: {
      version: 1,
      blocks: [
        {
          id: "text",
          type: "text",
          heading: "Why this matters",
          body: "The running process can be waiting on another resource."
        },
        {
          id: "visual",
          type: "illustration",
          heading: "Process diagnosis",
          alt: "A process diagnosis path",
          bindingId: "B1.1:test",
          nodes: ["Symptom", "Process", "Resource", "Proof"],
          caption: "Trace the symptom to evidence."
        }
      ]
    },
    lab: {
      objective: "Inspect one process and prove recovery.",
      command: "ps aux",
      challenge: "Change one safe process condition and recover it."
    },
    recall: ["What is a process?"]
  };
}

describe("adaptive mastery contract", () => {
  it("teaches the first attempt through three different representations", () => {
    const item = lesson();
    const plan = getMasteryPlan(
      item,
      getHandsOnTask(item),
      [],
      0
    );

    expect(plan.stage).toBe("foundation-reteach");
    expect(plan.passes.map((pass) => pass.representation)).toEqual([
      "plain-language",
      "analogy",
      "visual"
    ]);
    expect(plan.checkpoint).toBeDefined();
    expect(plan.failureSummary).toEqual([]);
  });

  it("changes the teaching representation after the first failure", () => {
    const item = lesson();
    const task = getHandsOnTask(item);
    const plan = getMasteryPlan(
      item,
      task,
      ["Missing required evidence"],
      1
    );

    expect(plan.stage).toBe("mechanism-reteach");
    expect(plan.passes.map((pass) => pass.representation)).toContain("mechanism");
    expect(plan.passes.map((pass) => pass.representation)).toContain("worked-example");
  });

  it("shrinks the task after repeated failure instead of repeating the full assignment", () => {
    const item = lesson();
    const task = getHandsOnTask(item);
    const plan = getMasteryPlan(
      item,
      task,
      ["Evidence is still incomplete"],
      2
    );

    expect(plan.stage).toBe("guided-practice");
    expect(plan.retryTask.title).toContain("Micro-assignment");
    expect(plan.retryTask.steps.length).toBeGreaterThan(3);
  });

  it("rewinds prerequisites after repeated unsuccessful attempts", () => {
    const item = lesson();
    const task = getHandsOnTask(item);
    const plan = getMasteryPlan(
      item,
      task,
      ["Still failing"],
      4
    );

    expect(plan.stage).toBe("prerequisite-rewind");
    expect(plan.passes.map((pass) => pass.representation)).toContain("mechanism");
    expect(plan.retryTask.successCriteria.length).toBeGreaterThan(2);
  });

  it("exposes the full representation vocabulary used by the product", () => {
    expect(masteryRepresentations()).toEqual([
      "plain-language",
      "mechanism",
      "analogy",
      "visual",
      "worked-example",
      "controlled-failure",
      "guided-retry"
    ]);
  });
});
