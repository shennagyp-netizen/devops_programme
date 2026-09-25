import type {
  AnimationDefinitionV1,
  AnimationInteractionV1
} from "../animations/contracts";

export const ILLUSTRATION_BINDING_CONTRACT_VERSION = 1 as const;

export type IllustrationBindingPresentationV1 = "static" | "animated";
export type IllustrationInteractionModeV1 = "sequential" | "free";

export type IllustrationVoiceCueBindingV1 = {
  voiceCueId: string;
  offsetMs?: number;
  eventIds: string[];
};

export type IllustrationInteractionStepV1 = {
  id: string;
  order: number;
  interactionId: string;
  prompt: string;
  successEventIds: string[];
};

export type IllustrationCompletionV1 = {
  requiredStepIds: string[];
};

export type CurriculumIllustrationBindingV1 = {
  version: typeof ILLUSTRATION_BINDING_CONTRACT_VERSION;
  id: string;
  lessonId: string;
  contentBlockId: string;
  contentIndex: number;
  presentation: IllustrationBindingPresentationV1;
  visualCapabilityId: string;
  animationId?: string;
  voiceCueBindings: IllustrationVoiceCueBindingV1[];
  interactionMode?: IllustrationInteractionModeV1;
  interactionSteps: IllustrationInteractionStepV1[];
  completion?: IllustrationCompletionV1;
};

export type IllustrationBindingContextV1 = {
  animationDefinitions: readonly AnimationDefinitionV1[];
  voiceCueIds?: ReadonlySet<string>;
};

export type IllustrationBindingValidationResultV1 = {
  valid: boolean;
  failures: string[];
  binding?: CurriculumIllustrationBindingV1;
};

type IllustrationContentBlockV1 = {
  id: string;
  type: "illustration" | "interactive-illustration";
  bindingId: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    Number.isFinite(value) &&
    value >= 0
  );
}

function animationDefinition(
  context: IllustrationBindingContextV1,
  animationId: string
) {
  return context.animationDefinitions.find(
    (definition) => definition.id === animationId
  );
}

function animationEventIds(definition: AnimationDefinitionV1 | undefined) {
  return new Set(
    definition?.events.map((event) => event.id) ?? []
  );
}

function animationInteractionMap(definition: AnimationDefinitionV1 | undefined) {
  return new Map<string, AnimationInteractionV1>(
    definition?.interactions.map((interaction) => [interaction.id, interaction]) ?? []
  );
}

function validateVoiceCueBindings(
  value: unknown,
  context: IllustrationBindingContextV1,
  eventIds: Set<string>,
  failures: string[]
) {
  if (!Array.isArray(value)) {
    failures.push("voiceCueBindings must be an array");
    return;
  }

  const cueIds = new Set<string>();

  for (const binding of value) {
    if (!isObject(binding) || !isNonEmptyString(binding.voiceCueId)) {
      failures.push("voice cue id is required");
      continue;
    }

    if (cueIds.has(binding.voiceCueId)) {
      failures.push(`duplicate voice cue id: ${binding.voiceCueId}`);
    }
    cueIds.add(binding.voiceCueId);

    if (
      context.voiceCueIds &&
      !context.voiceCueIds.has(binding.voiceCueId)
    ) {
      failures.push(
        `voice cue does not exist: ${binding.voiceCueId}`
      );
    }

    if (
      binding.offsetMs !== undefined &&
      (typeof binding.offsetMs !== "number" ||
        !Number.isFinite(binding.offsetMs) ||
        binding.offsetMs < 0)
    ) {
      failures.push(`voice cue ${binding.voiceCueId} offsetMs is invalid`);
    }

    if (!Array.isArray(binding.eventIds) || binding.eventIds.length === 0) {
      failures.push(
        `voice cue ${binding.voiceCueId} eventIds must be non-empty`
      );
      continue;
    }

    const localEventIds = new Set<string>();
    for (const eventId of binding.eventIds) {
      if (!isNonEmptyString(eventId) || !eventIds.has(eventId)) {
        failures.push(
          `event id does not exist for voice cue ${binding.voiceCueId}: ${String(
            eventId
          )}`
        );
        continue;
      }

      if (localEventIds.has(eventId)) {
        failures.push(
          `duplicate event id for voice cue ${binding.voiceCueId}: ${eventId}`
        );
      }
      localEventIds.add(eventId);
    }
  }
}

