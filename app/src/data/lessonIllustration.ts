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
  | "cidr-boundary-v1"
  | "routing-boundary-v1"
  | "transport-contract-v1"
  | "dns-resolution-v1"
  | "http-exchange-v1"
  | "tls-trust-v1"
  | "container-execution-v1"
  | "docker-network-storage-v1"
  | "docker-failure-loop-v1"
  | "kubernetes-reconciliation-v1"
  | "kubernetes-service-path-v1"
  | "kubernetes-config-storage-v1"
  | "kubernetes-health-scaling-v1"
  | "kubernetes-failure-loop-v1"
  | "git-production-workflow-v1";

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


const ROUTING_BOUNDARY_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "routing-boundary-v1",
  title: "The routing decision",
  stages: [
    { id: "destination", label: "Destination", detail: "Start with the packet's destination address and ask which route should match." },
    { id: "route", label: "Route", detail: "The routing table chooses the most specific applicable route." },
    { id: "next-hop", label: "Next hop", detail: "Traffic is sent directly when appropriate or toward the selected next hop, often a gateway." },
    { id: "boundary", label: "Boundary", detail: "A network boundary may transform or translate addressing before the packet continues." },
    { id: "evidence", label: "Evidence", detail: "Route tables, neighbor state, packet captures and return-path behavior expose different parts of the decision." }
  ],
  foundation: {
    label: "Routing chooses where the packet goes next",
    detail: "Routing decides forwarding based on destination and route selection; NAT can change address representation at a boundary but is a different mechanism."
  },
  callouts: [
    { id: "specific-route", label: "Specific route", detail: "A more specific route can match before a broader default route." },
    { id: "default-route", label: "Default route", detail: "The default route is the fallback when no more specific route matches." },
    { id: "gateway", label: "Gateway", detail: "A gateway is a next hop toward another network, not a synonym for routing itself." },
    { id: "nat", label: "NAT", detail: "Network address translation changes address representation at a boundary; it does not replace route selection." }
  ],
  failureChecks: [
    { id: "destination-match", label: "1. Destination match", detail: "Which route actually matches this destination address?" },
    { id: "next-hop", label: "2. Next hop", detail: "Is the selected next hop reachable through the local network context?" },
    { id: "return-path", label: "3. Return path", detail: "Can the response find its way back, or is the problem asymmetric?" },
    { id: "boundary-change", label: "4. Boundary change", detail: "Did NAT or another boundary rule change the addresses or path you expected?" }
  ]
};


const TRANSPORT_CONTRACT_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "transport-contract-v1",
  title: "The transport contract",
  stages: [
    { id: "endpoint", label: "Endpoint", detail: "Start with the host and the service endpoint the application wants to reach." },
    { id: "port", label: "Port", detail: "A transport port identifies the service endpoint on the host." },
    { id: "transport", label: "Transport", detail: "TCP and UDP provide different contracts for how application data is carried." },
    { id: "delivery", label: "Delivery", detail: "TCP adds connection state, ordering, acknowledgement, retransmission, flow control and congestion control; UDP keeps the transport contract simpler." },
    { id: "evidence", label: "Evidence", detail: "Connection refusal, timeout, reset and application response are different observations with different meanings." }
  ],
  foundation: {
    label: "IP reaches the host; transport reaches the service",
    detail: "An IP destination alone is not a complete application endpoint. Transport adds ports and a protocol contract."
  },
  callouts: [
    { id: "tcp", label: "TCP", detail: "Connection-oriented transport with ordered, reliable byte-stream delivery and congestion/flow control." },
    { id: "udp", label: "UDP", detail: "Datagram transport without TCP's connection and retransmission machinery; applications choose their own trade-offs." },
    { id: "socket", label: "Socket", detail: "An operating-system communication endpoint used by an application for transport communication." },
    { id: "failure-signals", label: "Failure signals", detail: "Refusal, timeout, reset and an HTTP/application error are different layers of evidence." }
  ],
  failureChecks: [
    { id: "port-listen", label: "1. Port listening", detail: "Is the expected service endpoint listening on the host?" },
    { id: "transport-choice", label: "2. Transport choice", detail: "Does the application actually use the transport contract the service expects?" },
    { id: "connection-state", label: "3. Connection state", detail: "For TCP, did a connection establish, get refused, reset or simply fail to respond?" },
    { id: "application-response", label: "4. Application response", detail: "After transport succeeds, what did the application protocol return?" }
  ]
};


