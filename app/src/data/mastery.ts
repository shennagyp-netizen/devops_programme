import type { CourseLesson } from "./courseLessons";
import type { HandsOnTask } from "./handsOn";
import { diagnosticBySection, type DiagnosticQuestion } from "./diagnostics";

export type TeachingRepresentation =
  | "plain-language"
  | "mechanism"
  | "analogy"
  | "visual"
  | "worked-example"
  | "controlled-failure"
  | "guided-retry";

export type MasteryStage =
  | "foundation-reteach"
  | "mechanism-reteach"
  | "guided-practice"
  | "prerequisite-rewind";

export type MasteryPass = {
  id: string;
  representation: TeachingRepresentation;
  title: string;
  explanation: string;
  action: string;
};

export type MasteryCheckpoint = {
  questionId: string;
  prompt: string;
  options: string[];
  correctOption: number;
};

export type MasteryPlan = {
  stage: MasteryStage;
  attemptNumber: number;
  title: string;
  why: string;
  passes: MasteryPass[];
  checkpoint?: MasteryCheckpoint;
  retryTask: {
    title: string;
    steps: string[];
    successCriteria: string[];
  };
  nextFailureMessage: string;
};

const stageForAttempt: MasteryStage[] = [
  "foundation-reteach",
  "mechanism-reteach",
  "guided-practice",
  "prerequisite-rewind"
];

function firstTextBlock(lesson: CourseLesson) {
  return lesson.content.blocks.find(
    (block): block is Extract<(typeof lesson.content.blocks)[number], { type: "text" }> =>
      block.type === "text"
  );
}

function visualBlock(lesson: CourseLesson) {
  return lesson.content.blocks.find(
    (block): block is Extract<(typeof lesson.content.blocks)[number], { type: "illustration" }> =>
      block.type === "illustration"
  );
}

function checkpointFor(lesson: CourseLesson): MasteryCheckpoint | undefined {
  const definition = diagnosticBySection[lesson.sectionId];
  const question: DiagnosticQuestion | undefined = definition?.questions[0];
  if (!question) return undefined;

  return {
    questionId: question.id,
    prompt: question.prompt,
    options: question.options,
    correctOption: question.correctOption
  };
}

function mechanismExplanation(lesson: CourseLesson, task: HandsOnTask) {
  const text = firstTextBlock(lesson)?.body?.trim();
  if (text) return text;

  return (
    `${lesson.objective} The important mechanism is exposed by the exercise: ` +
    `${task.objective.toLowerCase()}`
  );
}

export function masteryRepresentations(): TeachingRepresentation[] {
  return [
    "plain-language",
    "mechanism",
    "analogy",
    "visual",
    "worked-example",
    "controlled-failure",
    "guided-retry"
  ];
}

