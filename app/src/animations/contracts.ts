export const ANIMATION_CONTRACT_VERSION = 1 as const;
export const ANIMATION_VIEWPORT = {
  width: 1200,
  height: 675
} as const;

export type AnimationThemeV1 = "devops-dark-v1";
export type AnimationAccentV1 = "indigo" | "cyan" | "violet";
export type AnimationDensityV1 = "compact" | "comfortable";
export type AnimationEmphasisV1 = "subtle" | "standard" | "strong";
export type AnimationNodeVariantV1 = "rounded" | "technical";
export type AnimationEasingV1 = "standard" | "emphasized" | "linear";
export type AnimationStatusV1 =
  | "neutral"
  | "info"
  | "healthy"
  | "warning"
  | "failure"
  | "disabled"
  | "active";

export type AnimationPrimitiveRoleV1 =
  | "client"
  | "gateway"
  | "service"
  | "server"
  | "database"
  | "queue"
  | "worker"
  | "container"
  | "terminal"
  | "file"
  | "pipeline";

export type AnimationPrimitiveV1 =
  | {
      kind: "node";
      id: string;
      label: string;
      role: AnimationPrimitiveRoleV1;
      x: number;
      y: number;
      width: number;
      height: number;
      variant?: AnimationNodeVariantV1;
    }
  | {
      kind: "connection";
      id: string;
      from: string;
      to: string;
      emphasis?: AnimationEmphasisV1;
    }
  | {
      kind: "packet";
      id: string;
      label?: string;
      from: string;
      to: string;
    }
  | {
      kind: "label";
      id: string;
      text: string;
      x: number;
      y: number;
    };

export type AnimationMotionCustomizationV1 = {
  travelMs?: number;
  emphasisMs?: number;
  settleMs?: number;
  easing?: AnimationEasingV1;
};

export type AnimationCustomizationV1 = {
  accent?: AnimationAccentV1;
  density?: AnimationDensityV1;
  emphasis?: AnimationEmphasisV1;
  nodeVariant?: AnimationNodeVariantV1;
  motion?: AnimationMotionCustomizationV1;
};

export const DEFAULT_ANIMATION_CUSTOMIZATION: Required<
  Omit<AnimationCustomizationV1, "motion">
> & {
  motion: Required<AnimationMotionCustomizationV1>;
} = {
  accent: "indigo",
  density: "comfortable",
  emphasis: "standard",
  nodeVariant: "rounded",
  motion: {
    travelMs: 600,
    emphasisMs: 300,
    settleMs: 400,
    easing: "standard"
  }
};

export type AnimationVisualContractV1 = {
  theme: AnimationThemeV1;
  customization?: AnimationCustomizationV1;
};

export type AnimationTargetStatusV1 = {
  targetId: string;
  status: AnimationStatusV1;
};

export type AnimationStateV1 = {
  id: string;
  status: AnimationStatusV1;
  targetStatuses: AnimationTargetStatusV1[];
};

export type AnimationEventActionV1 =
  | "activate"
  | "deactivate"
  | "send"
  | "receive"
  | "connect"
  | "disconnect"
  | "set-status"
  | "highlight";

export type AnimationEventV1 = {
  id: string;
  action: AnimationEventActionV1;
  targetId: string;
  targetStateId: string;
};

export type AnimationInteractionActionV1 =
  | "click"
  | "toggle"
  | "select"
  | "drag";

export type AnimationInteractionV1 = {
  id: string;
  action: AnimationInteractionActionV1;
  targetId: string;
  eventIds: string[];
};

export type AnimationAccessibilityV1 = {
  title: string;
  description: string;
  reducedMotion: "supported";
};

export type AnimationDefinitionV1 = {
  version: typeof ANIMATION_CONTRACT_VERSION;
  id: string;
  title: string;
  viewport?: typeof ANIMATION_VIEWPORT;
  visual: AnimationVisualContractV1;
  primitives: AnimationPrimitiveV1[];
  states: AnimationStateV1[];
  events: AnimationEventV1[];
  interactions: AnimationInteractionV1[];
  accessibility: AnimationAccessibilityV1;
};

export type AnimationVoiceCueBindingV1 = {
  voiceCueId: string;
  offsetMs?: number;
  eventIds: string[];
};

export type AnimationLessonBindingV1 = {
  version: typeof ANIMATION_CONTRACT_VERSION;
  animationId: string;
  cueBindings: AnimationVoiceCueBindingV1[];
  learnerCheckpoints?: string[];
};

export type AnimationValidationResultV1 = {
  valid: boolean;
  failures: string[];
};