function validateInteractionSteps(
  value: unknown,
  interactionMode: IllustrationInteractionModeV1,
  definition: AnimationDefinitionV1 | undefined,
  failures: string[]
) {
  if (!Array.isArray(value) || value.length === 0) {
    failures.push("interactive illustration requires interaction steps");
    return;
  }

  const interactions = animationInteractionMap(definition);
  const eventIds = animationEventIds(definition);
  const stepIds = new Set<string>();
  const orders = new Set<number>();

  value.forEach((rawStep, index) => {
    if (!isObject(rawStep)) {
      failures.push("interaction step must be an object");
      return;
    }

    if (!isNonEmptyString(rawStep.id)) {
      failures.push("interaction step id is required");
    } else if (stepIds.has(rawStep.id)) {
      failures.push(`duplicate interaction step id: ${rawStep.id}`);
    } else {
      stepIds.add(rawStep.id);
    }

    if (!Number.isInteger(rawStep.order) || rawStep.order <= 0) {
      failures.push(`interaction step ${String(rawStep.id)} order is invalid`);
    } else {
      if (orders.has(rawStep.order)) {
        failures.push(
          `interaction step order is duplicated: ${rawStep.order}`
        );
      }
      orders.add(rawStep.order);

      if (
        interactionMode === "sequential" &&
        (rawStep.order !== index + 1)
      ) {
        failures.push(
          `interaction step order is not the declared order at index ${index}`
        );
      }
    }

    if (!isNonEmptyString(rawStep.interactionId)) {
      failures.push(
        `interaction step ${String(rawStep.id)} interactionId is required`
      );
    } else if (!interactions.has(rawStep.interactionId)) {
      failures.push(
        `interaction does not exist: ${rawStep.interactionId}`
      );
    }

    if (!isNonEmptyString(rawStep.prompt)) {
      failures.push(
        `interaction step ${String(rawStep.id)} prompt is required`
      );
    }

    if (!Array.isArray(rawStep.successEventIds) || rawStep.successEventIds.length === 0) {
      failures.push(
        `interaction step ${String(rawStep.id)} successEventIds must be non-empty`
      );
    } else {
      for (const eventId of rawStep.successEventIds) {
        if (!eventIds.has(eventId)) {
          failures.push(
            `success event does not exist: ${String(eventId)}`
          );
        }
      }
    }
  });
}

function validateCompletion(
  completion: unknown,
  interactionSteps: IllustrationInteractionStepV1[],
  failures: string[]
) {
  if (!isObject(completion)) {
    failures.push("interactive illustration completion is required");
    return;
  }

  if (!Array.isArray(completion.requiredStepIds) || completion.requiredStepIds.length === 0) {
    failures.push("completion requiredStepIds must be non-empty");
    return;
  }

  const stepIds = new Set(interactionSteps.map((step) => step.id));
  const requiredIds = new Set<string>();

  for (const stepId of completion.requiredStepIds) {
    if (!isNonEmptyString(stepId) || !stepIds.has(stepId)) {
      failures.push(`completion references unknown step: ${String(stepId)}`);
      continue;
    }
    if (requiredIds.has(stepId)) {
      failures.push(`completion step is duplicated: ${stepId}`);
    }
    requiredIds.add(stepId);
  }
}

export function buildDefaultIllustrationBinding(
  lessonId: string,
  block: IllustrationContentBlockV1,
  contentIndex: number
): CurriculumIllustrationBindingV1 {
  return {
    version: ILLUSTRATION_BINDING_CONTRACT_VERSION,
    id: `${lessonId}:${block.id}`,
    lessonId,
    contentBlockId: block.id,
    contentIndex,
    presentation: "static",
    visualCapabilityId: "semantic-flow-v1",
    voiceCueBindings: [],
    interactionSteps: []
  };
}

