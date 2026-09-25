import type { LessonContentBlock } from "./lessonContent";

export type LessonIllustrationVariantV1 =
  | "causal-flow-v1"
  | "container-boundary-v1"
  | "request-path-v1"
  | "https-stack-v1"
  | "repeatable-service-v1"
  | "delivery-pipeline-v1"
  | "observability-diagnosis-v1"
  | "backup-recovery-v1"
  | "queue-state-v1"
  | "incident-loop-v1"
  | "process-diagnosis-v1"
  | "linux-operating-model-v1"
  | "terminal-composition-v1"
  | "service-permission-model-v1"
  | "network-operating-model-v1"
  | "cidr-boundary-v1";

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


const OBSERVABILITY_DIAGNOSIS_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "observability-diagnosis-v1",
  title: "From symptom to evidence",
  stages: [
    { id: "symptom", label: "Symptom", detail: "Start with the user-visible complaint without assuming its cause." },
    { id: "scope", label: "Scope", detail: "Separate which users, requests, time window or endpoint are actually affected." },
    { id: "service", label: "Service", detail: "Compare latency, request rate, CPU, memory and focused health signals." },
    { id: "dependency", label: "Dependency", detail: "Correlate the service signal with database, network or other dependency evidence." },
    { id: "proof", label: "Proof", detail: "Test the strongest hypothesis, remove the controlled fault and verify recovery." }
  ],
  foundation: {
    label: "Signals answer different questions",
    detail: "Metrics show measured values over time; logs show events; health checks answer a focused state question; traces show where one request spent time."
  },
  callouts: [
    { id: "metrics", label: "Metrics", detail: "How much? When did it change? How is the value distributed?" },
    { id: "logs", label: "Logs", detail: "What event or message did the system record?" },
    { id: "health", label: "Health", detail: "Is the process alive or ready for the decision this check controls?" },
    { id: "traces", label: "Traces", detail: "Where did this request spend its time across the system?" }
  ],
  failureChecks: [
    { id: "scope-question", label: "1. Scope the symptom", detail: "Which endpoint, users, requests and time window are actually affected?" },
    { id: "correlated-change", label: "2. Correlate the signals", detail: "Which independent signals changed together rather than merely looking alarming?" },
    { id: "alternative-cause", label: "3. Challenge the hypothesis", detail: "What plausible alternative could produce the same symptom?" },
    { id: "recovery-proof", label: "4. Prove recovery", detail: "After the controlled change, did the same user-visible behavior return to the known-good state?" }
  ]
};


const BACKUP_RECOVERY_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "backup-recovery-v1",
  title: "From backup to recovery",
  stages: [
    { id: "backup", label: "Backup", detail: "Keep a usable copy of the data with a known age and recoverability boundary." },
    { id: "restore", label: "Restore", detail: "Recreate the data in a safe target before overwriting the only remaining copy." },
    { id: "compatibility", label: "Compatibility", detail: "Use an application, schema, configuration and secret set that can work with the restored data." },
    { id: "verify", label: "Verify", detail: "Prove that the restored data is complete, usable and consistent with the recovery goal." },
    { id: "recover", label: "Recover", detail: "Return the service to the required user-facing state within the recovery objectives." }
  ],
  foundation: {
    label: "RPO + RTO",
    detail: "RPO defines acceptable data loss; RTO defines how long recovery may take."
  },
  callouts: [
    { id: "backup-age", label: "Backup age", detail: "A backup only protects against the data loss window it can cover." },
    { id: "restore-target", label: "Safe restore target", detail: "Restore to a separate target first when the incident makes the original copy uncertain." },
    { id: "encryption-key", label: "Recovery secrets", detail: "Encrypted backups also require the keys or secret-recovery path needed to use them." }
  ],
  failureChecks: [
    { id: "backup-usable", label: "1. Backup usable?", detail: "Can the team access the expected backup and identify its data age and integrity?" },
    { id: "restore-works", label: "2. Restore works?", detail: "Can the backup actually recreate usable data?" },
    { id: "application-compatible", label: "3. Application compatible?", detail: "Can the intended application version, schema and configuration use the restored data?" },
    { id: "user-recovery", label: "4. User recovery?", detail: "Can the service perform the required real user action again?" }
  ]
};