const DNS_RESOLUTION_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "dns-resolution-v1",
  title: "The DNS answer path",
  stages: [
    { id: "name", label: "Name", detail: "The application starts with a hostname or other DNS name." },
    { id: "resolver", label: "Resolver", detail: "A recursive resolver answers from cache or performs the work needed to find an authoritative answer." },
    { id: "cache", label: "Cache", detail: "A cached answer can be returned while its TTL allows it to remain fresh enough for the resolver's policy." },
    { id: "authority", label: "Authority", detail: "Authoritative DNS servers provide the configured records for the zone." },
    { id: "freshness", label: "Freshness", detail: "TTL, negative caching and resolver choice explain why different clients can see different answers for a while." }
  ],
  foundation: {
    label: "DNS is a distributed naming system",
    detail: "A client usually asks a recursive resolver, which may answer from cache or query authoritative servers; there is no single global DNS server."
  },
  callouts: [
    { id: "recursive-resolver", label: "Recursive resolver", detail: "The resolver answers for clients and may cache or query authoritative servers." },
    { id: "authoritative-server", label: "Authoritative server", detail: "Authoritative servers hold the configured DNS data for a zone." },
    { id: "record-types", label: "Record types", detail: "A, AAAA, CNAME and other record types answer different naming questions." },
    { id: "ttl-cache", label: "TTL + cache", detail: "TTL helps control how long a resolver may retain an answer before refreshing it." }
  ],
  failureChecks: [
    { id: "resolver-used", label: "1. Resolver used", detail: "Which DNS resolver actually answered the client?" },
    { id: "record-type", label: "2. Record type", detail: "Did the query ask for the record type that matches the application question?" },
    { id: "authoritative-data", label: "3. Authoritative data", detail: "What do the authoritative servers say for the zone and name?" },
    { id: "freshness", label: "4. Freshness", detail: "Could cached positive or negative answers explain why clients still see older data?" }
  ]
};


const HTTP_EXCHANGE_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "http-exchange-v1",
  title: "The HTTP exchange",
  stages: [
    { id: "request", label: "Request", detail: "The client sends an HTTP method, target path and request data when needed." },
    { id: "headers", label: "Headers", detail: "Request and response headers carry metadata such as content type, authorization context, caching and redirects." },
    { id: "route", label: "Route", detail: "The HTTP server or application selects the handler for the requested host, method and path." },
    { id: "response", label: "Response", detail: "The server returns an HTTP status, headers and an optional body." },
    { id: "evidence", label: "Evidence", detail: "The status, headers and body tell the client what happened at the application protocol layer." }
  ],
  foundation: {
    label: "HTTP is an application protocol, not the network itself",
    detail: "DNS, IP, transport and TLS provide lower-layer mechanisms; HTTP defines the application request and response exchanged above them."
  },
  callouts: [
    { id: "request-line", label: "Request shape", detail: "Method and target path tell the server what operation the client is requesting." },
    { id: "status-code", label: "Status code", detail: "The status is application-layer evidence; 3xx redirects, 4xx client-side conditions and 5xx server-side conditions are not transport failures." },
    { id: "headers", label: "Headers", detail: "Metadata controls or describes content, authentication context, caching, redirects and other HTTP behavior." },
    { id: "body", label: "Body", detail: "The body carries representation or request data when the HTTP message has one." }
  ],
  failureChecks: [
    { id: "request-shape", label: "1. Request shape", detail: "Is the method, path, host and relevant request data what the application expects?" },
    { id: "route-selection", label: "2. Route selection", detail: "Did the server select the expected application handler for that method and path?" },
    { id: "status-meaning", label: "3. Status meaning", detail: "What does the HTTP status, headers and body prove at the application layer?" },
    { id: "user-proof", label: "4. User proof", detail: "Does the real user action produce the expected application response rather than merely a successful TCP connection?" }
  ]
};


