import { lessonsByCourse } from "./courseLessons";
import {
  buildDefaultIllustrationBinding,
  type CurriculumIllustrationBindingV1
} from "./illustrationBindings";

export const authoredCurriculumIllustrationBindings: readonly CurriculumIllustrationBindingV1[] = [
  {
    version: 1,
    id: "B1.2:b1-2-request-replay",
    lessonId: "B1.2",
    contentBlockId: "b1-2-request-replay",
    contentIndex: 2,
    presentation: "animated",
    visualCapabilityId: "animation-stage-v1",
    animationId: "http-request",
    voiceCueBindings: [
      {
        voiceCueId: "B1.2.request-start",
        eventIds: ["send-browser-gateway"]
      }
    ],
    interactionMode: "sequential",
    interactionSteps: [
      { id: "browser-to-gateway", order: 1, interactionId: "send-browser-gateway", prompt: "Send the request from the browser to the gateway.", successEventIds: ["send-browser-gateway"] },
      { id: "gateway-to-api", order: 2, interactionId: "send-gateway-api", prompt: "Forward the request from the gateway to the API.", successEventIds: ["send-gateway-api"] },
      { id: "api-evidence", order: 3, interactionId: "inspect-api", prompt: "Mark the API boundary as the evidence point.", successEventIds: ["activate-api"] }
    ],
    completion: { requiredStepIds: ["browser-to-gateway", "gateway-to-api", "api-evidence"] }
  },
  {
    version: 1,
    id: "D2.2:d2-2-dns",
    lessonId: "D2.2",
    contentBlockId: "d2-2-dns",
    contentIndex: 1,
    presentation: "animated",
    visualCapabilityId: "animation-stage-v1",
    animationId: "dns-resolution",
    voiceCueBindings: [],
    interactionMode: "sequential",
    interactionSteps: [
      { id: "query", order: 1, interactionId: "query", prompt: "Start with the client asking for a name.", successEventIds: ["query"] },
      { id: "resolver", order: 2, interactionId: "resolver", prompt: "Show the recursive resolver as the client-facing DNS component.", successEventIds: ["resolver"] },
      { id: "root", order: 3, interactionId: "root", prompt: "Show the resolver consulting a root server.", successEventIds: ["root"] },
      { id: "tld", order: 4, interactionId: "tld", prompt: "Show the TLD server identifying the authoritative path.", successEventIds: ["tld"] },
      { id: "authoritative", order: 5, interactionId: "authoritative", prompt: "Show the authoritative server as the source of the current answer.", successEventIds: ["authoritative"] }
    ],
    completion: { requiredStepIds: ["query", "resolver", "root", "tld", "authoritative"] }
  }
];

const lessons = Object.values(lessonsByCourse).flat();

export const curriculumIllustrationBindings: readonly CurriculumIllustrationBindingV1[] =
  lessons.flatMap((lesson) =>
    lesson.content.blocks.flatMap((block, contentIndex) => {
      if (block.type !== "illustration" && block.type !== "interactive-illustration") {
        return [];
      }

      if (block.type === "interactive-illustration") {
        return authoredCurriculumIllustrationBindings.filter(
          (binding) =>
            binding.id === block.bindingId &&
            binding.lessonId === lesson.id &&
            binding.contentBlockId === block.id
        );
      }

      const authored = authoredCurriculumIllustrationBindings.find(
        (binding) =>
          binding.id === block.bindingId &&
          binding.lessonId === lesson.id &&
          binding.contentBlockId === block.id
      );

      return [authored ?? buildDefaultIllustrationBinding(lesson.id, block, contentIndex)];
    })
  );