const QUEUE_STATE_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "queue-state-v1",
  title: "Where the work is now",
  stages: [
    { id: "producer", label: "Producer", detail: "Accept work when the business operation permits asynchronous processing." },
    { id: "queue", label: "Queue", detail: "Hold work while arrival rate and processing rate differ." },
    { id: "consumer", label: "Consumer", detail: "Workers pull work and perform the operation." },
    { id: "outcome", label: "Outcome", detail: "Record success, retry safely, or move permanently failing work aside." }
  ],
  foundation: {
    label: "Backpressure",
    detail: "When work arrives faster than it can be processed, pressure must appear somewhere; queue depth makes waiting work visible."
  },
  callouts: [
    { id: "retry", label: "Retry", detail: "Failed work may be delivered again; retry is only safe when the operation can tolerate repetition." },
    { id: "idempotency", label: "Idempotency", detail: "Repeated delivery should not create an incorrect final state." },
    { id: "dead-letter", label: "Dead-letter", detail: "Permanently failing work can be isolated for inspection instead of blocking the healthy stream." }
  ],
  failureChecks: [
    { id: "arrival-rate", label: "1. Arrival rate", detail: "Is producers' work arrival rate higher than the service rate?" },
    { id: "queue-depth", label: "2. Queue depth", detail: "Is waiting work growing, shrinking or staying stable?" },
    { id: "consumer-throughput", label: "3. Consumer throughput", detail: "Are workers actually processing work, or is a dependency the new bottleneck?" },
    { id: "duplicate-safety", label: "4. Duplicate safety", detail: "Can the operation remain correct when a message is delivered more than once?" }
  ]
};


const INCIDENT_LOOP_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "incident-loop-v1",
  title: "The incident loop",
  stages: [
    { id: "impact", label: "Impact", detail: "Start with what users or business operations are actually experiencing." },
    { id: "scope", label: "Scope", detail: "Separate affected requests, users, time window and failure domain from the wider system." },
    { id: "evidence", label: "Evidence", detail: "Correlate signals, change history and system state before choosing the next action." },
    { id: "mitigate", label: "Mitigate", detail: "Take the smallest safe action that reduces harm and protects the system." },
    { id: "recover", label: "Recover", detail: "Restore the user path and prove the key signals return to stable behavior." },
    { id: "learn", label: "Learn", detail: "Record the timeline, cause, missed signal, recovery limits and next preventive test." }
  ],
  foundation: {
    label: "Reduce harm before chasing a perfect explanation",
    detail: "During an active incident, mitigation and evidence can progress together; do not make the system worse while searching for certainty."
  },
  callouts: [
    { id: "timeline", label: "Timeline", detail: "Keep user reports, evidence, changes and actions tied to exact times." },
    { id: "change-identity", label: "Change identity", detail: "Know which release, configuration or operational change was active before the failure." },
    { id: "blast-radius", label: "Blast radius", detail: "Prefer actions that limit how many users, workers or dependencies are exposed to the failure." },
    { id: "recovery-proof", label: "Recovery proof", detail: "A command finishing is not recovery; prove the original user-visible behavior and stable system signals." }
  ],
  failureChecks: [
    { id: "user-impact", label: "1. User impact", detail: "What is failing for whom, and what business action is blocked?" },
    { id: "first-signal", label: "2. First useful signal", detail: "Which observation narrows the likely causes without changing the system?" },
    { id: "safe-action", label: "3. Safe action", detail: "What change reduces harm without creating a larger failure or losing evidence?" },
    { id: "stable-recovery", label: "4. Stable recovery", detail: "Did the user path recover and remain healthy after the mitigation?" }
  ]
};


