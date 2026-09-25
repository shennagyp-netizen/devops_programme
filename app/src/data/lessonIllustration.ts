import type { LessonContentBlock } from "./lessonContent";

export type LessonIllustrationVariantV1 =
  | "causal-flow-v1"
  | "container-boundary-v1";

export type LessonIllustrationStageV1 = {
  id: string;
  label: string;
  detail: string;
};

export type LessonIllustrationCalloutV1 = {
  id: string;
  label: string;
  detail: string;
};

export type LessonIllustrationCheckV1 = {
  id: string;
  label: string;
  detail: string;
};

export type LessonIllustrationModelV1 = {
  version: 1;
  variant: LessonIllustrationVariantV1;
  title: string;
  stages: LessonIllustrationStageV1[];
  foundation?: {
    label: string;
    detail: string;
  };
  callouts: LessonIllustrationCalloutV1[];
  failureChecks: LessonIllustrationCheckV1[];
};

const CONTAINER_BOUNDARY_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "container-boundary-v1",
  title: "The isolation boundary",
  stages: [
    {
      id: "image",
      label: "Image",
      detail: "Packaged files, runtime pieces and startup instructions"
    },
    {
      id: "container",
      label: "Container",
      detail: "An isolated process environment created from the image"
    },
    {
      id: "process",
      label: "Process",
      detail: "The application process that actually does the work"
    }
  ],
  foundation: {
    label: "Shared host kernel",
    detail: "Containers isolate processes; they do not contain a second kernel."
  },
  callouts: [
    {
      id: "persistent-data",
      label: "Persistent data → volume",
      detail: "Important data needs storage that is not tied to one container lifetime."
    },
    {
      id: "published-port",
      label: "Published port",
      detail: "A host port can forward traffic to a different container port."
    }
  ],
  failureChecks: [
    {
      id: "process-listening",
      label: "1. Process listening?",
      detail: "A running container can still contain a process that is not listening."
    },
    {
      id: "container-port",
      label: "2. Container port?",
      detail: "Confirm the process is using the port you expect inside the container."
    },
    {
      id: "host-port",
      label: "3. Host port?",
      detail: "Confirm the container port is actually published to the host."
    },
    {
      id: "network-path",
      label: "4. Network path?",
      detail: "Finally test the path from the client to the host port."
    }
  ]
};

function genericModel(
  block: Extract<LessonContentBlock, { type: "illustration" }>
): LessonIllustrationModelV1 {
  return {
    version: 1,
    variant: "causal-flow-v1",
    title: block.heading,
    stages: block.nodes.map((label, index) => ({
      id: "stage-" + String(index + 1),
      label,
      detail:
        index === 0
          ? "Start from the problem."
          : index === block.nodes.length - 1
            ? "Use evidence to prove the result."
            : "Follow the mechanism."
    })),
    callouts: [],
    failureChecks: []
  };
}

export function getLessonIllustrationModel(
  block: Extract<LessonContentBlock, { type: "illustration" }>
): LessonIllustrationModelV1 {
  if (block.variant === "container-boundary-v1") {
    return {
      ...CONTAINER_BOUNDARY_VARIANT,
      title: block.heading
    };
  }

  return genericModel(block);
}

export function validateLessonIllustrationModel(
  value: unknown
): { valid: boolean; failures: string[] } {
  const failures: string[] = [];

  if (!value || typeof value !== "object") {
    return { valid: false, failures: ["illustration model must be an object"] };
  }

  const model = value as Partial<LessonIllustrationModelV1>;
  if (model.version !== 1) failures.push("illustration model version must be 1");
  if (
    model.variant !== "causal-flow-v1" &&
    model.variant !== "container-boundary-v1"
  ) {
    failures.push("illustration model variant is invalid");
  }
  if (!Array.isArray(model.stages) || model.stages.length < 2) {
    failures.push("illustration model needs at least two stages");
  }

  return { valid: failures.length === 0, failures };
}