const TLS_TRUST_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "tls-trust-v1",
  title: "The HTTPS trust path",
  stages: [
    { id: "client", label: "Client", detail: "The client wants a protected connection to a specific hostname." },
    { id: "certificate", label: "Certificate", detail: "The server presents a certificate chain that lets the client evaluate endpoint identity against its trust configuration." },
    { id: "handshake", label: "Handshake", detail: "TLS negotiates cryptographic parameters and establishes the session keys used to protect application traffic." },
    { id: "secure-session", label: "Secure session", detail: "HTTP then travels inside the protected TLS session after the handshake succeeds." },
    { id: "evidence", label: "Evidence", detail: "Hostname match, validity dates, trust chain and handshake outcome tell the client what the session actually proves." }
  ],
  foundation: {
    label: "Encryption and authentication are related but not identical",
    detail: "TLS protects the channel and provides mechanisms for authenticating the peer; a valid encrypted session is not the same claim as business trust in the site."
  },
  callouts: [
    { id: "certificate-chain", label: "Certificate chain", detail: "The client validates a chain of certificates against trusted roots and the presented identity." },
    { id: "hostname", label: "Hostname", detail: "The certificate must identify the hostname the client intended to reach." },
    { id: "private-key", label: "Private key", detail: "The server proves control of the private key associated with the certificate during the TLS exchange." },
    { id: "trust", label: "Trust", detail: "The client's trust store and validation rules determine whether the certificate identity is accepted." }
  ],
  failureChecks: [
    { id: "identity-match", label: "1. Identity match", detail: "Does the certificate identify the hostname the client requested?" },
    { id: "certificate-validity", label: "2. Certificate validity", detail: "Are the certificate dates, chain and trust relationships acceptable to the client?" },
    { id: "handshake", label: "3. Handshake", detail: "Can the client and server complete the TLS negotiation and establish a protected session?" },
    { id: "application-proof", label: "4. Application proof", detail: "After TLS succeeds, does the real HTTPS application request behave as expected?" }
  ]
};


const CONTAINER_EXECUTION_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "container-execution-v1",
  title: "The container execution model",
  stages: [
    { id: "image", label: "Image", detail: "An image packages a filesystem and metadata that can be used to create a container." },
    { id: "container", label: "Container", detail: "A container is a running instance with an isolated process environment built from the image." },
    { id: "process", label: "Process", detail: "The container's lifecycle follows its main process; when that process exits, the container normally stops." },
    { id: "namespaces", label: "Namespaces", detail: "Linux namespaces isolate views such as processes, networking and mounts without creating a separate kernel." },
    { id: "host-kernel", label: "Host Kernel", detail: "Containers share the host kernel rather than booting a separate guest kernel." }
  ],
  foundation: {
    label: "A container is an isolated process environment, not a virtual machine",
    detail: "Images package files and metadata; containers run processes using the host kernel with OS-level isolation."
  },
  callouts: [
    { id: "image", label: "Image", detail: "A reusable package of filesystem layers and metadata used to create containers." },
    { id: "lifecycle", label: "Process lifecycle", detail: "The main process defines the normal container lifetime; an immediate exit can make a healthy runtime look like a failed container." },
    { id: "namespaces", label: "Namespaces", detail: "Namespaces give processes isolated views without providing a second kernel." },
    { id: "kernel", label: "Shared kernel", detail: "The container uses the host kernel, which is a key difference from a traditional virtual machine." }
  ],
  failureChecks: [
    { id: "process-command", label: "1. Main process", detail: "What command started in the container, and why did that process stay alive or exit?" },
    { id: "filesystem", label: "2. Filesystem", detail: "Does the running container contain the files and configuration the process expects?" },
    { id: "namespace-view", label: "3. Namespace view", detail: "Which process, network or mount view is isolated, and what evidence does that produce?" },
    { id: "kernel-assumption", label: "4. Kernel assumption", detail: "Are you treating the container like a virtual machine when the behavior actually depends on a shared host kernel?" }
  ]
};


const DOCKER_NETWORK_STORAGE_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "docker-network-storage-v1",
  title: "The Docker service boundary",
  stages: [
    { id: "service", label: "Service", detail: "A containerized service runs as a process with its own runtime context." },
    { id: "network", label: "Network", detail: "Docker networks provide an internal communication boundary between connected containers." },
    { id: "name", label: "Name", detail: "Service-to-service communication can use Docker-provided service discovery rather than hard-coded container IP addresses." },
    { id: "port", label: "Port", detail: "A published host port is a separate access path from internal container-to-container communication." },
    { id: "volume", label: "Volume", detail: "A volume gives application data a lifecycle separate from one container instance." }
  ],
  foundation: {
    label: "Service discovery, published ports and persistent data are different boundaries",
    detail: "An internal container name, a published host port and a persistent volume solve different problems and should be diagnosed separately."
  },
  callouts: [
    { id: "internal-network", label: "Internal network", detail: "Containers on the same Docker network can communicate through the network mechanisms Docker provides." },
    { id: "service-name", label: "Service name", detail: "Use a stable service identity for internal discovery instead of treating container IPs as permanent configuration." },
    { id: "published-port", label: "Published port", detail: "Publishing a port exposes a container service through a host-side port; it is not the same path as internal service-to-service traffic." },
    { id: "volume", label: "Volume", detail: "Persistent data should live outside the disposable container lifecycle when it must survive recreation." }
  ],
  failureChecks: [
    { id: "name-resolution", label: "1. Name resolution", detail: "Does the application resolve the expected service name on the intended Docker network?" },
    { id: "internal-connectivity", label: "2. Internal connectivity", detail: "Can the client container reach the database or API on the internal service port?" },
    { id: "published-access", label: "3. Published access", detail: "Is the host-side port published and mapped correctly for the external access path being tested?" },
    { id: "data-persistence", label: "4. Data persistence", detail: "Does the database keep its data when the container is removed and recreated?" }
  ]
};


