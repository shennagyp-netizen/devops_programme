import type { LessonContentBlock } from "./lessonContent";

export type LessonIllustrationVariantV1 =
  | "causal-flow-v1"
  | "container-boundary-v1"
  | "request-path-v1"
  | "https-stack-v1"
  | "repeatable-service-v1"
  | "delivery-pipeline-v1";

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


const REQUEST_PATH_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "request-path-v1",
  title: "The request path",
  stages: [
    { id: "name", label: "Name", detail: "A service name must resolve to usable address information." },
    { id: "route", label: "Route", detail: "The host chooses how packets should reach the destination." },
    { id: "connection", label: "Connection", detail: "The expected transport endpoint must be reachable." },
    { id: "application", label: "Application", detail: "The protocol must produce the response the client expects." }
  ],
  callouts: [],
  failureChecks: [
    { id: "name-resolution", label: "1. Name resolution", detail: "Does the name resolve to the expected address?" },
    { id: "route-selected", label: "2. Route selected", detail: "Does the client have a usable route to that address?" },
    { id: "port-reachable", label: "3. Port reachable", detail: "Can the client reach the expected transport endpoint?" },
    { id: "protocol-response", label: "4. Protocol response", detail: "Did the application protocol actually answer correctly?" }
  ]
};

const HTTPS_STACK_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "https-stack-v1",
  title: "One HTTPS request",
  stages: [
    { id: "dns", label: "DNS", detail: "Turn a service name into address information." },
    { id: "route", label: "Route", detail: "Choose the network path toward the destination." },
    { id: "transport", label: "Transport", detail: "Reach the expected TCP endpoint in a typical HTTPS setup." },
    { id: "tls", label: "TLS", detail: "Authenticate the peer and establish the encrypted session." },
    { id: "http", label: "HTTP", detail: "Send the application request and interpret the response." }
  ],
  callouts: [
    { id: "timeout", label: "Timeout", detail: "The expected response did not arrive within the client's wait window." },
    { id: "refusal", label: "Refusal", detail: "A reachable endpoint actively rejected the connection." },
    { id: "tls-failure", label: "TLS failure", detail: "The secure session could not be established as expected." },
    { id: "http-error", label: "HTTP error", detail: "The secure connection worked, but the application returned an error response." }
  ],
  failureChecks: []
};


const REPEATABLE_SERVICE_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "repeatable-service-v1",
  title: "The repeatable service contract",
  stages: [
    { id: "image", label: "Image", detail: "The application and runtime pieces are packaged into a repeatable starting artifact." },
    { id: "configuration", label: "Configuration", detail: "Environment-specific values are supplied at runtime; secrets are handled separately." },
    { id: "runtime", label: "Runtime", detail: "The process starts with the dependencies and data it needs to operate." },
    { id: "health", label: "Health", detail: "A focused readiness signal says when real traffic can be accepted." },
    { id: "user-path", label: "User path", detail: "A real application action proves more than a process being alive." }
  ],
  foundation: {
    label: "Persistent data has its own lifecycle",
    detail: "Replacing a container should not destroy important application data."
  },
  callouts: [
    { id: "config-secrets", label: "Config ≠ secrets", detail: "Normal environment values can be documented; credentials and other secrets need tighter handling." },
    { id: "startup-contract", label: "Startup is a contract", detail: "A new engineer should be able to follow the same path without private knowledge from the previous operator." }
  ],
  failureChecks: [
    { id: "configuration-loaded", label: "1. Configuration loaded?", detail: "Confirm the process received the values it actually needs." },
    { id: "process-running", label: "2. Process running?", detail: "A running process proves life, not readiness." },
    { id: "service-ready", label: "3. Service ready?", detail: "Confirm dependencies and readiness conditions are satisfied before sending traffic." },
    { id: "user-path-works", label: "4. User path works?", detail: "Verify one real application action against known-good data." }
  ]
};


const DELIVERY_PIPELINE_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "delivery-pipeline-v1",
  title: "The release path",
  stages: [
    { id: "change", label: "Change", detail: "Create a reviewable code change with a stable source identity." },
    { id: "review", label: "Review", detail: "Another engineer can inspect what changed before it becomes a release." },
    { id: "test", label: "Test", detail: "Automated checks provide evidence about the proposed change." },
    { id: "artifact", label: "Artifact", detail: "Build one identifiable artifact that can be promoted through environments." },
    { id: "deploy", label: "Deploy", detail: "Place that identified artifact into the target environment." },
    { id: "verify", label: "Verify", detail: "Check runtime health and real user behavior after deployment." }
  ],
  foundation: {
    label: "Release identity",
    detail: "A fixed release identifier lets operators answer exactly what was built, tested and deployed."
  },
  callouts: [
    { id: "build-once", label: "Build once, promote the artifact", detail: "Avoid rebuilding at deployment time when the delivery model depends on artifact identity." },
    { id: "rollback-scope", label: "Rollback has scope", detail: "Application code can be reversible while database schema or data changes may require a different recovery plan." }
  ],
  failureChecks: [
    { id: "known-change", label: "1. Known change?", detail: "Can you identify the exact source change that created this release?" },
    { id: "tested-artifact", label: "2. Tested artifact?", detail: "Can you prove the deployed artifact is the one that passed the intended checks?" },
    { id: "deployed-version", label: "3. Deployed version?", detail: "Can the running environment identify exactly which release is active?" },
    { id: "runtime-health", label: "4. Runtime healthy?", detail: "Did the real service remain healthy after deployment?" }
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

  if (block.variant === "request-path-v1") {
    return {
      ...REQUEST_PATH_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "https-stack-v1") {
    return {
      ...HTTPS_STACK_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "repeatable-service-v1") {
    return {
      ...REPEATABLE_SERVICE_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "delivery-pipeline-v1") {
    return {
      ...DELIVERY_PIPELINE_VARIANT,
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
    model.variant !== "container-boundary-v1" &&
    model.variant !== "request-path-v1" &&
    model.variant !== "https-stack-v1" &&
    model.variant !== "repeatable-service-v1" &&
    model.variant !== "delivery-pipeline-v1"
  ) {
    failures.push("illustration model variant is invalid");
  }
  if (!Array.isArray(model.stages) || model.stages.length < 2) {
    failures.push("illustration model needs at least two stages");
  }

  return { valid: failures.length === 0, failures };
}