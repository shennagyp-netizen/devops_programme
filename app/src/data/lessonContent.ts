export type LessonVideoCue = {
  id: string;
  label: string;
  startMs: number;
  endMs?: number;
};

export type LessonIllustrationVariantV1 =
  | "causal-flow-v1"
  | "container-boundary-v1";

export type LessonContentBlock =
  | {
      id: string;
      type: "text";
      heading?: string;
      body: string;
    }
  | {
      id: string;
      type: "illustration";
      heading: string;
      alt: string;
      bindingId: string;
      nodes: string[];
      variant?: LessonIllustrationVariantV1;
      caption?: string;
    }
  | {
      id: string;
      type: "interactive-illustration";
      heading: string;
      alt: string;
      bindingId: string;
      caption?: string;
    }
  | {
      id: string;
      type: "video";
      heading: string;
      status: "draft" | "published";
      src: string;
      poster?: string;
      captionsSrc?: string;
      transcript?: string;
      durationMs?: number;
      cues?: LessonVideoCue[];
    };

export type LessonContent = {
  version: 1;
  blocks: LessonContentBlock[];
};

export type LessonContentSeed = {
  id: string;
  title: string;
  objective: string;
  humanExample: string;
};

const authoredLessonContent: Record<string, LessonContent> = {
  "B1.4": {
    version: 1,
    blocks: [
      {
        id: "b1-4-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "A container is useful only when it gives the team a repeatable boundary for the process, files and configuration they actually need to operate."
      },
      {
        id: "b1-2-request-path",
        type: "illustration",
        heading: "The request path",
        alt: "A request moves from a name through DNS, routing, transport and the application",
        bindingId: "B1.2:b1-2-request-path",
        nodes: ["Name", "Route", "Connection", "Application"],
                variant: "request-path-v1",
        caption:
          "A request is a chain. Diagnose the smallest layer that can explain the observed failure."
      },
      {
        id: "b1-3-request-stack",
        type: "illustration",
        heading: "One HTTPS request",
        alt: "DNS, routing, transport, TLS and HTTP cooperate to produce an HTTPS response",
        bindingId: "B1.3:request-stack",
        nodes: ["DNS", "Route", "Transport", "TLS", "HTTP"],
                variant: "https-stack-v1",
        caption:
          "DNS, routing, transport, TLS and HTTP cooperate; a failure at one stage changes the evidence."
      },
      {
        id: "b1-4-isolation",
        type: "illustration",
        heading: "The isolation boundary",
        alt: "Image becomes a container and then an isolated process environment",
        bindingId: "B1.4:b1-4-isolation",
        nodes: ["Image", "Container", "Process"],
        variant: "container-boundary-v1",
        caption:
          "Use the picture to connect the packaging decision to the running process."
      },
      {
        id: "b1-4-video",
        type: "video",
        heading: "Container demonstration",
        status: "draft",
        src: "",
        transcript:
          "Authoring slot: publish a demonstration that shows the image, container and running process, then connect the visible change to the learner's hands-on task."
      }
    ]
  }
};