const DOCKER_FAILURE_LOOP_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "docker-failure-loop-v1",
  title: "The controlled Docker failure loop",
  stages: [
    { id: "baseline", label: "Baseline", detail: "Start from a known-good Docker stack and record the evidence that proves it works." },
    { id: "change", label: "Change", detail: "Change exactly one variable or boundary so the experiment has a clear cause." },
    { id: "symptom", label: "Symptom", detail: "Predict the visible failure before observing it." },
    { id: "evidence", label: "Evidence", detail: "Inspect the process, logs, network, configuration or storage state that can distinguish the leading hypotheses." },
    { id: "recovery", label: "Recovery", detail: "Restore the known-good state and prove that the original behavior returns." }
  ],
  foundation: {
    label: "Change one boundary, predict one symptom, collect evidence, then recover",
    detail: "A controlled failure is an experiment: one change, one prediction, one observation, and one recovery proof."
  },
  callouts: [
    { id: "single-change", label: "One change", detail: "Do not change several variables at once; otherwise the symptom cannot be tied to one cause." },
    { id: "prediction", label: "Prediction", detail: "State what you expect to see before running the failing experiment." },
    { id: "evidence", label: "Evidence", detail: "Use logs, process state, network state, configuration and storage state to separate hypotheses." },
    { id: "recovery-proof", label: "Recovery proof", detail: "Restoring the setting is not enough; verify that the known-good user path works again." }
  ],
  failureChecks: [
    { id: "process", label: "1. Process", detail: "Is the main container process running, restarting or exiting?" },
    { id: "network", label: "2. Network", detail: "Can the expected service name, internal port and published path still reach the right process?" },
    { id: "configuration", label: "3. Configuration", detail: "Did one environment variable, command or mounted file change the behavior?" },
    { id: "storage", label: "4. Storage", detail: "Does the expected volume exist, contain the right data and attach to the new container?" }
  ]
};


const KUBERNETES_SERVICE_PATH_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "kubernetes-service-path-v1",
  title: "The Kubernetes Service path",
  stages: [
    { id: "service", label: "Service", detail: "A Service gives clients a stable logical destination while the Pods behind it can change." },
    { id: "selector", label: "Selector", detail: "Label selectors define which Pods belong to the Service's backend set." },
    { id: "endpoints", label: "Endpoints", detail: "The endpoint set represents the current backend addresses available to receive traffic." },
    { id: "pod", label: "Pod", detail: "Pods are replaceable workload instances whose lifecycle can change without changing the Service identity." },
    { id: "path", label: "Path", detail: "Client traffic follows the Service abstraction to an available backend rather than targeting a Pod IP directly." }
  ],
  foundation: {
    label: "A Service gives clients stable discovery while Pods can change",
    detail: "The Service identity stays stable while selectors and endpoint state adapt to the current Pod set."
  },
  callouts: [
    { id: "stable-name", label: "Stable name", detail: "Clients use the Service identity instead of tracking individual Pod IP addresses." },
    { id: "selector", label: "Selector", detail: "Labels determine which Pods are included in the Service backend set." },
    { id: "endpoint-set", label: "Endpoint set", detail: "The current endpoint set shows which backends are actually available to receive traffic." },
    { id: "pod-lifecycle", label: "Pod lifecycle", detail: "A Pod can die and be replaced while the Service abstraction remains unchanged." }
  ],
  failureChecks: [
    { id: "selector-match", label: "1. Selector match", detail: "Do the Service selector labels actually match the intended Pods?" },
    { id: "endpoint-health", label: "2. Endpoint health", detail: "Does the current endpoint set contain the backends that should receive traffic?" },
    { id: "service-path", label: "3. Service path", detail: "Does a client request use the expected Service name and port?" },
    { id: "pod-replacement", label: "4. Pod replacement", detail: "When a Pod dies, does the replacement become a usable endpoint?" }
  ]
};