export function getMasteryPlan(
  lesson: CourseLesson,
  task: HandsOnTask,
  failureMessages: string[],
  previousAttempts: number
): MasteryPlan {
  const attemptNumber = Math.max(1, previousAttempts + 1);
  const stage = stageForAttempt[Math.min(attemptNumber - 1, stageForAttempt.length - 1)];
  const visual = visualBlock(lesson);

  const common = {
    passes: [
      {
        id: "plain",
        representation: "plain-language" as const,
        title: "Say it simply",
        explanation: lesson.objective,
        action: "Explain the idea in one plain sentence before touching the system."
      },
      {
        id: "analogy",
        representation: "analogy" as const,
        title: "See it another way",
        explanation: lesson.humanExample,
        action: "Use the analogy to predict what should happen before you retry."
      },
      {
        id: "visual",
        representation: "visual" as const,
        title: "See the mechanism",
        explanation:
          visual?.caption ??
          visual?.heading ??
          "Use the lesson visual to trace the important boundary before you retry.",
        action: "Trace the visual from the first stage to the evidence stage."
      }
    ]
  };

  if (stage === "foundation-reteach") {
    return {
      stage,
      attemptNumber,
      title: "Let's teach the same idea a different way",
      why:
        failureMessages.length
          ? "Your evidence did not yet prove the required contract. We are changing the explanation before asking you to retry."
          : "This is the first guided mastery pass.",
      passes: common.passes,
      checkpoint: checkpointFor(lesson),
      retryTask: {
        title: "Retry with a smaller proof",
        steps: [
          task.steps[0] ?? "State the starting condition.",
          "Before changing anything, say what you predict should happen.",
          task.steps[1] ?? "Make one reversible change.",
          "Record the smallest evidence that can prove or disprove your prediction.",
          "Restore the known-good state."
        ],
        successCriteria: [
          "The prediction is explicit.",
          "Only one boundary is changed.",
          "The evidence is tied to the prediction.",
          "Recovery is explicitly verified."
        ]
      },
      nextFailureMessage:
        "If this retry fails again, the next pass will use a deeper mechanism explanation and a worked example."
    };
  }

  if (stage === "mechanism-reteach") {
    return {
      stage,
      attemptNumber,
      title: "Now we go one layer deeper",
      why:
        "The first explanation was not enough, so we are switching from the simple story to the actual mechanism and evidence chain.",
      passes: [
        {
          id: "mechanism",
          representation: "mechanism",
          title: "Trace cause and effect",
          explanation: mechanismExplanation(lesson, task),
          action: "State what changes first, what should change next, and which observation proves the link."
        },
        {
          id: "worked-example",
          representation: "worked-example",
          title: "Walk through one example",
          explanation: task.successCriteria.join(" "),
          action: "Follow the example one step at a time and name the evidence at each boundary."
        },
        ...common.passes.slice(1)
      ],
      checkpoint: checkpointFor(lesson),
      retryTask: {
        title: "Retry with a guided evidence chain",
        steps: [
          "State the initial known-good state.",
          "Name the exact mechanism you are testing.",
          "Make one reversible change.",
          "Record the first changed signal.",
          "Explain why that signal supports or weakens the hypothesis.",
          "Restore the system and verify recovery."
        ],
        successCriteria: [
          "The mechanism is named before the change.",
          "Evidence is interpreted, not merely copied.",
          "The evidence supports a specific hypothesis.",
          "Recovery returns the known-good state."
        ]
      },
      nextFailureMessage:
        "If this still fails, the next pass will reduce the task and rebuild the prerequisite step by step."
    };
  }

  if (stage === "guided-practice") {
    return {
      stage,
      attemptNumber,
      title: "We will do a smaller version together",
      why:
        "Repeated failure means the problem is not effort. The task needs a smaller intermediate proof before the full assignment.",
      passes: [
        {
          id: "worked-example",
          representation: "worked-example",
          title: "Follow a solved example",
          explanation: task.successCriteria.join(" "),
          action: "Match each required proof point to one concrete observation."
        },
        {
          id: "controlled-failure",
          representation: "controlled-failure",
          title: "Break one boundary safely",
          explanation:
            "Use one disposable change only. The goal is to see the failure signal, not to create a large incident.",
          action: "Predict the failure signal before making the change."
        },
        {
          id: "guided-retry",
          representation: "guided-retry",
          title: "Retry with checkpoints",
          explanation:
            "Complete one step, record the evidence, then continue. Do not submit the whole assignment from memory.",
          action: "Pause after each step and check the evidence against the success criterion."
        }
      ],
      checkpoint: checkpointFor(lesson),
      retryTask: {
        title: "Micro-assignment before the full assignment",
        steps: [
          "Complete only the first required observation.",
          "Explain what that observation means.",
          "Make only the first controlled change.",
          "Record the resulting failure signal.",
          "Restore the system immediately.",
          "Run the full assignment only after those two signals are correct."
        ],
        successCriteria: [
          "The first observation is correct.",
          "The failure signal matches the predicted mechanism.",
          "The system is restored before the full retry."
        ]
      },
      nextFailureMessage:
        "If the micro-assignment fails, we will rewind to the prerequisite concept instead of repeating the same full task."
    };
  }

  return {
    stage,
    attemptNumber,
    title: "Prerequisite rewind",
    why:
      "The learner has had multiple attempts without stable proof. We will rewind one dependency, teach it again from another angle, and then return to the assignment.",
    passes: [
      {
        id: "prerequisite",
        representation: "plain-language",
        title: "Rebuild the prerequisite",
        explanation:
          diagnosticBySection[lesson.sectionId]?.remediationLessonIds.join(" · ") ??
          "Revisit the smallest prerequisite concept needed for this lesson.",
        action: "Open the prerequisite lesson and explain the missing idea before returning."
      },
      {
        id: "mechanism",
        representation: "mechanism",
        title: "Reconnect the mechanism",
        explanation: lesson.objective,
        action: "Explain how the prerequisite produces the behavior this lesson tests."
      },
      {
        id: "visual",
        representation: "visual",
        title: "Reconnect the system picture",
        explanation:
          visual?.caption ??
          visual?.heading ??
          "Use the lesson visual to connect the prerequisite to the assignment.",
        action: "Trace the prerequisite into the exact boundary being tested."
      }
    ],
    checkpoint: checkpointFor(lesson),
    retryTask: {
      title: "Return with prerequisite proof",
      steps: [
        "Complete the prerequisite micro-check.",
        "Explain the mechanism in your own words.",
        "State the expected result of the assignment before running it.",
        "Complete the assignment with the known-good baseline.",
        "Record failure and recovery evidence separately."
      ],
      successCriteria: [
        "The prerequisite concept is correctly explained.",
        "The learner can predict the assignment outcome.",
        "The full assignment produces complete evidence.",
        "Recovery is explicitly verified."
      ]
    },
    nextFailureMessage:
      "Further failure should create a new coaching session rather than silently repeating the same material."
  };
}

export function masteryStorageKey(lessonId: string) {
  return `devops-programme-mastery-attempts:${lessonId}`;
}

export function readMasteryAttempts(lessonId: string) {
  try {
    const raw = localStorage.getItem(masteryStorageKey(lessonId));
    const value = Number(raw ?? "0");
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export function recordMasteryFailure(lessonId: string) {
  const next = readMasteryAttempts(lessonId) + 1;
  try {
    localStorage.setItem(masteryStorageKey(lessonId), String(next));
  } catch {
    // Best effort until learner mastery history is server-persisted.
  }
  return next;
}

export function resetMasteryAttempts(lessonId: string) {
  try {
    localStorage.removeItem(masteryStorageKey(lessonId));
  } catch {
    // Best effort.
  }
}
