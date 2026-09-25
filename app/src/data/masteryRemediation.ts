import type { CourseLesson } from "./courseLessons";
import type { HandsOnTask } from "./handsOn";
import { authoredRemediation } from "./authoredRemediation";

export const REMEDIATION_METHODS = [
  "plain-language",
  "analogy",
  "mechanism",
  "worked-example",
  "counterexample",
  "visual"
] as const;

export type RemediationMethod = (typeof REMEDIATION_METHODS)[number];

export const MASTERY_FAILURES = [
  "concept-gap",
  "procedure-error",
  "evidence-error",
  "diagnosis-error",
  "recovery-error",
  "transfer-error"
] as const;

export type MasteryFailureClass = (typeof MASTERY_FAILURES)[number];

export type RemediationStep = {
  id: string;
  method: RemediationMethod;
  title: string;
  explanation: string;
  microTask: string;
  successCheck: string;
};

export type RemediationPlan = {
  lessonId: string;
  taskId: string;
  target: string;
  failureClass: MasteryFailureClass;
  steps: RemediationStep[];
  reattemptRule: string;
};

export type RemediationFailure = {
  failureClass: MasteryFailureClass;
  failedFields: string[];
  messages: string[];
};

export function classifyHandsOnFailure(
  failureMessages: string[],
  task: HandsOnTask
): RemediationFailure {
  const normalized = failureMessages.join(" ").toLowerCase();
  const failedFields = task.evidenceFields
    .filter((field) => {
      const label = field.label.toLowerCase();
      return normalized.includes(label) || normalized.includes(field.id.toLowerCase());
    })
    .map((field) => field.id);

  let failureClass: MasteryFailureClass = "evidence-error";

  if (normalized.includes("observation")) {
    failureClass = "concept-gap";
  } else if (normalized.includes("change")) {
    failureClass = "procedure-error";
  } else if (normalized.includes("failure")) {
    failureClass = "diagnosis-error";
  } else if (normalized.includes("recovery")) {
    failureClass = "recovery-error";
  }

  return { failureClass, failedFields, messages: failureMessages };
}

function primaryIllustration(lesson: CourseLesson) {
  const illustration = lesson.content.blocks.find(
    (block) => block.type === "illustration"
  );

  if (!illustration || illustration.type !== "illustration") {
    return {
      title: "The system mechanism",
      detail: "Return to the lesson visual and trace the objects from left to right."
    };
  }

  return {
    title: illustration.heading ?? "The system mechanism",
    detail:
      illustration.caption ??
      illustration.alt ??
      "Trace each system object and explain what changes when the failure occurs."
  };
}

function authoredPlan(lesson: CourseLesson, task: HandsOnTask, failure: RemediationFailure): RemediationPlan | null {
  const authored = authoredRemediation[lesson.id];
  if (!authored) return null;

  const steps = Object.entries(authored.steps).map(([method, value]) => ({
    id: `authored-${method}`,
    method: method as RemediationMethod,
    ...value
  }));

  return {
    lessonId: lesson.id,
    taskId: task.id,
    target: authored.target,
    failureClass: failure.failureClass,
    steps,
    reattemptRule:
      "Complete the targeted micro-task, then retry the original assignment. The original evidence contract remains unchanged."
  };
}

export function buildRemediationPlan(
  lesson: CourseLesson,
  task: HandsOnTask,
  failure: RemediationFailure
): RemediationPlan {
  const authored = authoredPlan(lesson, task, failure);
  if (authored) return authored;

  const illustration = primaryIllustration(lesson);
  const firstStep = task.steps[0] ?? lesson.objective;
  const recoveryStep = task.steps[task.steps.length - 1] ??
    "Restore the known-good state and verify it.";

  return {
    lessonId: lesson.id,
    taskId: task.id,
    target: lesson.objective,
    failureClass: failure.failureClass,
    steps: [
      {
        id: "plain",
        method: "plain-language",
        title: "Explain it simply",
        explanation:
          lesson.humanExample + " The task is asking you to prove: " + lesson.objective,
        microTask:
          "In one sentence, state what the learner must observe before doing anything else.",
        successCheck:
          "The answer names the system behavior, not just the command."
      },
      {
        id: "analogy",
        method: "analogy",
        title: "See the same idea another way",
        explanation:
          "Use this analogy, then translate it back to the machine: " + lesson.humanExample,
        microTask:
          "Name the real system object represented by the main object in the analogy.",
        successCheck:
          "The learner can map the analogy back to a literal technical object."
      },
      {
        id: "mechanism",
        method: "mechanism",
        title: "Walk the mechanism",
        explanation:
          illustration.title + ": " + illustration.detail,
        microTask:
          "Predict what should change after this step: " + firstStep,
        successCheck:
          "The prediction names an observable state change or signal."
      },
      {
        id: "worked-example",
        method: "worked-example",
        title: "Watch one complete example",
        explanation:
          "Worked path: " + task.steps.join(" -> ") + ". The important part is the evidence at each boundary, not the command sequence alone.",
        microTask:
          "Before redoing the assignment, describe the expected recovery result: " + recoveryStep,
        successCheck:
          "The learner can state the expected recovery evidence before acting."
      },
      {
        id: "counterexample",
        method: "counterexample",
        title: "Learn what the evidence does NOT prove",
        explanation:
          "A green or empty-looking signal is not automatically proof of a healthy system. Separate what the observation proves from the hypotheses it leaves open.",
        microTask:
          "Write one plausible alternative explanation that would produce a similar signal.",
        successCheck:
          "The alternative explanation is technically plausible and testable."
      },
      {
        id: "visual",
        method: "visual",
        title: "Trace the visual again",
        explanation:
          illustration.title + ". Trace the system from the first object to the final proof and identify where the controlled failure enters.",
        microTask:
          "Point to the exact boundary where the original attempt failed and name the evidence that proves it.",
        successCheck:
          "The learner can localize the failure to one evidence-bearing boundary."
      }
    ],
    reattemptRule:
      "After completing the remediation step, retry the original assignment. A second failure advances to a different explanation method; the same explanation is never the only recovery path."
  };
}

export function methodsForAttempt(attemptNumber: number): RemediationMethod[] {
  if (attemptNumber <= 1) return ["plain-language", "analogy"];
  if (attemptNumber === 2) return ["mechanism", "worked-example"];
  if (attemptNumber === 3) return ["counterexample", "visual"];
  return ["mechanism", "counterexample", "visual"];
}