export function validateCurriculumIllustrationBinding(
  value: unknown,
  block: IllustrationContentBlockV1,
  context: IllustrationBindingContextV1
): IllustrationBindingValidationResultV1 {
  const failures: string[] = [];

  if (!isObject(value)) {
    return {
      valid: false,
      failures: ["illustration binding must be an object"]
    };
  }

  if (value.version !== ILLUSTRATION_BINDING_CONTRACT_VERSION) {
    failures.push("illustration binding version must be 1");
  }

  if (!isNonEmptyString(value.id)) {
    failures.push("illustration binding id is required");
  }

  if (!isNonEmptyString(value.lessonId)) {
    failures.push("illustration binding lessonId is required");
  }

  if (!isNonEmptyString(value.contentBlockId)) {
    failures.push("illustration binding contentBlockId is required");
  }

  if (value.contentBlockId !== block.id) {
    failures.push("contentBlockId does not match the lesson content block");
  }

  if (value.id !== `${String(value.lessonId)}:${block.id}`) {
    failures.push("binding id does not match lesson and content block identity");
  }

  if (value.contentIndex !== undefined && !isFiniteNonNegativeInteger(value.contentIndex)) {
    failures.push("contentIndex is invalid");
  }

  if (isFiniteNonNegativeInteger(value.contentIndex) && value.contentIndex < 0) {
    failures.push("contentIndex is invalid");
  }

  const expectedInteractive = block.type === "interactive-illustration";
  if (
    value.presentation !== "static" &&
    value.presentation !== "animated"
  ) {
    failures.push("illustration presentation is invalid");
  }

  if (
    expectedInteractive &&
    value.presentation !== "animated"
  ) {
    failures.push("interactive illustration must use animated presentation");
  }

  if (!expectedInteractive && value.presentation === "animated") {
    failures.push("static illustration block cannot use animated presentation");
  }

  if (!isNonEmptyString(value.visualCapabilityId)) {
    failures.push("visualCapabilityId is required");
  }

  let definition: AnimationDefinitionV1 | undefined;

  if (value.presentation === "animated") {
    if (!isNonEmptyString(value.animationId)) {
      failures.push("animationId is required");
    } else {
      definition = animationDefinition(context, value.animationId);
      if (!definition) {
        failures.push(`animationId does not exist: ${value.animationId}`);
      }
    }
  } else if (value.animationId !== undefined) {
    failures.push("static illustration cannot declare animationId");
  }

  const eventIds = animationEventIds(definition);
  validateVoiceCueBindings(value.voiceCueBindings, context, eventIds, failures);

  if (!Array.isArray(value.interactionSteps)) {
    failures.push("interactionSteps must be an array");
  }

  if (expectedInteractive) {
    if (
      value.interactionMode !== "sequential" &&
      value.interactionMode !== "free"
    ) {
      failures.push("interactive illustration interactionMode is required");
    } else {
      validateInteractionSteps(
        value.interactionSteps,
        value.interactionMode,
        definition,
        failures
      );
    }

    if (Array.isArray(value.interactionSteps)) {
      validateCompletion(value.completion, value.interactionSteps as IllustrationInteractionStepV1[], failures);
    }
  } else {
    if (value.interactionSteps?.length) {
      failures.push("static illustration cannot declare interaction steps");
    }

    if (value.interactionMode !== undefined) {
      failures.push("static illustration cannot declare interactionMode");
    }

    if (value.completion !== undefined) {
      failures.push("static illustration cannot declare completion");
    }
  }

  return {
    valid: failures.length === 0,
    failures
  };
}

export function validateLessonIllustrationBindings(
  lessons: ReadonlyArray<{
    id: string;
    content: {
      blocks: ReadonlyArray<{
        id: string;
        type: string;
        bindingId?: string;
      }>;
    };
  }>
): {
  valid: boolean;
  failures: string[];
  bindings: CurriculumIllustrationBindingV1[];
} {
  const failures: string[] = [];
  const bindings: CurriculumIllustrationBindingV1[] = [];

  for (const lesson of lessons) {
    const blocks = lesson.content.blocks;

    blocks.forEach((block, contentIndex) => {
      if (
        block.type !== "illustration" &&
        block.type !== "interactive-illustration"
      ) {
        return;
      }

      if (!isNonEmptyString(block.bindingId)) {
        failures.push(
          `lesson ${lesson.id} illustration ${block.id} is missing bindingId`
        );
        return;
      }

      const binding = buildDefaultIllustrationBinding(
        lesson.id,
        block as IllustrationContentBlockV1,
        contentIndex
      );

      if (block.bindingId !== binding.id) {
        failures.push(
          `lesson ${lesson.id} illustration ${block.id} bindingId does not match canonical identity`
        );
      }

      const result = validateCurriculumIllustrationBinding(
        binding,
        block as IllustrationContentBlockV1,
        { animationDefinitions: [] }
      );

      failures.push(...result.failures.map((failure) => `${lesson.id}:${block.id}: ${failure}`));
      bindings.push(binding);
    });
  }

  return {
    valid: failures.length === 0,
    failures,
    bindings
  };
}