const PROCESS_DIAGNOSIS_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "process-diagnosis-v1",
  title: "From symptom to process evidence",
  stages: [
    { id: "symptom", label: "Symptom", detail: "Start with the user-visible delay without assuming which layer caused it." },
    { id: "process", label: "Process", detail: "Identify the actual running process and its current state." },
    { id: "resource", label: "Resource", detail: "Check CPU, memory, files, sockets and other resource evidence." },
    { id: "dependency", label: "Dependency", detail: "If the process is waiting, inspect the external system or operation it depends on." },
    { id: "proof", label: "Proof", detail: "Choose the observation that separates the leading causes and verify the result after a safe change." }
  ],
  foundation: {
    label: "A process is code running with state and resources",
    detail: "The stored program is not the running process; the operating system manages the process's CPU, memory, files, sockets and state."
  },
  callouts: [
    { id: "ps", label: "ps", detail: "Which processes exist, and what state and resource usage do they show?" },
    { id: "open-endpoints", label: "Open endpoints", detail: "Which files, sockets or network endpoints does the process have open?" },
    { id: "cpu-trap", label: "CPU can mislead", detail: "Low CPU can mean healthy idleness or waiting; high CPU can be normal for the current workload." },
    { id: "state", label: "Process state", detail: "Running, waiting, stopped and exited states change which evidence is useful next." }
  ],
  failureChecks: [
    { id: "scope-symptom", label: "1. Scope the symptom", detail: "Is one process slow, one machine slow, or the whole service affected?" },
    { id: "process-identity", label: "2. Identify the process", detail: "Which process actually owns the behavior you are investigating?" },
    { id: "resource-or-wait", label: "3. Resource or wait?", detail: "Is the process consuming a resource, waiting on one, or blocked on another system?" },
    { id: "evidence-proof", label: "4. Prove the cause", detail: "Choose a measurement that separates the remaining hypotheses before changing the system." }
  ]
};


const LINUX_OPERATING_MODEL_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "linux-operating-model-v1",
  title: "The Linux operating model",
  stages: [
    { id: "application", label: "Application", detail: "User-facing behavior becomes work that the operating system must execute." },
    { id: "process", label: "Process", detail: "The application runs as one or more processes with identity and execution state." },
    { id: "kernel", label: "Kernel", detail: "The kernel mediates process access to CPU time, memory, files, signals and networking." },
    { id: "resources", label: "Resources", detail: "Processes consume, wait on and communicate through concrete system resources." },
    { id: "evidence", label: "Evidence", detail: "Operators inspect process state, descriptors, logs and signals to understand what the machine is doing." }
  ],
  foundation: {
    label: "The kernel mediates access to shared resources",
    detail: "Applications do not directly own the machine's CPU, memory or devices; processes ask the kernel to provide controlled access."
  },
  callouts: [
    { id: "process-state", label: "Process state", detail: "Running, waiting, stopped and exited states change which evidence is useful next." },
    { id: "file-descriptors", label: "File descriptors", detail: "Processes use handles to work with files, sockets, pipes and standard input/output/error." },
    { id: "signals", label: "Signals", detail: "Signals provide a process-control mechanism; the resulting behavior depends on how the process handles them." },
    { id: "observability", label: "Inspection is evidence", detail: "ps, lsof, logs and similar tools expose different parts of the process and execution model." }
  ],
  failureChecks: [
    { id: "process-identity", label: "1. Process identity", detail: "Which process actually owns the behavior you are investigating?" },
    { id: "kernel-resource", label: "2. Kernel resource", detail: "Which CPU, memory, file or network resource is the process using or waiting on?" },
    { id: "execution-context", label: "3. Execution context", detail: "Which user, environment, working directory and parent/supervisor shape the process behavior?" },
    { id: "evidence-sequence", label: "4. Evidence sequence", detail: "Choose observations in an order that narrows the remaining hypotheses instead of collecting everything." }
  ]
};