function isSafeMediaSource(value: unknown) {
  return (
    typeof value === "string" &&
    ((value.startsWith("/") && !value.startsWith("//")) || /^https:\/\//i.test(value))
  );
}

function isFinitePositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function validateLessonContent(
  value: unknown
): { valid: boolean; failures: string[] } {
  const failures: string[] = [];

  if (!value || typeof value !== "object") {
    return { valid: false, failures: ["content must be an object"] };
  }

  const candidate = value as Partial<LessonContent>;
  if (candidate.version !== 1) {
    failures.push("content version must be 1");
  }
  if (!Array.isArray(candidate.blocks) || candidate.blocks.length === 0) {
    failures.push("content blocks must be a non-empty array");
    return { valid: false, failures };
  }

  const blockIds = new Set<string>();

  for (const block of candidate.blocks) {
    if (!block || typeof block !== "object") {
      failures.push("content block must be an object");
      continue;
    }

    if (typeof block.id !== "string" || !block.id.trim()) {
      failures.push("content block id is required");
      continue;
    }

    if (blockIds.has(block.id)) {
      failures.push(`duplicate block id: ${block.id}`);
    }
    blockIds.add(block.id);

    if (block.type === "text") {
      if (typeof block.body !== "string" || !block.body.trim()) {
        failures.push(`text block ${block.id} must have body text`);
      }
      continue;
    }

    if (block.type === "illustration") {
      if (typeof block.heading !== "string" || !block.heading.trim()) {
        failures.push(`illustration block ${block.id} needs a heading`);
      }
      if (typeof block.alt !== "string" || !block.alt.trim()) {
        failures.push(`illustration block ${block.id} needs alt text`);
      }
      if (typeof block.bindingId !== "string" || !block.bindingId.trim()) {
        failures.push(`illustration block ${block.id} needs bindingId`);
      }
      if (
        block.variant !== undefined &&
        block.variant !== "causal-flow-v1" &&
        block.variant !== "container-boundary-v1"
      ) {
        failures.push(`illustration block ${block.id} has an invalid variant`);
      }
      if (!Array.isArray(block.nodes) || block.nodes.length === 0) {
        failures.push(`illustration block ${block.id} needs nodes`);
      } else if (
        block.nodes.some(
          (node) => typeof node !== "string" || !node.trim()
        )
      ) {
        failures.push(`illustration block ${block.id} needs non-empty string nodes`);
      }
      continue;
    }

    if (block.type === "interactive-illustration") {
      if (typeof block.heading !== "string" || !block.heading.trim()) {
        failures.push(`interactive illustration block ${block.id} needs a heading`);
      }
      if (typeof block.alt !== "string" || !block.alt.trim()) {
        failures.push(`interactive illustration block ${block.id} needs alt text`);
      }
      if (typeof block.bindingId !== "string" || !block.bindingId.trim()) {
        failures.push(`interactive illustration block ${block.id} needs bindingId`);
      }
      continue;
    }

    if (block.type !== "video") {
      failures.push(`unsupported content block type: ${String((block as { type?: unknown }).type)}`);
      continue;
    }

    if (typeof block.heading !== "string" || !block.heading.trim()) {
      failures.push(`video block ${block.id} needs a heading`);
    }

    if (
      block.src !== "" &&
      !isSafeMediaSource(block.src)
    ) {
      failures.push(`video source is invalid for block ${block.id}`);
    }
    if (block.status === "published" && !block.src) {
      failures.push(`published video source is missing for block ${block.id}`);
    }

    if (
      block.status !== "draft" &&
      block.status !== "published"
    ) {
      failures.push(`video block ${block.id} has an invalid status`);
    }

    if (block.poster !== undefined && !isSafeMediaSource(block.poster)) {
      failures.push(`video poster is invalid for block ${block.id}`);
    }

    if (
      block.captionsSrc !== undefined &&
      !isSafeMediaSource(block.captionsSrc)
    ) {
      failures.push(`video captions source is invalid for block ${block.id}`);
    }

    if (
      block.durationMs !== undefined &&
      !isFinitePositive(block.durationMs)
    ) {
      failures.push(`video duration is invalid for block ${block.id}`);
    }

    if (block.cues !== undefined) {
      if (!Array.isArray(block.cues)) {
        failures.push(`video cues must be an array for block ${block.id}`);
      } else {
        const cueIds = new Set<string>();
        let previousStart = -1;

        for (const cue of block.cues) {
          if (!cue || typeof cue !== "object") {
            failures.push(`video cue is invalid for block ${block.id}`);
            continue;
          }

          if (typeof cue.id !== "string" || !cue.id.trim()) {
            failures.push(`video cue id is required for block ${block.id}`);
          } else if (cueIds.has(cue.id)) {
            failures.push(`duplicate video cue id: ${cue.id}`);
          } else {
            cueIds.add(cue.id);
          }

          if (typeof cue.label !== "string" || !cue.label.trim()) {
            failures.push(`video cue label is required for block ${block.id}`);
          }

          if (
            !Number.isFinite(cue.startMs) ||
            cue.startMs < 0 ||
            cue.startMs < previousStart
          ) {
            failures.push(`video cue timing is invalid for block ${block.id}`);
          }

          if (
            cue.endMs !== undefined &&
            (!Number.isFinite(cue.endMs) || cue.endMs <= cue.startMs)
          ) {
            failures.push(`video cue timing is invalid for block ${block.id}`);
          }

          if (
            block.durationMs !== undefined &&
            ((cue.startMs ?? 0) > block.durationMs ||
              (cue.endMs !== undefined && cue.endMs > block.durationMs))
          ) {
            failures.push(`video cue exceeds duration for block ${block.id}`);
          }

          previousStart = cue.startMs;
        }
      }
    }
  }

  return { valid: failures.length === 0, failures };
}

export function buildDefaultLessonContent(seed: LessonContentSeed): LessonContent {
  return {
    version: 1,
    blocks: [
      {
        id: `${seed.id.toLowerCase()}-problem`,
        type: "text",
        heading: "Why this matters",
        body: `${seed.objective} ${seed.humanExample}`
      },
      {
        id: `${seed.id.toLowerCase()}-mechanism`,
        type: "illustration",
        heading: seed.title,
        alt: "A simple causal flow for the lesson",
        bindingId: `${seed.id}:${seed.id.toLowerCase()}-mechanism`,
        nodes: ["Problem", "Mechanism", "Evidence"],
        variant: "causal-flow-v1",
        caption:
          "The visual is a compact cue. The literal technical mechanism remains in the written lesson."
      }
    ]
  };
}

export function getLessonContent(
  seed: LessonContentSeed
): LessonContent {
  return authoredLessonContent[seed.id] ?? buildDefaultLessonContent(seed);
}