const KUBERNETES_CONFIG_STORAGE_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "kubernetes-config-storage-v1",
  title: "The Kubernetes configuration and storage path",
  stages: [
    { id: "config", label: "Config", detail: "Non-secret configuration can be supplied independently of the application image." },
    { id: "secret", label: "Secret", detail: "Sensitive values use a separate Kubernetes object and security boundary." },
    { id: "mount", label: "Mount", detail: "Environment variables or mounted files expose configuration and secrets to the application." },
    { id: "pod", label: "Pod", detail: "The application consumes those values inside a replaceable Pod instance." },
    { id: "persistence", label: "Persistence", detail: "Important data lives in storage whose lifecycle is designed to outlive one Pod." }
  ],
  foundation: {
    label: "Configuration, secrets and persistent data have different lifecycles",
    detail: "A ConfigMap can change without changing the image; a Secret has sensitive-handling requirements; persistent storage has a lifecycle beyond one Pod instance."
  },
  callouts: [
    { id: "configmap", label: "ConfigMap", detail: "A common Kubernetes mechanism for non-secret configuration." },
    { id: "secret", label: "Secret", detail: "A Kubernetes mechanism for sensitive values; the object alone does not make the whole handling process secure." },
    { id: "consumption", label: "Consumption path", detail: "The application still needs the expected key, environment variable or file path to read the value." },
    { id: "persistent-volume", label: "Persistent storage", detail: "A PersistentVolume/PersistentVolumeClaim model can separate important data from the Pod lifecycle, subject to storage-class and environment guarantees." }
  ],
  failureChecks: [
    { id: "config-source", label: "1. Config source", detail: "Which object or environment source provides the value, and is it the value the application expects?" },
    { id: "secret-reference", label: "2. Secret reference", detail: "Is the Pod correctly referencing the expected Secret key without exposing its value in logs?" },
    { id: "mount-consumption", label: "3. Mount consumption", detail: "Can the process actually read the configured environment variable or mounted file path?" },
    { id: "storage-lifecycle", label: "4. Storage lifecycle", detail: "Does the important data live in storage that survives Pod replacement and remains usable by the new instance?" }
  ]
};


const KUBERNETES_HEALTH_SCALING_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "kubernetes-health-scaling-v1",
  title: "The Kubernetes health and scaling path",
  stages: [
    { id: "startup", label: "Startup", detail: "A workload initializes its process and dependencies before it can be considered ready." },
    { id: "readiness", label: "Readiness", detail: "Readiness decides whether the workload should be included in the ready traffic path." },
    { id: "liveness", label: "Liveness", detail: "Liveness helps detect a running process that is no longer healthy enough to keep without restart." },
    { id: "capacity", label: "Capacity", detail: "Resource requests, limits and replica count shape scheduling and available capacity." },
    { id: "rollout", label: "Rollout", detail: "A version change replaces old replicas with new ones while health and capacity signals continue to matter." }
  ],
  foundation: {
    label: "Running, ready and scalable are different states",
    detail: "A process can be alive without being ready for traffic, and a ready workload can still lack enough capacity for current demand."
  },
  callouts: [
    { id: "startup-probe", label: "Startup", detail: "Startup behavior gives a workload time to initialize before other health decisions should dominate." },
    { id: "readiness-probe", label: "Readiness", detail: "Readiness removes a workload from normal traffic when it should stay alive but is not ready to serve." },
    { id: "liveness-probe", label: "Liveness", detail: "Liveness addresses whether a running workload should be restarted when it becomes stuck or unhealthy." },
    { id: "resources", label: "Requests + limits", detail: "Resource requests and limits affect scheduling and protection; they are part of the capacity design, not decoration." }
  ],
  failureChecks: [
    { id: "startup-state", label: "1. Startup state", detail: "Is the workload still initializing, or is startup genuinely failing?" },
    { id: "traffic-state", label: "2. Traffic state", detail: "Is the workload ready to receive traffic, and what evidence controls that decision?" },
    { id: "restart-state", label: "3. Restart state", detail: "Is the process alive but wedged, causing liveness failures or repeated restarts?" },
    { id: "capacity-state", label: "4. Capacity state", detail: "Do resource requests, limits and replica count provide enough healthy capacity for the workload?" }
  ]
};