const TERMINAL_COMPOSITION_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "terminal-composition-v1",
  title: "The terminal as an evidence pipeline",
  stages: [
    { id: "question", label: "Question", detail: "Start from the system claim you need to test, not from a command you happen to remember." },
    { id: "producer", label: "Producer", detail: "Choose the program that can expose the evidence you need." },
    { id: "transform", label: "Transform", detail: "Filter, sort or reshape the output so the relevant evidence is visible." },
    { id: "route", label: "Route", detail: "Use pipes, redirection or files to move output between commands and inspection points." },
    { id: "evidence", label: "Evidence", detail: "Interpret the result and state what it proves and what remains unresolved." }
  ],
  foundation: {
    label: "Small tools become a dataflow system",
    detail: "A shell pipeline composes independent programs by connecting their input and output rather than turning the terminal into one giant command."
  },
  callouts: [
    { id: "pipes", label: "Pipes", detail: "Connect one process's output to another process's input." },
    { id: "redirection", label: "Redirection", detail: "Send standard output or error to a file or another destination." },
    { id: "filtering", label: "Filtering", detail: "Use a focused transform such as grep, awk or sed to expose the evidence you need." },
    { id: "stderr", label: "stderr matters", detail: "A command can appear empty while its useful error evidence is going to standard error." }
  ],
  failureChecks: [
    { id: "right-question", label: "1. Right question", detail: "What system claim are you trying to prove or disprove?" },
    { id: "right-producer", label: "2. Right producer", detail: "Which command exposes the smallest useful evidence for that claim?" },
    { id: "output-routing", label: "3. Output routing", detail: "Did you connect, filter and redirect the streams you actually intended to inspect?" },
    { id: "evidence-meaning", label: "4. Evidence meaning", detail: "What does the output prove, and what alternative explanation remains?" }
  ]
};


const SERVICE_PERMISSION_MODEL_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "service-permission-model-v1",
  title: "The service execution context",
  stages: [
    { id: "process", label: "Process", detail: "A running service is still a process with state, parentage and resources." },
    { id: "identity", label: "Identity", detail: "The process runs under a user/group and an environment that shape what it can do." },
    { id: "resource", label: "Resource", detail: "Files, directories, sockets, credentials and devices are subject to access rules." },
    { id: "service", label: "Service", detail: "A service manager or supervisor can control startup, restart, environment and lifecycle." },
    { id: "logs", label: "Logs", detail: "The service leaves timestamped evidence that helps explain failures and lifecycle transitions." }
  ],
  foundation: {
    label: "The running process has an execution context",
    detail: "The same application code can behave differently when user identity, permissions, environment, working directory or supervision changes."
  },
  callouts: [
    { id: "user-group", label: "User + group", detail: "File and resource access is evaluated in the process's identity context." },
    { id: "permissions", label: "Permissions", detail: "A resource can exist and still be inaccessible to the process that needs it." },
    { id: "environment", label: "Environment", detail: "PATH, variables, working directory and credentials can differ between a shell and a managed service." },
    { id: "lifecycle", label: "Lifecycle", detail: "A service manager can start, stop, restart and supervise a process with its own context." }
  ],
  failureChecks: [
    { id: "process-context", label: "1. Process context", detail: "Under which user, environment and parent/supervisor is the process running?" },
    { id: "resource-access", label: "2. Resource access", detail: "Can that identity actually read, write, execute or bind the resource it needs?" },
    { id: "service-startup", label: "3. Service startup", detail: "Does the managed startup path provide the same context as the development shell?" },
    { id: "log-evidence", label: "4. Log evidence", detail: "What timestamped event proves where the lifecycle or permission failure occurred?" }
  ]
};


const NETWORK_OPERATING_MODEL_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "network-operating-model-v1",
  title: "The network operating model",
  stages: [
    { id: "interface", label: "Interface", detail: "A host participates in a network through one or more physical or virtual interfaces." },
    { id: "link", label: "Link", detail: "Local-link mechanisms move frames between interfaces and resolve local neighbors." },
    { id: "ip", label: "IP", detail: "Network-layer addressing identifies destinations and enables communication across networks." },
    { id: "route", label: "Route", detail: "The host chooses where traffic should go for the destination address." },
    { id: "evidence", label: "Evidence", detail: "Interface state, addresses, neighbor information and routes expose different parts of the path." }
  ],
  foundation: {
    label: "Different layers answer different questions",
    detail: "MAC, IP, route, port and DNS are not interchangeable identifiers; each belongs to a different part of the request path."
  },
  callouts: [
    { id: "mac", label: "MAC address", detail: "A local-link identifier associated with a network interface." },
    { id: "arp", label: "ARP", detail: "On IPv4 local networks, ARP helps map a local IP address to a link-layer address." },
    { id: "gateway", label: "Default gateway", detail: "A route decision can send traffic toward a next hop when the destination is not local." },
    { id: "interface-address", label: "Interface address", detail: "Hosts can have multiple interfaces and addresses; one machine is not always one IP." }
  ],
  failureChecks: [
    { id: "interface-state", label: "1. Interface state", detail: "Is the expected interface present and able to participate in the network?" },
    { id: "local-link", label: "2. Local link", detail: "Can the host resolve and reach the expected local neighbor when local delivery is required?" },
    { id: "ip-addressing", label: "3. IP addressing", detail: "Does the host have the expected address and network context?" },
    { id: "route-selection", label: "4. Route selection", detail: "Does the routing table send traffic toward the intended destination?" }
  ]
};


