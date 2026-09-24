import type { CourseLevel } from "./programme";

export type DiagnosticRecommendation =
  | "remediate"
  | "condense-theory"
  | "skip-theory";

export type DiagnosticQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOption: number;
};

export type DiagnosticDefinition = {
  sectionId: string;
  course: CourseLevel;
  title: string;
  prerequisiteLessonIds: string[];
  remediationLessonIds: string[];
  questions: DiagnosticQuestion[];
};

export const diagnosticDefinitions: DiagnosticDefinition[] = [
  {
    sectionId: "B-F1",
    course: "beginner",
    title: "Linux and Process Foundations",
    prerequisiteLessonIds: [],
    remediationLessonIds: ["B1.1"],
    questions: [
      {
        id: "BF1-P-1",
        prompt: "A process exists, but requests are slow. What does the process list prove?",
        options: [
          "That the process exists at that moment",
          "That the process is healthy",
          "That the network is healthy",
          "That its dependencies are healthy"
        ],
        correctOption: 0
      },
      {
        id: "BF1-P-2",
        prompt: "CPU is low and the service is slow. Which explanation remains plausible?",
        options: [
          "The service may be waiting on I/O or a dependency",
          "Low CPU proves there is no problem",
          "The kernel cannot schedule the process",
          "The service cannot use memory"
        ],
        correctOption: 0
      },
      {
        id: "BF1-P-3",
        prompt: "What is the safest first move when someone says 'the application is slow'?",
        options: [
          "Restart it immediately",
          "Collect evidence about scope and the slow component",
          "Increase the CPU limit",
          "Delete the logs"
        ],
        correctOption: 1
      },
      {
        id: "BF1-P-4",
        prompt: "Which evidence is most directly useful for seeing a process's open network sockets?",
        options: [
          "Git history",
          "Socket/process inspection",
          "A browser screenshot",
          "A DNS zone file"
        ],
        correctOption: 1
      }
    ]
  },
  {
    sectionId: "B-A1",
    course: "beginner",
    title: "Service Communication",
    prerequisiteLessonIds: ["B1.2"],
    remediationLessonIds: ["B1.2", "B1.3"],
    questions: [
      {
        id: "BA1-P-1",
        prompt: "DNS and TCP both succeed, but the TLS handshake fails. Which area should you inspect next?",
        options: [
          "TLS configuration or certificate behavior",
          "Subnet size",
          "Process IDs",
          "Git history"
        ],
        correctOption: 0
      },
      {
        id: "BA1-P-2",
        prompt: "An HTTPS endpoint returns HTTP 500. What does that prove?",
        options: [
          "An application-level endpoint handled the request and reported an error",
          "The database is definitely broken",
          "DNS failed",
          "The network cable is unplugged"
        ],
        correctOption: 0
      },
      {
        id: "BA1-P-3",
        prompt: "A health endpoint is 200, but a real user operation is 503. What is the useful inference?",
        options: [
          "The real operation exercises more state or dependencies than the health check",
          "The network is definitely down",
          "The health endpoint proves the whole application is healthy",
          "The DNS record must be stale"
        ],
        correctOption: 0
      },
      {
        id: "BA1-P-4",
        prompt: "Why should you avoid restarting first when an API returns intermittent 500 errors?",
        options: [
          "It can remove evidence before the failing mechanism is understood",
          "Restarting can never restore service",
          "HTTP 500 means TCP is disabled",
          "A restart changes the DNS record"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "B-F2",
    course: "beginner",
    title: "Networking Foundations",
    prerequisiteLessonIds: ["B1.1"],
    remediationLessonIds: ["B1.1", "B1.2"],
    questions: [
      {
        id: "BF2-P-1",
        prompt: "What does DNS normally give the client?",
        options: [
          "A name-to-address answer",
          "A CPU allocation",
          "An HTTP response body",
          "A TLS session"
        ],
        correctOption: 0
      },
      {
        id: "BF2-P-2",
        prompt: "What does a port identify in a network request?",
        options: [
          "The country of the server",
          "The service endpoint on the host",
          "The user's browser",
          "The DNS resolver"
        ],
        correctOption: 1
      },
      {
        id: "BF2-P-3",
        prompt: "DNS works, but the TCP connection times out. What does that tell you?",
        options: [
          "Name resolution worked, but a later network step is failing",
          "HTTP authentication failed",
          "The application is definitely healthy",
          "DNS must be broken"
        ],
        correctOption: 0
      },
      {
        id: "BF2-P-4",
        prompt: "Why is a network test best run from the location where the failure happens?",
        options: [
          "Every machine has the same network state",
          "Routes, DNS, policies and paths can differ by source",
          "The client machine changes the server's IP address",
          "It makes TCP faster"
        ],
        correctOption: 1
      }
    ]
  },
  {
    sectionId: "I-F1",
    course: "intermediate",
    title: "Linux and Operating Systems",
    prerequisiteLessonIds: [],
    remediationLessonIds: ["D1.1", "D1.3"],
    questions: [
      {
        id: "IF1-P-1",
        prompt: "A process is alive but not progressing. Which explanation remains plausible?",
        options: [
          "It may be waiting on I/O, a lock, or a dependency",
          "An alive process must be using CPU continuously",
          "The kernel cannot schedule any process",
          "The filesystem is definitely corrupt"
        ],
        correctOption: 0
      },
      {
        id: "IF1-P-2",
        prompt: "Why can low CPU still coexist with high request latency?",
        options: [
          "The service may spend time waiting on another resource",
          "Low CPU proves all dependencies are healthy",
          "CPU is unrelated to process scheduling",
          "Latency can only come from memory"
        ],
        correctOption: 0
      },
      {
        id: "IF1-P-3",
        prompt: "What evidence best separates a process problem from a downstream dependency problem?",
        options: [
          "Process state plus dependency/request timing",
          "A Git branch name",
          "A desktop screenshot",
          "The hostname alone"
        ],
        correctOption: 0
      },
      {
        id: "IF1-P-4",
        prompt: "Why inspect file descriptors and sockets during a service incident?",
        options: [
          "They show resources the process is actually using",
          "They replace application logs",
          "They prove the database is healthy",
          "They assign more CPU"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "I-F2",
    course: "intermediate",
    title: "Networking and Protocols",
    prerequisiteLessonIds: ["D1.4", "D1.5"],
    remediationLessonIds: ["D1.4", "D1.5", "D1.6", "D2.1", "D2.2"],
    questions: [
      {
        id: "IF2-P-1",
        prompt: "A request times out. What should you establish before blaming HTTP?",
        options: [
          "Whether the required connection path was established",
          "Whether the code has a unit test",
          "Whether the browser is open",
          "Whether Git has a new commit"
        ],
        correctOption: 0
      },
      {
        id: "IF2-P-2",
        prompt: "Why can the same hostname behave differently from two source hosts?",
        options: [
          "DNS, routing, policy, proxy or destination selection can differ by source",
          "HTTP always changes the hostname",
          "TCP uses a different port for every host",
          "CIDR only applies to browsers"
        ],
        correctOption: 0
      },
      {
        id: "IF2-P-3",
        prompt: "TCP connects but TLS fails. What layer should you investigate next?",
        options: [
          "TLS negotiation and certificate/hostname behavior",
          "Ethernet cabling only",
          "CPU scheduling only",
          "Git permissions"
        ],
        correctOption: 0
      },
      {
        id: "IF2-P-4",
        prompt: "Why are timeout, refusal and reset useful different clues?",
        options: [
          "They can indicate different failure points or endpoint behavior",
          "They are three names for the same event",
          "They only describe HTTP status codes",
          "They prove DNS worked"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "B-A2",
    course: "beginner",
    title: "Containers and Repeatable Environments",
    prerequisiteLessonIds: ["B1.4"],
    remediationLessonIds: ["B1.4", "B1.5"],
    questions: [
      {
        id: "BA2-P-1",
        prompt: "What problem does an image solve in a container workflow?",
        options: [
          "It captures a repeatable application environment",
          "It guarantees the application is bug-free",
          "It replaces the network",
          "It stores every future database change"
        ],
        correctOption: 0
      },
      {
        id: "BA2-P-2",
        prompt: "A container starts but cannot reach its dependency. What should you inspect first?",
        options: [
          "The container network and dependency endpoint path",
          "The Git commit count",
          "The monitor brightness",
          "The image name only"
        ],
        correctOption: 0
      },
      {
        id: "BA2-P-3",
        prompt: "Why is container state different from the image?",
        options: [
          "The image is a reusable package while a running container has runtime state",
          "The image is always a live process",
          "A container cannot read files",
          "The image is the network interface"
        ],
        correctOption: 0
      },
      {
        id: "BA2-P-4",
        prompt: "Why should broken configuration be restored to a known-good value during the exercise?",
        options: [
          "So recovery can be verified against a defined baseline",
          "Because containers cannot fail twice",
          "So logs are deleted",
          "Because the image changes automatically"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "B-A3",
    course: "beginner",
    title: "CI/CD and Reproducible Delivery",
    prerequisiteLessonIds: ["B2.1"],
    remediationLessonIds: ["B2.1"],
    questions: [
      {
        id: "BA3-P-1",
        prompt: "Why keep a release identity from commit to deployment?",
        options: [
          "To know exactly what artifact was tested and deployed",
          "To make every deployment identical to the previous one",
          "To avoid recording failures",
          "To replace version control"
        ],
        correctOption: 0
      },
      {
        id: "BA3-P-2",
        prompt: "What should CI prove before a deployment is promoted?",
        options: [
          "That the selected change passes the defined checks and produces the expected artifact",
          "That production can never fail",
          "That every developer used the same laptop",
          "That DNS will never change"
        ],
        correctOption: 0
      },
      {
        id: "BA3-P-3",
        prompt: "Why write the rollback path before deployment?",
        options: [
          "The recovery decision is clearer before pressure rises",
          "Rollback is only needed after a successful release",
          "Rollback deletes the release identity",
          "It guarantees zero downtime"
        ],
        correctOption: 0
      },
      {
        id: "BA3-P-4",
        prompt: "Which observation most directly proves a deployment reached the intended version?",
        options: [
          "Runtime evidence that identifies the deployed release",
          "A screenshot of the code editor",
          "The size of the Git repository",
          "A DNS TTL value"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "B-A4",
    course: "beginner",
    title: "Observability and Recovery",
    prerequisiteLessonIds: ["B2.2", "B2.3"],
    remediationLessonIds: ["B2.2", "B2.3"],
    questions: [
      {
        id: "BA4-P-1",
        prompt: "A service is slow while CPU is low. What remains plausible?",
        options: [
          "I/O, dependency latency, locks or network delay",
          "Nothing; low CPU proves the service is healthy",
          "DNS cannot exist when CPU is low",
          "The process must be stopped"
        ],
        correctOption: 0
      },
      {
        id: "BA4-P-2",
        prompt: "Why should you collect evidence before restarting during an incident?",
        options: [
          "A restart can change or remove useful transient evidence",
          "A restart always makes the issue worse",
          "Logs are never useful",
          "Restarting proves the root cause"
        ],
        correctOption: 0
      },
      {
        id: "BA4-P-3",
        prompt: "A health endpoint is 200 but real writes fail. What is a useful inference?",
        options: [
          "The health check is narrower than the real user operation",
          "The entire network is broken",
          "The database is definitely corrupt",
          "HTTP is disabled"
        ],
        correctOption: 0
      },
      {
        id: "BA4-P-4",
        prompt: "What does RPO describe?",
        options: [
          "The amount of data loss a recovery plan is intended to tolerate",
          "The time needed to restart a process",
          "The number of requests per second",
          "The CPU limit for a container"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "B-A5",
    course: "beginner",
    title: "Queues, Retries and Failure",
    prerequisiteLessonIds: ["B3.1"],
    remediationLessonIds: ["B3.1", "B3.2"],
    questions: [
      {
        id: "BA5-P-1",
        prompt: "A queue grows continuously. Which relationship should you test first?",
        options: [
          "Arrival rate is above effective service rate",
          "DNS TTL is too high",
          "The UI has too many buttons",
          "TLS must be broken"
        ],
        correctOption: 0
      },
      {
        id: "BA5-P-2",
        prompt: "Why can retries make a failing dependency less healthy?",
        options: [
          "Retries add more work to a component that is already under pressure",
          "Retries always reduce traffic",
          "Retries replace the queue",
          "Retries guarantee idempotency"
        ],
        correctOption: 0
      },
      {
        id: "BA5-P-3",
        prompt: "What is idempotency?",
        options: [
          "Repeating an operation has an acceptable result instead of duplicating its business effect",
          "A request that never times out",
          "A queue that cannot grow",
          "A database that never changes"
        ],
        correctOption: 0
      },
      {
        id: "BA5-P-4",
        prompt: "Why use backpressure?",
        options: [
          "To limit incoming work when downstream capacity is constrained",
          "To make retries faster",
          "To remove all failures",
          "To replace monitoring"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "I-A1",
    course: "intermediate",
    title: "Containers and Docker",
    prerequisiteLessonIds: ["D2.5", "D2.6", "D2.7"],
    remediationLessonIds: ["D2.5", "D2.6", "D2.7"],
    questions: [
      {
        id: "IA1-P-1",
        prompt: "Why does adding another container replica not automatically solve a dependency bottleneck?",
        options: [
          "The dependency can remain the limiting resource",
          "Containers cannot run concurrently",
          "Docker disables networking between replicas",
          "Replicas always reduce throughput"
        ],
        correctOption: 0
      },
      {
        id: "IA1-P-2",
        prompt: "A container has the right process but the wrong network behavior. Which evidence is most useful?",
        options: [
          "Container network configuration plus a request from the affected path",
          "Only the image tag",
          "The host's Git history",
          "A browser theme"
        ],
        correctOption: 0
      },
      {
        id: "IA1-P-3",
        prompt: "What does a healthcheck add to a containerized service?",
        options: [
          "An explicit signal about whether the service is ready or healthy according to the check",
          "A guarantee that every dependency is healthy",
          "A replacement for logs",
          "Unlimited retry capacity"
        ],
        correctOption: 0
      },
      {
        id: "IA1-P-4",
        prompt: "Why is volume behavior important for stateful containers?",
        options: [
          "Container lifetime and durable data lifetime may need different boundaries",
          "Volumes make CPU unlimited",
          "Volumes replace all backups",
          "Volumes remove network failures"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "I-A2",
    course: "intermediate",
    title: "Kubernetes Control Loops",
    prerequisiteLessonIds: ["D3.1", "D3.4"],
    remediationLessonIds: ["D3.1", "D3.4", "D3.5"],
    questions: [
      {
        id: "IA2-P-1",
        prompt: "What does Kubernetes reconciliation try to do?",
        options: [
          "Move observed state toward the declared desired state",
          "Build container images",
          "Replace DNS",
          "Store Git commits"
        ],
        correctOption: 0
      },
      {
        id: "IA2-P-2",
        prompt: "Why can a Pod be replaced without changing a Service endpoint?",
        options: [
          "The Service identity is separate from individual Pod identity",
          "Pods never change",
          "Services contain the application data",
          "Kubernetes disables Pod IPs"
        ],
        correctOption: 0
      },
      {
        id: "IA2-P-3",
        prompt: "What does readiness mainly influence?",
        options: [
          "Whether the Pod should receive normal traffic",
          "Whether an image can be built",
          "Whether a node has a CPU",
          "Whether Git can merge"
        ],
        correctOption: 0
      },
      {
        id: "IA2-P-4",
        prompt: "A Deployment has the desired replica count but users still get errors. What should you inspect?",
        options: [
          "Pod readiness and the real request path",
          "Only the Deployment YAML formatting",
          "Only Git history",
          "Only node names"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "I-A3",
    course: "intermediate",
    title: "Kubernetes Networking and Storage",
    prerequisiteLessonIds: ["D3.2", "D3.3"],
    remediationLessonIds: ["D3.2", "D3.3"],
    questions: [
      {
        id: "IA3-P-1",
        prompt: "What is a Kubernetes Service mainly providing?",
        options: [
          "A stable way to reach selected Pods",
          "A Terraform state file",
          "A container image",
          "A node scheduler"
        ],
        correctOption: 0
      },
      {
        id: "IA3-P-2",
        prompt: "A Service has no endpoints. What should you check first?",
        options: [
          "The Service selector and Pod labels/readiness",
          "The image registry password only",
          "Git branches",
          "CPU frequency"
        ],
        correctOption: 0
      },
      {
        id: "IA3-P-3",
        prompt: "What does a PersistentVolumeClaim represent?",
        options: [
          "A request for persistent storage with defined requirements",
          "A network port",
          "A Pod identity",
          "A deployment history"
        ],
        correctOption: 0
      },
      {
        id: "IA3-P-4",
        prompt: "A Pod reaches a database by IP but not by Service name. Which area is most relevant?",
        options: [
          "Service/DNS naming and cluster networking",
          "Git commit history",
          "Container image layers only",
          "CPU scheduling only"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "I-A4",
    course: "intermediate",
    title: "CI/CD and Infrastructure as Code",
    prerequisiteLessonIds: ["D4.1", "D4.4"],
    remediationLessonIds: ["D4.2", "D4.4", "D4.5"],
    questions: [
      {
        id: "IA4-P-1",
        prompt: "What is the main purpose of a Terraform plan?",
        options: [
          "Show intended infrastructure changes before they are applied",
          "Start every application container",
          "Replace source control",
          "Generate application logs"
        ],
        correctOption: 0
      },
      {
        id: "IA4-P-2",
        prompt: "Why is Terraform state important?",
        options: [
          "It tracks managed infrastructure so plans can relate configuration to resources",
          "It is the application database",
          "It is a DNS cache",
          "It is the CI runner"
        ],
        correctOption: 0
      },
      {
        id: "IA4-P-3",
        prompt: "What is configuration drift?",
        options: [
          "Actual infrastructure differs from intended managed configuration",
          "A DNS request times out",
          "A container restarts",
          "A Git branch is renamed"
        ],
        correctOption: 0
      },
      {
        id: "IA4-P-4",
        prompt: "Why should a deployment identify the exact artifact being promoted?",
        options: [
          "So the tested change can be traced to the deployed change",
          "So rollback becomes impossible",
          "So monitoring is unnecessary",
          "So every environment has identical secrets"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "I-A5",
    course: "intermediate",
    title: "Observability and SRE",
    prerequisiteLessonIds: ["D5.5"],
    remediationLessonIds: ["D5.5", "D5.8"],
    questions: [
      {
        id: "IA5-P-1",
        prompt: "What does an SLI measure?",
        options: [
          "A defined aspect of service behavior or user experience",
          "A Git commit",
          "A container image",
          "A firewall rule"
        ],
        correctOption: 0
      },
      {
        id: "IA5-P-2",
        prompt: "What does an SLO provide?",
        options: [
          "A target for an SLI over a defined period",
          "A Pod identity",
          "A backup archive",
          "A DNS resolver"
        ],
        correctOption: 0
      },
      {
        id: "IA5-P-3",
        prompt: "Why are latency percentiles useful?",
        options: [
          "They expose tail behavior that an average can hide",
          "They guarantee low latency",
          "They measure CPU only",
          "They replace traces"
        ],
        correctOption: 0
      },
      {
        id: "IA5-P-4",
        prompt: "What is an error budget used for?",
        options: [
          "Linking reliability performance to change and risk decisions",
          "Choosing a Docker image",
          "Replacing incident logs",
          "Increasing database storage"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "I-A6",
    course: "intermediate",
    title: "Distributed Systems and Recovery",
    prerequisiteLessonIds: ["D5.2", "D5.3", "D5.6"],
    remediationLessonIds: ["D5.2", "D5.3", "D5.6"],
    questions: [
      {
        id: "IA6-P-1",
        prompt: "What is partial failure?",
        options: [
          "Some components or communication paths fail while others continue",
          "The whole system stops",
          "Only storage can fail",
          "Every request succeeds"
        ],
        correctOption: 0
      },
      {
        id: "IA6-P-2",
        prompt: "Why are bounded timeouts important?",
        options: [
          "They prevent one dependency call from waiting forever and consuming resources",
          "They guarantee success",
          "They remove consistency issues",
          "They replace monitoring"
        ],
        correctOption: 0
      },
      {
        id: "IA6-P-3",
        prompt: "Why can regional failover cause a second incident?",
        options: [
          "The surviving region may not have enough capacity for the transferred load",
          "Failover always deletes data",
          "DNS cannot resolve two regions",
          "Replication prevents traffic movement"
        ],
        correctOption: 0
      },
      {
        id: "IA6-P-4",
        prompt: "What proves disaster recovery actually works?",
        options: [
          "A tested recovery plus verification of the real service and data",
          "A backup file existing",
          "A successful process restart",
          "A green dashboard only"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "A-F3",
    course: "advanced",
    title: "Failure Domains",
    prerequisiteLessonIds: ["A1.4"],
    remediationLessonIds: ["A1.4"],
    questions: [
      {
        id: "AF3-P-1",
        prompt: "Why spread replicas across failure domains?",
        options: [
          "To reduce the chance that one correlated failure removes all replicas",
          "To remove all network latency",
          "To avoid monitoring",
          "To guarantee consistency"
        ],
        correctOption: 0
      },
      {
        id: "AF3-P-2",
        prompt: "What is blast radius?",
        options: [
          "The scope of components or users affected by a failure or change",
          "The number of CPU cores",
          "A DNS TTL",
          "A database row count"
        ],
        correctOption: 0
      },
      {
        id: "AF3-P-3",
        prompt: "A region fails and the surviving region becomes overloaded. What assumption should you question?",
        options: [
          "Failover capacity was sufficient for the larger load",
          "DNS must be broken",
          "Replication cannot work",
          "The clients all failed"
        ],
        correctOption: 0
      },
      {
        id: "AF3-P-4",
        prompt: "Why model shared infrastructure dependencies as failure domains?",
        options: [
          "A common dependency can correlate failures across otherwise separate workloads",
          "Shared dependencies are always faster",
          "They remove the need for recovery",
          "They affect only logs"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "A-A1",
    course: "advanced",
    title: "Global Traffic and Multi-Region Systems",
    prerequisiteLessonIds: ["A1.5", "A1.6"],
    remediationLessonIds: ["A1.5", "A1.6"],
    questions: [
      {
        id: "AA1-P-1",
        prompt: "What does global traffic management decide?",
        options: [
          "Where requests should be directed under normal and failure conditions",
          "How a database stores rows",
          "How images are built",
          "How Git branches merge"
        ],
        correctOption: 0
      },
      {
        id: "AA1-P-2",
        prompt: "Why is failover capacity important?",
        options: [
          "The surviving region may need to carry substantially more traffic",
          "Traffic disappears during failure",
          "Regions share one CPU",
          "Routing removes all load"
        ],
        correctOption: 0
      },
      {
        id: "AA1-P-3",
        prompt: "Why can local caching create a correctness problem?",
        options: [
          "Cached state can be older than the source of truth",
          "Caching always corrupts data",
          "Caching prevents scaling",
          "Caching removes regions"
        ],
        correctOption: 0
      },
      {
        id: "AA1-P-4",
        prompt: "A region is healthy but saturated. What should a traffic policy consider?",
        options: [
          "Capacity or load signals in addition to basic health",
          "Only DNS TTL",
          "Only process count",
          "Only Git history"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "A-A2",
    course: "advanced",
    title: "Failure Engineering",
    prerequisiteLessonIds: ["A2.1", "A2.2"],
    remediationLessonIds: ["A2.1", "A2.2", "A2.3"],
    questions: [
      {
        id: "AA2-P-1",
        prompt: "Why use controlled fault injection?",
        options: [
          "To learn how the system behaves and recovers under a defined failure",
          "To make production randomly unstable",
          "To replace monitoring",
          "To avoid reset procedures"
        ],
        correctOption: 0
      },
      {
        id: "AA2-P-2",
        prompt: "Why define an abort condition before an experiment?",
        options: [
          "To stop the experiment if impact crosses the safe boundary",
          "To make the failure harder to diagnose",
          "To hide telemetry",
          "To guarantee recovery"
        ],
        correctOption: 0
      },
      {
        id: "AA2-P-3",
        prompt: "What can a partial network failure reveal?",
        options: [
          "Which system paths can fail while other paths continue",
          "Only host CPU usage",
          "Only database storage",
          "Nothing useful"
        ],
        correctOption: 0
      },
      {
        id: "AA2-P-4",
        prompt: "Why is recovery verification required after fault injection?",
        options: [
          "The system can look alive while user behavior, data or queues remain unhealthy",
          "Restart always proves recovery",
          "Failures automatically disappear",
          "Telemetry is not needed"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "A-A3",
    course: "advanced",
    title: "Massive-Scale Service Design",
    prerequisiteLessonIds: ["A3.1"],
    remediationLessonIds: ["A3.1", "A3.2"],
    questions: [
      {
        id: "AA3-P-1",
        prompt: "Why build an explicit capacity model before scaling a very large service?",
        options: [
          "It exposes workload assumptions and likely bottlenecks",
          "It guarantees linear scaling",
          "It removes all trade-offs",
          "It replaces measurement"
        ],
        correctOption: 0
      },
      {
        id: "AA3-P-2",
        prompt: "Why can a small per-request inefficiency become important at massive scale?",
        options: [
          "It is multiplied across a very large request volume",
          "Large systems ignore per-request cost",
          "Caching makes cost zero",
          "Scale removes latency"
        ],
        correctOption: 0
      },
      {
        id: "AA3-P-3",
        prompt: "Why is consistency part of architecture trade-off analysis?",
        options: [
          "Stronger coordination can affect latency, availability and cost",
          "Consistency only matters to databases",
          "Consistency always improves latency",
          "Consistency removes failure"
        ],
        correctOption: 0
      },
      {
        id: "AA3-P-4",
        prompt: "What makes a scalability claim credible?",
        options: [
          "Explicit workload assumptions plus measured or modelled capacity and bottlenecks",
          "A large number on a slide",
          "One successful local test",
          "A vendor name"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "A-F2",
    course: "advanced",
    title: "Distributed State Foundations",
    prerequisiteLessonIds: ["A1.3"],
    remediationLessonIds: ["A1.3", "A1.4"],
    questions: [
      {
        id: "AF2-P-1",
        prompt: "Why does replication not automatically mean every reader sees the newest value?",
        options: [
          "Replication can introduce lag or different visibility rules",
          "Replicas never contain data",
          "Replication removes all network paths",
          "Readers always contact every replica"
        ],
        correctOption: 0
      },
      {
        id: "AF2-P-2",
        prompt: "What does a partition-aware design have to recognize?",
        options: [
          "Some communication paths can fail while other parts of the system keep running",
          "Every failure stops the whole system",
          "Partitions only happen in storage devices",
          "Latency cannot change during partitions"
        ],
        correctOption: 0
      },
      {
        id: "AF2-P-3",
        prompt: "Why is consistency a system property rather than just a database setting?",
        options: [
          "Applications, replicas, caches and clients all influence what state users observe",
          "Only the database can ever return data",
          "Consistency is identical to CPU utilization",
          "Caching always removes consistency concerns"
        ],
        correctOption: 0
      },
      {
        id: "AF2-P-4",
        prompt: "What evidence helps distinguish stale data from a missing service?",
        options: [
          "A known value, read path and replica/cache timing evidence",
          "Only the process count",
          "Only the UI screenshot",
          "Only the deployment timestamp"
        ],
        correctOption: 0
      }
    ]
  },

  {
    sectionId: "A-F1",
    course: "advanced",
    title: "Capacity and Queueing Foundations",
    prerequisiteLessonIds: [],
    remediationLessonIds: ["A1.1", "A1.2"],
    questions: [
      {
        id: "AF1-P-1",
        prompt: "A queue grows continuously. What relationship is most important?",
        options: [
          "Arrival rate is above effective service rate",
          "DNS TTL is too high",
          "The client uses HTTPS",
          "The UI has too many buttons"
        ],
        correctOption: 0
      },
      {
        id: "AF1-P-2",
        prompt: "Why can adding API replicas fail to improve end-to-end throughput?",
        options: [
          "Another downstream component may already be the bottleneck",
          "Replicas always reduce throughput",
          "HTTP cannot use multiple servers",
          "Queues cannot exist between services"
        ],
        correctOption: 0
      },
      {
        id: "AF1-P-3",
        prompt: "What does headroom provide in a capacity plan?",
        options: [
          "Room for variation, failures and growth before saturation",
          "A guarantee that no component can fail",
          "A replacement for monitoring",
          "A fixed global latency"
        ],
        correctOption: 0
      },
      {
        id: "AF1-P-4",
        prompt: "Why is queue age useful in addition to queue depth?",
        options: [
          "Old work shows how long demand has remained unresolved",
          "Queue age measures CPU frequency",
          "Depth and age are always identical",
          "Age proves the database is corrupt"
        ],
        correctOption: 0
      }
    ]
  }
];

export const diagnosticBySection = Object.fromEntries(
  diagnosticDefinitions.map((definition) => [definition.sectionId, definition])
) as Record<string, DiagnosticDefinition>;

export function recommendationForScore(
  score: number,
  total: number
): DiagnosticRecommendation {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio >= 0.9) return "skip-theory";
  if (ratio >= 0.7) return "condense-theory";
  return "remediate";
}