const KUBERNETES_FAILURE_LOOP_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "kubernetes-failure-loop-v1",
  title: "The Kubernetes failure loop",
  stages: [
    { id: "baseline", label: "Baseline", detail: "Prove the workload and real user path are healthy before introducing a fault." },
    { id: "fault", label: "Fault", detail: "Change one controlled boundary so the resulting evidence remains interpretable." },
    { id: "symptom", label: "Symptom", detail: "Record the exact Kubernetes state or user-visible behavior produced by the fault." },
    { id: "evidence", label: "Evidence", detail: "Inspect the smallest useful sequence: description, events, logs, termination state and relevant dependencies." },
    { id: "recovery", label: "Recovery", detail: "Repair one boundary and prove the original user path and stable workload state return." }
  ],
  foundation: {
    label: "One controlled change keeps the evidence interpretable",
    detail: "Failure drills are useful only when the baseline is known, the changed boundary is isolated and recovery is proven against the original behavior."
  },
  callouts: [
    { id: "crash-loop", label: "CrashLoopBackOff", detail: "Repeated container restarts with increasing backoff; the status identifies behavior, not root cause." },
    { id: "image-pull", label: "ImagePullBackOff", detail: "The workload cannot successfully obtain or prepare the referenced image; inspect image reference, registry access, credentials and events." },
    { id: "oom", label: "OOMKilled", detail: "The process was killed under memory pressure; inspect requests, limits, actual usage and application memory behavior." },
    { id: "readiness", label: "Readiness failure", detail: "The workload is excluded from normal traffic; it does not by itself mean the process should restart." }
  ],
  failureChecks: [
    { id: "baseline-proof", label: "1. Baseline proof", detail: "Can you prove the known-good workload and real user path before the fault?" },
    { id: "fault-boundary", label: "2. Fault boundary", detail: "What single configuration, selector, image, probe or resource boundary changed?" },
    { id: "evidence-sequence", label: "3. Evidence sequence", detail: "Which status, events, logs and workload evidence best separates the likely causes?" },
    { id: "recovery-proof", label: "4. Recovery proof", detail: "After one repair, does the original workload state and user path return and remain stable?" }
  ]
};


const GIT_PRODUCTION_WORKFLOW_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "git-production-workflow-v1",
  title: "The Git production workflow",
  stages: [
    { id: "change", label: "Change", detail: "Isolate one intentional source change from a known starting point." },
    { id: "review", label: "Review", detail: "Inspect the diff and supporting evidence before treating the change as releasable." },
    { id: "commit", label: "Commit", detail: "Give the reviewed source state a durable identity with a known parent." },
    { id: "release", label: "Release", detail: "Attach a stable release identity to the artifact or deployment that is intended to run." },
    { id: "recovery", label: "Recovery", detail: "Use the source and release identity to return to a known-good operational state." }
  ],
  foundation: {
    label: "Source identity is part of production evidence",
    detail: "A running release should be traceable to an exact source state; repository recency alone does not identify what production is running."
  },
  callouts: [
    { id: "branch", label: "Branch", detail: "An explicit change boundary makes the starting state and intended diff visible." },
    { id: "diff", label: "Diff", detail: "The diff is the review surface; unexpected extra changes should stop the release path until understood." },
    { id: "commit-id", label: "Commit ID", detail: "The commit ID gives a durable source identity and parent relationship." },
    { id: "release-id", label: "Release ID", detail: "A tag, immutable artifact reference or deployment version identifies the thing intended or running in production." }
  ],
  failureChecks: [
    { id: "change-scope", label: "1. Change scope", detail: "Is the change isolated from unrelated local or branch state?" },
    { id: "review-scope", label: "2. Review scope", detail: "Does the diff match the intended change and its evidence?" },
    { id: "release-identity", label: "3. Release identity", detail: "Can the running release be traced to the exact reviewed source state?" },
    { id: "recovery-path", label: "4. Recovery path", detail: "Can the source and deployment system return to a known-good operational state without hiding history?" }
  ]
};