const MOTION_LIMITS = {
  travelMs: { min: 120, max: 1800 },
  emphasisMs: { min: 100, max: 900 },
  settleMs: { min: 100, max: 1200 }
} as const;

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isEnum<T extends string>(
  value: unknown,
  allowed: readonly T[]
): value is T {
  return typeof value === "string" && allowed.includes(value as T);
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function validateMotionCustomization(
  value: unknown,
  failures: string[],
  prefix: string
) {
  if (!isObject(value)) {
    failures.push(`${prefix} must be an object`);
    return;
  }

  const allowed = ["travelMs", "emphasisMs", "settleMs", "easing"] as const;
  if (!hasOnlyKeys(value, allowed)) {
    failures.push(`${prefix} contains an unknown field`);
  }

  for (const key of ["travelMs", "emphasisMs", "settleMs"] as const) {
    if (value[key] === undefined) continue;
    if (!isFiniteNumber(value[key])) {
      failures.push(`${prefix}.${key} must be finite`);
      continue;
    }
    const limits = MOTION_LIMITS[key];
    if (value[key] < limits.min || value[key] > limits.max) {
      failures.push(
        `${prefix}.${key} must be between ${limits.min} and ${limits.max}`
      );
    }
  }

  if (
    value.easing !== undefined &&
    !isEnum(value.easing, ["standard", "emphasized", "linear"])
  ) {
    failures.push(`${prefix}.easing is invalid`);
  }
}

function validateCustomization(value: unknown, failures: string[]) {
  if (!isObject(value)) {
    failures.push("visual customization must be an object");
    return;
  }

  const allowed = [
    "accent",
    "density",
    "emphasis",
    "nodeVariant",
    "motion"
  ] as const;

  if (!hasOnlyKeys(value, allowed)) {
    failures.push("unknown visual customization field");
  }

  if (
    value.accent !== undefined &&
    !isEnum(value.accent, ["indigo", "cyan", "violet"])
  ) {
    failures.push("visual customization accent is invalid");
  }

  if (
    value.density !== undefined &&
    !isEnum(value.density, ["compact", "comfortable"])
  ) {
    failures.push("visual customization density is invalid");
  }

  if (
    value.emphasis !== undefined &&
    !isEnum(value.emphasis, ["subtle", "standard", "strong"])
  ) {
    failures.push("visual customization emphasis is invalid");
  }

  if (
    value.nodeVariant !== undefined &&
    !isEnum(value.nodeVariant, ["rounded", "technical"])
  ) {
    failures.push("visual customization nodeVariant is invalid");
  }

  if (value.motion !== undefined) {
    validateMotionCustomization(value.motion, failures, "visual customization motion");
  }
}

function validatePrimitive(
  primitive: unknown,
  primitiveIds: Set<string>,
  failures: string[]
) {
  if (!isObject(primitive)) {
    failures.push("primitive must be an object");
    return;
  }

  const id = primitive.id;
  if (!isNonEmptyString(id)) {
    failures.push("primitive id is required");
    return;
  }

  if (primitiveIds.has(id)) {
    failures.push(`duplicate primitive id: ${id}`);
  }
  primitiveIds.add(id);

  if (!isNonEmptyString(primitive.kind)) {
    failures.push(`primitive ${id} kind is required`);
    return;
  }

  if (
    primitive.kind === "node" ||
    primitive.kind === "label"
  ) {
    const x = primitive.x;
    const y = primitive.y;
    if (!isFiniteNumber(x) || !isFiniteNumber(y)) {
      failures.push(`primitive ${id} position is invalid`);
    }
  }

  if (primitive.kind === "node") {
    for (const key of ["width", "height"] as const) {
      if (!isFiniteNumber(primitive[key]) || primitive[key] <= 0) {
        failures.push(`primitive ${id} ${key} is invalid`);
      }
    }

    if (
      isFiniteNumber(primitive.x) &&
      isFiniteNumber(primitive.y) &&
      isFiniteNumber(primitive.width) &&
      isFiniteNumber(primitive.height) &&
      (primitive.x < 0 ||
        primitive.y < 0 ||
        primitive.x + primitive.width > ANIMATION_VIEWPORT.width ||
        primitive.y + primitive.height > ANIMATION_VIEWPORT.height)
    ) {
      failures.push(`primitive ${id} is outside viewport`);
    }

    if (
      primitive.variant !== undefined &&
      !isEnum(primitive.variant, ["rounded", "technical"])
    ) {
      failures.push(`primitive ${id} variant is invalid`);
    }
  }

  if (primitive.kind === "connection" || primitive.kind === "packet") {
    if (!isNonEmptyString(primitive.from) || !isNonEmptyString(primitive.to)) {
      failures.push(`primitive ${id} endpoints are required`);
    }
  }

  if (primitive.kind === "label" && !isNonEmptyString(primitive.text)) {
    failures.push(`primitive ${id} text is required`);
  }
}

export function resolveAnimationCustomization(
  customization?: AnimationCustomizationV1
) {
  const motion = {
    ...DEFAULT_ANIMATION_CUSTOMIZATION.motion,
    ...(customization?.motion ?? {})
  };

  return {
    ...DEFAULT_ANIMATION_CUSTOMIZATION,
    ...customization,
    motion
  };
}

export function validateAnimationDefinition(
  value: unknown
): AnimationValidationResultV1 {
  const failures: string[] = [];

  if (!isObject(value)) {
    return { valid: false, failures: ["animation definition must be an object"] };
  }

  if (value.version !== ANIMATION_CONTRACT_VERSION) {
    failures.push("animation version must be 1");
  }

  if (!isNonEmptyString(value.id)) {
    failures.push("animation id is required");
  }

  if (!isNonEmptyString(value.title)) {
    failures.push("animation title is required");
  }

  if (!isObject(value.visual)) {
    failures.push("animation visual contract is required");
  } else {
    if (value.visual.theme !== "devops-dark-v1") {
      failures.push("animation visual theme is invalid");
    }
    if (value.visual.customization !== undefined) {
      validateCustomization(value.visual.customization, failures);
    }
  }

  if (
    value.viewport !== undefined &&
    JSON.stringify(value.viewport) !== JSON.stringify(ANIMATION_VIEWPORT)
  ) {
    failures.push("animation viewport must use the standard 1200x675 viewport");
  }

  if (!Array.isArray(value.primitives) || value.primitives.length === 0) {
    failures.push("animation primitives must be a non-empty array");
  }

  const primitiveIds = new Set<string>();
  const primitiveKinds = new Map<string, string>();

  if (Array.isArray(value.primitives)) {
    for (const primitive of value.primitives) {
      const before = primitiveIds.size;
      validatePrimitive(primitive, primitiveIds, failures);
      if (primitiveIds.size > before && isObject(primitive) && isNonEmptyString(primitive.id)) {
        primitiveKinds.set(primitive.id, String(primitive.kind));
      }
    }
  }

  const stateIds = new Set<string>();
  if (!Array.isArray(value.states) || value.states.length === 0) {
    failures.push("animation states must be a non-empty array");
  } else {
    for (const state of value.states) {
      if (!isObject(state) || !isNonEmptyString(state.id)) {
        failures.push("animation state id is required");
        continue;
      }
      if (stateIds.has(state.id)) {
        failures.push(`duplicate state id: ${state.id}`);
      }
      stateIds.add(state.id);

      if (!isEnum(state.status, [
        "neutral",
        "info",
        "healthy",
        "warning",
        "failure",
        "disabled",
        "active"
      ])) {
        failures.push(`state ${state.id} status is invalid`);
      }

      if (!Array.isArray(state.targetStatuses)) {
        failures.push(`state ${state.id} targetStatuses must be an array`);
        continue;
      }

      for (const target of state.targetStatuses) {
        if (!isObject(target) || !isNonEmptyString(target.targetId)) {
          failures.push(`state ${state.id} target id is invalid`);
          continue;
        }
        if (!primitiveIds.has(target.targetId)) {
          failures.push(
            `state ${state.id} target does not exist: ${target.targetId}`
          );
        }
      }
    }
  }

  const eventIds = new Set<string>();
  if (!Array.isArray(value.events)) {
    failures.push("animation events must be an array");
  } else {
    for (const event of value.events) {
      if (!isObject(event) || !isNonEmptyString(event.id)) {
        failures.push("animation event id is required");
        continue;
      }
      if (eventIds.has(event.id)) {
        failures.push(`duplicate event id: ${event.id}`);
      }
      eventIds.add(event.id);

      if (!primitiveIds.has(event.targetId)) {
        failures.push(`event target does not exist: ${event.targetId}`);
      }

      if (!stateIds.has(event.targetStateId)) {
        failures.push(`event target state does not exist: ${event.targetStateId}`);
      }

      if (
        !isEnum(event.action, [
          "activate",
          "deactivate",
          "send",
          "receive",
          "connect",
          "disconnect",
          "set-status",
          "highlight"
        ])
      ) {
        failures.push(`event ${event.id} action is invalid`);
      }
    }
  }

  if (!Array.isArray(value.interactions)) {
    failures.push("animation interactions must be an array");
  } else {
    for (const interaction of value.interactions) {
      if (!isObject(interaction) || !isNonEmptyString(interaction.id)) {
        failures.push("animation interaction id is required");
        continue;
      }

      if (!primitiveIds.has(interaction.targetId)) {
        failures.push(
          `interaction target does not exist: ${interaction.targetId}`
        );
      }

      if (!Array.isArray(interaction.eventIds)) {
        failures.push(
          `interaction ${interaction.id} eventIds must be an array`
        );
      } else {
        for (const eventId of interaction.eventIds) {
          if (!eventIds.has(eventId)) {
            failures.push(
              `interaction event id does not exist: ${eventId}`
            );
          }
        }
      }

      if (
        !isEnum(interaction.action, ["click", "toggle", "select", "drag"])
      ) {
        failures.push(`interaction ${interaction.id} action is invalid`);
      }
    }
  }

  if (!isObject(value.accessibility)) {
    failures.push("animation accessibility contract is required");
  } else {
    if (!isNonEmptyString(value.accessibility.title)) {
      failures.push("animation accessibility title is required");
    }
    if (!isNonEmptyString(value.accessibility.description)) {
      failures.push("animation accessibility description is required");
    }
    if (value.accessibility.reducedMotion !== "supported") {
      failures.push("animation reduced-motion support is required");
    }
  }

  for (const [id, kind] of primitiveKinds) {
    if (
      (kind === "connection" || kind === "packet") &&
      isObject(value.primitives?.find?.(() => false))
    ) {
      // Intentionally empty: endpoint validation below is performed without
      // reaching into animation implementation details.
    }
    if (!primitiveIds.has(id)) {
      failures.push(`primitive id is missing: ${id}`);
    }
  }

  return { valid: failures.length === 0, failures };
}

export function validateAnimationLessonBinding(
  value: unknown,
  definition: unknown
): AnimationValidationResultV1 {
  const failures: string[] = [];

  if (!isObject(value)) {
    return { valid: false, failures: ["animation lesson binding must be an object"] };
  }

  if (!isObject(definition)) {
    return { valid: false, failures: ["animation definition is required"] };
  }

  if (value.version !== ANIMATION_CONTRACT_VERSION) {
    failures.push("animation lesson binding version must be 1");
  }

  if (!isNonEmptyString(value.animationId)) {
    failures.push("animation lesson binding animationId is required");
  }

  if (value.animationId !== definition.id) {
    failures.push("animation id does not match definition");
  }

  const eventIds = new Set<string>();
  if (Array.isArray(definition.events)) {
    for (const event of definition.events) {
      if (isObject(event) && isNonEmptyString(event.id)) {
        eventIds.add(event.id);
      }
    }
  }

  const cueIds = new Set<string>();
  if (!Array.isArray(value.cueBindings)) {
    failures.push("animation cueBindings must be an array");
  } else {
    for (const binding of value.cueBindings) {
      if (!isObject(binding) || !isNonEmptyString(binding.voiceCueId)) {
        failures.push("voice cue id is required");
        continue;
      }

      if (cueIds.has(binding.voiceCueId)) {
        failures.push(`duplicate voice cue id: ${binding.voiceCueId}`);
      }
      cueIds.add(binding.voiceCueId);

      if (
        binding.offsetMs !== undefined &&
        (!isFiniteNumber(binding.offsetMs) || binding.offsetMs < 0)
      ) {
        failures.push(`voice cue ${binding.voiceCueId} offsetMs is invalid`);
      }

      if (!Array.isArray(binding.eventIds) || binding.eventIds.length === 0) {
        failures.push(
          `voice cue ${binding.voiceCueId} eventIds must be non-empty`
        );
        continue;
      }

      for (const eventId of binding.eventIds) {
        if (!eventIds.has(eventId)) {
          failures.push(
            `event id does not exist for voice cue ${binding.voiceCueId}: ${eventId}`
          );
        }
      }
    }
  }

  if (value.learnerCheckpoints !== undefined) {
    if (!Array.isArray(value.learnerCheckpoints)) {
      failures.push("learnerCheckpoints must be an array");
    } else if (
      value.learnerCheckpoints.some((checkpoint) => !isNonEmptyString(checkpoint))
    ) {
      failures.push("learnerCheckpoints must contain non-empty strings");
    }
  }

  return { valid: failures.length === 0, failures };
}
