import type { CourseLesson } from "./courseLessons";
import type { MasteryPass, MasteryPlan } from "./mastery";

export type RecoveryVoiceTurn = {
  id: string;
  speaker: "A" | "B";
  text: string;
};

export type RecoveryVoiceMethod = MasteryPass["representation"];

export type RecoveryVoiceOption = {
  id: string;
  method: RecoveryVoiceMethod;
  label: string;
  reason: string;
  turns: RecoveryVoiceTurn[];
};

function methodLabel(method: RecoveryVoiceMethod) {
  switch (method) {
    case "plain-language": return "Plain language";
    case "analogy": return "Analogy";
    case "visual": return "Visual mechanism";
    case "mechanism": return "Causal mechanism";
    case "worked-example": return "Worked example";
    case "controlled-failure": return "Controlled failure";
    case "guided-retry": return "Guided retry";
    default: return method;
  }
}

function reasonFor(method: RecoveryVoiceMethod) {
  switch (method) {
    case "plain-language": return "Strip the idea down to the few words that matter.";
    case "analogy": return "Use a familiar situation, then map it back to the real system.";
    case "visual": return "Trace the same mechanism through the lesson's visual model.";
    case "mechanism": return "Follow cause and effect one boundary at a time.";
    case "worked-example": return "Walk through a solved evidence path before trying again.";
    case "controlled-failure": return "Make one safe failure visible, then restore it.";
    case "guided-retry": return "Do the task in small checkpoints instead of all at once.";
  }
}

function turnsForPass(
  lesson: CourseLesson,
  plan: MasteryPlan,
  pass: MasteryPass,
  index: number
): RecoveryVoiceTurn[] {
  const failure = plan.failureSummary.length
    ? "The last attempt failed because " + plan.failureSummary[0]
    : "The last attempt did not prove the assignment yet.";

  return [
    {
      id: lesson.id + ".R" + plan.attemptNumber + "." + (index + 1) + ".T001",
      speaker: "A",
      text: failure + ". We are not going to repeat the same explanation. This time we will use " + methodLabel(pass.representation).toLowerCase() + "."
    },
    {
      id: lesson.id + ".R" + plan.attemptNumber + "." + (index + 1) + ".T002",
      speaker: "B",
      text: pass.explanation
    },
    {
      id: lesson.id + ".R" + plan.attemptNumber + "." + (index + 1) + ".T003",
      speaker: "A",
      text: pass.action + " Then come back with the smallest piece of evidence that proves what happened."
    },
    {
      id: lesson.id + ".R" + plan.attemptNumber + "." + (index + 1) + ".T004",
      speaker: "B",
      text: "The goal is not to remember the wording. The goal is to predict the system, operate it, and explain the evidence."
    }
  ];
}

export function buildRecoveryVoiceOptions(
  lesson: CourseLesson,
  plan: MasteryPlan
): RecoveryVoiceOption[] {
  return plan.passes.map((pass, index) => ({
    id: lesson.id + ".recovery." + plan.attemptNumber + "." + pass.id,
    method: pass.representation,
    label: methodLabel(pass.representation),
    reason: reasonFor(pass.representation),
    turns: turnsForPass(lesson, plan, pass, index)
  }));
}

export function recoveryVoiceSummary(lesson: CourseLesson, plan: MasteryPlan) {
  return {
    episodeId: lesson.id + ".recovery." + plan.attemptNumber,
    title: "Recovery coaching for " + lesson.title,
    attemptNumber: plan.attemptNumber,
    stage: plan.stage,
    optionCount: plan.passes.length
  };
}