const KUBERNETES_RECONCILIATION_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "kubernetes-reconciliation-v1",
  title: "The Kubernetes control loop",
  stages: [
    { id: "desired", label: "Desired State", detail: "A declared workload says what should exist and how it should behave." },
    { id: "controller", label: "Controller", detail: "Controllers watch observed state and take actions to move the cluster toward the desired state." },
    { id: "scheduler", label: "Scheduler", detail: "The scheduler chooses a suitable node for pods that need placement." },
    { id: "pod", label: "Pod", detail: "A pod is the unit Kubernetes schedules; its containers share the pod's execution context." },
    { id: "node", label: "Node", detail: "A node runs the pod through a container runtime while reporting observed state back to the control plane." }
  ],
  foundation: {
    label: "Kubernetes continuously reconciles desired state with observed state",
    detail: "Kubernetes is not a one-time deployment command; controllers repeatedly observe state and act to move the system toward the declared goal."
  },
  callouts: [
    { id: "api", label: "API server", detail: "The API server is the control-plane entry point through which Kubernetes objects are stored and observed." },
    { id: "controller", label: "Controller", detail: "A controller watches relevant objects and performs reconciliation actions when actual state differs from desired state." },
    { id: "scheduler", label: "Scheduler", detail: "The scheduler selects a node for an unscheduled pod based on current cluster constraints and policy." },
    { id: "pod-node", label: "Pod on node", detail: "A pod is scheduled onto a node; the node then runs its containers and reports status." }
  ],
  failureChecks: [
    { id: "desired-state", label: "1. Desired state", detail: "What object and specification say the workload should exist, and with what parameters?" },
    { id: "reconciliation", label: "2. Reconciliation", detail: "Which controller should notice and act when observed state differs from the specification?" },
    { id: "placement", label: "3. Placement", detail: "Why is the pod pending, and what scheduling constraint or resource condition prevents placement?" },
    { id: "observed-state", label: "4. Observed state", detail: "What do pod, node and controller status show about what the cluster actually did?" }
  ]
};


const CLOUD_PRIMITIVES_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "cloud-primitives-v1",
  title: "The cloud primitive map",
  stages: [
    { id: "workload", label: "Workload", detail: "Start with the user-facing capability you need to operate." },
    { id: "compute", label: "Compute", detail: "Choose the execution capacity that runs the workload and identify its scaling and lifecycle behavior." },
    { id: "network", label: "Network", detail: "Define which users, services and dependencies can reach each other and through which paths." },
    { id: "state", label: "State", detail: "Place durable data on a lifecycle that can outlive disposable compute." },
    { id: "identity", label: "Identity", detail: "Define which human or service identities can access each resource and with what permissions." },
    { id: "data-services", label: "Data Services", detail: "Choose databases, queues and caches according to the workload's state, work-distribution and latency needs." }
  ],
  foundation: {
    label: "Cloud products implement general engineering primitives",
    detail: "Provider product names change, but workloads still need compute, network paths, state, identity and appropriate data services."
  },
  callouts: [
    { id: "dependency-graph", label: "Dependency graph", detail: "Scaling one box does not remove a bottleneck elsewhere in the workload's dependency graph." },
    { id: "ownership", label: "Ownership boundary", detail: "Managed services move some operational work to the provider, but architectural decisions and recovery responsibilities still exist." },
    { id: "identity", label: "Identity graph", detail: "Access depends on the identity making the request and the policy protecting the target resource." },
    { id: "cost", label: "Cost boundary", detail: "Compute, storage, requests and data transfer each create different cost behavior that should be understood as part of the architecture." }
  ],
  failureChecks: [
    { id: "compute-capacity", label: "1. Compute capacity", detail: "Is execution capacity sufficient for the workload, or has another dependency become the bottleneck?" },
    { id: "network-path", label: "2. Network path", detail: "Can the workload reach each dependency through the intended path?" },
    { id: "state-lifecycle", label: "3. State lifecycle", detail: "Will important state survive replacement or scaling of disposable compute?" },
    { id: "access-boundary", label: "4. Access boundary", detail: "Can the current identity perform the required action on the target resource?" }
  ]
};