const CIDR_BOUNDARY_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "cidr-boundary-v1",
  title: "The subnet boundary",
  stages: [
    { id: "address", label: "Address", detail: "Start with the full IPv4 address you need to place in a network." },
    { id: "prefix", label: "Prefix", detail: "CIDR states how many leading bits belong to the network portion." },
    { id: "boundary", label: "Boundary", detail: "The prefix length creates a block boundary that divides network and host space." },
    { id: "range", label: "Range", detail: "From the boundary you can derive the network, broadcast where applicable, and usable host range." },
    { id: "verify", label: "Verify", detail: "Check whether two addresses share a subnet and whether the planned topology fits the available ranges." }
  ],
  foundation: {
    label: "CIDR describes a network boundary",
    detail: "The slash is not decoration: it states how many address bits define the network portion."
  },
  callouts: [
    { id: "network-bits", label: "Network bits", detail: "The prefix length identifies the leading bits used to define the network." },
    { id: "host-bits", label: "Host bits", detail: "The remaining IPv4 bits determine the addresses available within the block." },
    { id: "block-size", label: "Block size", detail: "A prefix produces a predictable block size and boundary pattern that can be reasoned through manually." },
    { id: "segmentation", label: "Segmentation", detail: "Smaller prefixes can divide a larger address space into clearer failure and access boundaries." }
  ],
  failureChecks: [
    { id: "network-boundary", label: "1. Network boundary", detail: "Can you calculate the actual network address for the given prefix?" },
    { id: "usable-range", label: "2. Usable range", detail: "Can you state the address range available for hosts under the chosen addressing rules?" },
    { id: "same-subnet", label: "3. Same subnet", detail: "Do two addresses actually share the same network boundary?" },
    { id: "route-fit", label: "4. Route fit", detail: "Does the subnet design match the routing and segmentation decisions you intend to make?" }
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

  if (block.variant === "observability-diagnosis-v1") {
    return {
      ...OBSERVABILITY_DIAGNOSIS_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "backup-recovery-v1") {
    return {
      ...BACKUP_RECOVERY_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "queue-state-v1") {
    return {
      ...QUEUE_STATE_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "incident-loop-v1") {
    return {
      ...INCIDENT_LOOP_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "process-diagnosis-v1") {
    return {
      ...PROCESS_DIAGNOSIS_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "linux-operating-model-v1") {
    return {
      ...LINUX_OPERATING_MODEL_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "terminal-composition-v1") {
    return {
      ...TERMINAL_COMPOSITION_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "service-permission-model-v1") {
    return {
      ...SERVICE_PERMISSION_MODEL_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "network-operating-model-v1") {
    return {
      ...NETWORK_OPERATING_MODEL_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "cidr-boundary-v1") {
    return {
      ...CIDR_BOUNDARY_VARIANT,
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
    model.variant !== "delivery-pipeline-v1" &&
    model.variant !== "observability-diagnosis-v1" &&
    model.variant !== "backup-recovery-v1" &&
    model.variant !== "queue-state-v1" &&
    model.variant !== "incident-loop-v1" &&
    model.variant !== "process-diagnosis-v1" &&
    model.variant !== "linux-operating-model-v1" &&
    model.variant !== "terminal-composition-v1" &&
    model.variant !== "service-permission-model-v1" &&
    model.variant !== "network-operating-model-v1" &&
    model.variant !== "cidr-boundary-v1"
  ) {
    failures.push("illustration model variant is invalid");
  }
  if (!Array.isArray(model.stages) || model.stages.length < 2) {
    failures.push("illustration model needs at least two stages");
  }

  return { valid: failures.length === 0, failures };
}