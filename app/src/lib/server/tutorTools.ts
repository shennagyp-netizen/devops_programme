import { getHandsOnTask } from "../../data/handsOn";
import { courseLessons } from "../../data/courseLessons";
import { runtimeTaskForLesson } from "../../data/runtimeVerification";
import type { PlatformId } from "../../data/programme";
import type { TutorContext } from "./tutor";

export type TutorToolName =
  | "get_hands_on_contract"
  | "get_project_phase"
  | "get_runtime_contract"
  | "get_authoritative_progress";

export const tutorToolDefinitions = [
  {
    type: "function",
    name: "get_hands_on_contract",
    description:
      "Read the canonical hands-on task for the current lesson. Read-only. Never executes the task.",
    parameters: {
      type: "object",
      properties: {
        lessonId: {
          type: "string",
          description: "The current lesson ID."
        }
      },
      required: ["lessonId"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "get_project_phase",
    description:
      "Read one canonical phase of the current project. Read-only. Does not change project state.",
    parameters: {
      type: "object",
      properties: {
        phaseId: {
          type: "string",
          description: "The phase ID from the current project."
        }
      },
      required: ["phaseId"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "get_runtime_contract",
    description:
      "Read-only access to the published runtime verification contract for the current lesson. It describes allowlisted operations; it never executes them.",
    parameters: {
      type: "object",
      properties: {
        lessonId: {
          type: "string",
          description: "The current lesson ID."
        }
      },
      required: ["lessonId"],
      additionalProperties: false
    }
  },
  {
    type: "function",
    name: "get_authoritative_progress",
    description:
      "Read the server-known learner progress relevant to the current lesson and project. Read-only.",
    parameters: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  }
] as const;

type ExecuteArgs = Record<string, unknown>;

function bounded(value: unknown, max = 6000) {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.slice(0, max);
}

function requireCurrentLesson(
  context: TutorContext,
  lessonId: string
) {
  if (lessonId !== context.lesson.id) {
    throw new Error("Tutor tools can only read the current lesson.");
  }

  const lesson = courseLessons.find((item) => item.id === lessonId);
  if (!lesson) throw new Error("Lesson not found.");
  return lesson;
}

export function executeTutorTool(
  name: string,
  args: ExecuteArgs,
  context: TutorContext,
  platform?: PlatformId
) {
  switch (name as TutorToolName) {
    case "get_hands_on_contract": {
      const lessonId = typeof args.lessonId === "string" ? args.lessonId : "";
      const lesson = requireCurrentLesson(context, lessonId);
      const task = getHandsOnTask(lesson);

      return bounded({
        lessonId: task.lessonId,
        taskId: task.id,
        title: task.title,
        objective: task.objective,
        steps: task.steps,
        evidenceFields: task.evidenceFields,
        successCriteria: task.successCriteria,
        verificationLevel: task.verificationLevel,
        verificationNote: task.verificationNote
      });
    }

    case "get_project_phase": {
      const phaseId = typeof args.phaseId === "string" ? args.phaseId : "";
      const phase = context.project.phases.find((item) => item.id === phaseId);
      if (!phase) {
        throw new Error("Requested project phase is not part of the current project.");
      }

      return bounded({
        projectId: context.project.id,
        phase
      });
    }

    case "get_runtime_contract": {
      const lessonId = typeof args.lessonId === "string" ? args.lessonId : "";
      requireCurrentLesson(context, lessonId);
      const task = runtimeTaskForLesson(lessonId);

      if (!task) {
        return bounded({
          lessonId,
          available: false,
          reason: "No runtime verification contract is published for this lesson."
        });
      }

      const runtimeSteps = task.steps.map((step) => ({
        id: step.id,
        kind: step.kind,
        purpose: step.purpose,
        required: step.required,
        command:
          platform && step.commands[platform]
            ? {
                program: step.commands[platform]!.program,
                args: step.commands[platform]!.args,
                timeoutMs: step.commands[platform]!.timeoutMs,
                destructive: step.commands[platform]!.destructive
              }
            : undefined
      }));

      return bounded({
        lessonId: task.lessonId,
        taskId: task.taskId,
        contractVersion: task.contractVersion,
        verificationLevel: task.verificationLevel,
        scope: task.scope,
        resetRequired: task.resetRequired,
        platform: platform ?? "not-specified",
        steps: runtimeSteps
      });
    }

    case "get_authoritative_progress": {
      return bounded({
        lessonId: context.lesson.id,
        projectId: context.project.id,
        completionCount: context.learner.completionCount,
        recentCompletedItems: context.learner.recentCompletedItems,
        masteryAttemptsForLesson: context.learner.masteryAttemptsForLesson
      });
    }

    default:
      throw new Error("Unsupported tutor tool.");
  }
}

export function assertTutorToolDefinitionsAreReadOnly() {
  return tutorToolDefinitions.every(
    (tool) =>
      tool.type === "function" &&
      tool.name.startsWith("get_") &&
      tool.description.includes("Read-only")
  );
}