const DATABASE_SCALING_VARIANT: LessonIllustrationModelV1 = {
  version: 1,
  variant: "database-scaling-v1",
  title: "The database scaling trade-off map",
  stages: [
    { id: "workload", label: "Workload", detail: "Start from the user operation and its correctness and latency requirements." },
    { id: "query", label: "Query", detail: "Inspect access patterns before choosing a scaling mechanism." },
    { id: "index", label: "Index", detail: "Use indexes to reduce work for supported access patterns, while accepting write and storage costs." },
    { id: "copies", label: "Copies", detail: "Replication adds read capacity or availability options but introduces lag and consistency choices." },
    { id: "partitions", label: "Partitions", detail: "Partitioning and sharding distribute data, but make placement and cross-partition operations more complex." },
    { id: "evidence", label: "Evidence", detail: "Measure latency, query plans, replica lag, partition balance and correctness behavior before and after the change." }
  ],
  foundation: {
    label: "Database scaling changes capacity and correctness boundaries together",
    detail: "Scaling mechanisms solve different bottlenecks. Each one changes the operational and correctness model as well as capacity."
  },
  callouts: [
    { id: "transactions", label: "Transactions + MVCC", detail: "Transactions preserve business invariants while MVCC allows readers and writers to coordinate without every read blocking every write." },
    { id: "index", label: "Index", detail: "An index can make a selective read far cheaper, but it consumes storage and can add write maintenance cost." },
    { id: "replication", label: "Replication", detail: "A replica can be healthy while still being behind the primary, creating a consistency choice for reads." },
    { id: "partition-key", label: "Partition key", detail: "A good partition key spreads load and keeps common access paths local; a bad key can create a hot partition or expensive cross-partition work." }
  ],
  failureChecks: [
    { id: "query-shape", label: "1. Query shape", detail: "What rows does the application actually ask for, and does the current plan scale with the data size?" },
    { id: "stale-read", label: "2. Stale read", detail: "Can a replica answer the request with older data than the application's consistency requirement allows?" },
    { id: "hot-partition", label: "3. Hot partition", detail: "Is one partition receiving a disproportionate share of traffic or data?" },
    { id: "cross-partition", label: "4. Cross-partition work", detail: "Does the access pattern require coordination across multiple partitions that defeats the intended scaling benefit?" }
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

  if (block.variant === "routing-boundary-v1") {
    return {
      ...ROUTING_BOUNDARY_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "transport-contract-v1") {
    return {
      ...TRANSPORT_CONTRACT_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "dns-resolution-v1") {
    return {
      ...DNS_RESOLUTION_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "http-exchange-v1") {
    return {
      ...HTTP_EXCHANGE_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "tls-trust-v1") {
    return {
      ...TLS_TRUST_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "container-execution-v1") {
    return {
      ...CONTAINER_EXECUTION_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "docker-network-storage-v1") {
    return {
      ...DOCKER_NETWORK_STORAGE_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "docker-failure-loop-v1") {
    return {
      ...DOCKER_FAILURE_LOOP_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "kubernetes-reconciliation-v1") {
    return {
      ...KUBERNETES_RECONCILIATION_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "kubernetes-service-path-v1") {
    return {
      ...KUBERNETES_SERVICE_PATH_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "kubernetes-config-storage-v1") {
    return {
      ...KUBERNETES_CONFIG_STORAGE_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "kubernetes-health-scaling-v1") {
    return {
      ...KUBERNETES_HEALTH_SCALING_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "kubernetes-failure-loop-v1") {
    return {
      ...KUBERNETES_FAILURE_LOOP_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "git-production-workflow-v1") {
    return {
      ...GIT_PRODUCTION_WORKFLOW_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "cloud-primitives-v1") {
    return {
      ...CLOUD_PRIMITIVES_VARIANT,
      title: block.heading
    };
  }

  if (block.variant === "database-scaling-v1") {
    return {
      ...DATABASE_SCALING_VARIANT,
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
    model.variant !== "cidr-boundary-v1" &&
    model.variant !== "routing-boundary-v1" &&
    model.variant !== "transport-contract-v1" &&
    model.variant !== "dns-resolution-v1" &&
    model.variant !== "http-exchange-v1" &&
    model.variant !== "tls-trust-v1" &&
    model.variant !== "container-execution-v1" &&
    model.variant !== "docker-network-storage-v1" &&
    model.variant !== "kubernetes-reconciliation-v1" &&
    model.variant !== "docker-failure-loop-v1" &&
    model.variant !== "cloud-primitives-v1" &&
    model.variant !== "database-scaling-v1" &&
    model.variant !== "kubernetes-service-path-v1" &&
    model.variant !== "kubernetes-config-storage-v1" &&
    model.variant !== "kubernetes-health-scaling-v1" &&
    model.variant !== "kubernetes-failure-loop-v1" &&
    model.variant !== "git-production-workflow-v1"
  ) {
    failures.push("illustration model variant is invalid");
  }
  if (!Array.isArray(model.stages) || model.stages.length < 2) {
    failures.push("illustration model needs at least two stages");
  }

  return { valid: failures.length === 0, failures };
}