import {
  ANIMATION_CONTRACT_VERSION,
  type AnimationDefinitionV1,
  type AnimationEventV1,
  type AnimationValidationResultV1,
  type AnimationPrimitiveV1,
  type AnimationStatusV1,
  resolveAnimationCustomization,
  validateAnimationDefinition
} from "./contracts";

export type AnimationTimedCueV1 = {
  voiceCueId: string;
  startMs: number;
  endMs?: number;
  offsetMs?: number;
  eventIds: string[];
};

export type AnimationTargetProjectionV1 = {
  status: AnimationStatusV1;
  stateId: string;
};

export type AnimationPacketPhaseV1 = "idle" | "traveling" | "complete";

export type AnimationPacketProjectionV1 = {
  phase: AnimationPacketPhaseV1;
  progress: number;
  eventId?: string;
  from: string;
  to: string;
};

export type AnimationStateProjectionV1 = {
  timeMs: number;
  targets: Record<string, AnimationTargetProjectionV1>;
};

export type AnimationTimelineProjectionV1 = AnimationStateProjectionV1 & {
  packets: Record<string, AnimationPacketProjectionV1>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function normalizeTimeMs(value: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  if (value === Number.POSITIVE_INFINITY) return Number.MAX_SAFE_INTEGER;
  if (value === Number.NEGATIVE_INFINITY) return 0;
  return value;
}

function eventMap(definition: AnimationDefinitionV1): Map<string, AnimationEventV1> {
  return new Map(definition.events.map((event) => [event.id, event]));
}

function cueTimeMs(cue: AnimationTimedCueV1): number {
  return cue.startMs + (cue.offsetMs ?? 0);
}

function sortedCues(cues: AnimationTimedCueV1[]): AnimationTimedCueV1[] {
  return [...cues].sort((a, b) => {
    const timeDifference = cueTimeMs(a) - cueTimeMs(b);
    return timeDifference || a.voiceCueId.localeCompare(b.voiceCueId);
  });
}

function packetPrimitives(definition: AnimationDefinitionV1) {
  return definition.primitives.filter(
    (primitive): primitive is Extract<AnimationPrimitiveV1, { kind: "packet" }> =>
      primitive.kind === "packet"
  );
}

function packetEvents(
  definition: AnimationDefinitionV1,
  cues: AnimationTimedCueV1[],
  packetId: string
) {
  const events = eventMap(definition);
  const result: Array<{ event: AnimationEventV1; atMs: number }> = [];

  for (const cue of cues) {
    const atMs = cueTimeMs(cue);
    for (const eventId of cue.eventIds) {
      const event = events.get(eventId);
      if (!event || event.targetId !== packetId) continue;
      if (event.action !== "send" && event.action !== "receive") continue;
      result.push({ event, atMs });
    }
  }

  return result.sort(
    (a, b) =>
      a.atMs - b.atMs || a.event.id.localeCompare(b.event.id)
  );
}

export function validateAnimationTimedCueSchedule(
  value: unknown,
  definition: unknown
): AnimationValidationResultV1 {
  const failures: string[] = [];

  if (!Array.isArray(value)) {
    return { valid: false, failures: ["animation timed cue schedule must be an array"] };
  }

  if (!isObject(definition)) {
    return { valid: false, failures: ["animation definition is required"] };
  }

  const definitionResult = validateAnimationDefinition(definition);
  if (!definitionResult.valid) {
    failures.push(...definitionResult.failures);
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

  for (const cue of value) {
    if (!isObject(cue)) {
      failures.push("timed cue must be an object");
      continue;
    }

    const voiceCueId = cue.voiceCueId;
    if (!isNonEmptyString(voiceCueId)) {
      failures.push("voice cue id is required");
    } else if (cueIds.has(voiceCueId)) {
      failures.push(`duplicate voice cue id: ${voiceCueId}`);
    } else {
      cueIds.add(voiceCueId);
    }

    const startMs = cue.startMs;
    const validStartMs = isFiniteNumber(startMs);

    if (!validStartMs || startMs < 0) {
      failures.push(`voice cue ${String(voiceCueId)} startMs is invalid`);
    }

    if (
      cue.endMs !== undefined &&
      (!isFiniteNumber(cue.endMs) ||
        !validStartMs ||
        cue.endMs < startMs)
    ) {
      failures.push(`voice cue ${String(voiceCueId)} endMs is invalid`);
    }

    if (
      cue.offsetMs !== undefined &&
      (!isFiniteNumber(cue.offsetMs) || cue.offsetMs < 0)
    ) {
      failures.push(`voice cue ${String(voiceCueId)} offsetMs is invalid`);
    }

    if (!Array.isArray(cue.eventIds) || cue.eventIds.length === 0) {
      failures.push(`voice cue ${String(voiceCueId)} eventIds must be non-empty`);
      continue;
    }

    for (const eventId of cue.eventIds) {
      if (!isNonEmptyString(eventId) || !eventIds.has(eventId)) {
        failures.push(
          `event id does not exist for voice cue ${String(voiceCueId)}: ${String(eventId)}`
        );
      }
    }
  }

  return { valid: failures.length === 0, failures };
}

function initialTargets(definition: AnimationDefinitionV1) {
  const targets: Record<string, AnimationTargetProjectionV1> = {};

  const initial = definition.states[0];
  if (!initial) return targets;

  for (const target of initial.targetStatuses) {
    targets[target.targetId] = {
      status: target.status,
      stateId: initial.id
    };
  }

  return targets;
}

function applyEvent(
  targets: Record<string, AnimationTargetProjectionV1>,
  event: AnimationEventV1,
  definition: AnimationDefinitionV1
) {
  const state = definition.states.find(
    (candidate) => candidate.id === event.targetStateId
  );

  if (!state) return;

  for (const target of state.targetStatuses) {
    targets[target.targetId] = {
      status: target.status,
      stateId: state.id
    };
  }
}

function normalizedDefinition(
  definition: AnimationDefinitionV1
): AnimationDefinitionV1 {
  return {
    ...definition,
    version: ANIMATION_CONTRACT_VERSION
  };
}

export function animationStateAt(
  definition: AnimationDefinitionV1,
  cues: AnimationTimedCueV1[],
  timeMs: number
): AnimationStateProjectionV1 {
  const safeDefinition = normalizedDefinition(definition);
  const safeTime = normalizeTimeMs(timeMs);
  const events = eventMap(safeDefinition);
  const targets = initialTargets(safeDefinition);

  for (const cue of sortedCues(cues)) {
    const atMs = cueTimeMs(cue);
    if (atMs > safeTime) break;

    for (const eventId of cue.eventIds) {
      const event = events.get(eventId);
      if (event) {
        applyEvent(targets, event, safeDefinition);
      }
    }
  }

  return {
    timeMs: safeTime,
    targets
  };
}

export function animationTimelineAt(
  definition: AnimationDefinitionV1,
  cues: AnimationTimedCueV1[],
  timeMs: number
): AnimationTimelineProjectionV1 {
  const state = animationStateAt(definition, cues, timeMs);
  const customization = resolveAnimationCustomization(
    definition.visual.customization
  );
  const travelMs = customization.motion.travelMs;
  const safeTime = state.timeMs;
  const packets: Record<string, AnimationPacketProjectionV1> = {};

  for (const packet of packetPrimitives(definition)) {
    const events = packetEvents(definition, cues, packet.id);
    const latest = events.filter((item) => item.atMs <= safeTime).at(-1);

    if (!latest) {
      packets[packet.id] = {
        phase: "idle",
        progress: 0,
        from: packet.from,
        to: packet.to
      };
      continue;
    }

    const elapsed = safeTime - latest.atMs;
    const progress = Math.max(0, Math.min(1, elapsed / travelMs));

    packets[packet.id] = {
      phase: progress >= 1 ? "complete" : "traveling",
      progress,
      eventId: latest.event.id,
      from: packet.from,
      to: packet.to
    };
  }

  return {
    ...state,
    packets
  };
}
