export type LessonVideoCue = {
  id: string;
  label: string;
  startMs: number;
  endMs?: number;
};

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
  | "kubernetes-networking-v1"
  | "kubernetes-config-storage-v1"
  | "kubernetes-health-scaling-v1"
  | "kubernetes-failure-loop-v1"
  | "git-production-workflow-v1"
  | "cicd-control-path-v1"
  | "github-actions-execution-v1"
  | "iac-control-loop-v1"
  | "terraform-lifecycle-v1"
  | "cloud-primitives-v1"
  | "scaling-control-loop-v1";

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
  "D5.1": {
    version: 1,
    blocks: [
      {
        id: "d5-1-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Scaling is a system decision. More servers help only when the constrained part of the workload can use the added capacity."
      },
      {
        id: "d5-1-scaling",
        type: "illustration",
        heading: "The scaling control path",
        alt: "Rising workload meets capacity limits, is distributed across instances, constrained by shared state, and diagnosed through the active bottleneck and evidence",
        bindingId: "D5.1:d5-1-scaling",
        nodes: ["Workload", "Capacity", "Distribution", "Shared State", "Bottleneck", "Evidence"],
        variant: "scaling-control-loop-v1",
        caption:
          "Find the first constrained dependency before deciding how to scale."
      }
    ]
  },


  "D4.6": {
    version: 1,
    blocks: [
      {
        id: "d4-6-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Cloud architecture becomes easier to reason about when provider names are reduced to primitives: workload, compute, network, state, identity and data services."
      },
      {
        id: "d4-6-cloud-primitives",
        type: "illustration",
        heading: "The provider-neutral cloud architecture",
        alt: "A workload is built from compute, network, state, identity and data services with dependencies and managed boundaries",
        bindingId: "D4.6:d4-6-cloud-primitives",
        nodes: ["Workload", "Compute", "Network", "State", "Identity", "Data Services"],
        variant: "cloud-primitives-v1",
        caption:
          "Understand the primitive first, then map it to AWS, Azure, GCP or another provider."
      }
    ]
  },


  "D4.5": {
    version: 1,
    blocks: [
      {
        id: "d4-5-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Terraform becomes predictable when the team understands its lifecycle: initialization, plan, apply, state coordination and observation of the real resources."
      },
      {
        id: "d4-5-terraform-lifecycle",
        type: "illustration",
        heading: "The Terraform lifecycle",
        alt: "Terraform loads configuration, initializes providers and state, creates a plan, applies changes and then observes the resulting infrastructure",
        bindingId: "D4.5:d4-5-terraform-lifecycle",
        nodes: ["Configuration", "Init", "Plan", "Apply", "Observe"],
        variant: "terraform-lifecycle-v1",
        caption:
          "Treat plan as the checkpoint, state as coordination data, and the provider as the authority for real resources."
      }
    ]
  },


  "D4.4": {
    version: 1,
    blocks: [
      {
        id: "d4-4-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Infrastructure as Code makes infrastructure intent reviewable and repeatable, but safe operation still depends on plan evidence, provider state, state coordination and drift detection."
      },
      {
        id: "d4-4-iac",
        type: "illustration",
        heading: "The Infrastructure as Code control loop",
        alt: "Declared infrastructure intent is planned, applied to real resources, recorded in state and compared for drift",
        bindingId: "D4.4:d4-4-iac",
        nodes: ["Intent", "Plan", "Apply", "State", "Drift"],
        variant: "iac-control-loop-v1",
        caption:
          "Keep declared intent, tool state and real provider resources conceptually separate."
      }
    ]
  },


  "D4.3": {
    version: 1,
    blocks: [
      {
        id: "d4-3-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "GitHub Actions turns the CI/CD control model into executable automation. Learn workflow, job, runner, steps and artifact as separate execution boundaries."
      },
      {
        id: "d4-3-github-actions",
        type: "illustration",
        heading: "The GitHub Actions execution model",
        alt: "A workflow creates jobs that run on runners through ordered steps and produce artifacts while caches and secrets serve separate purposes",
        bindingId: "D4.3:d4-3-github-actions",
        nodes: ["Workflow", "Job", "Runner", "Steps", "Artifact"],
        variant: "github-actions-execution-v1",
        caption:
          "Use the Actions vocabulary to inspect execution and evidence, not to replace the underlying CI/CD model."
      }
    ]
  },


  "D4.2": {
    version: 1,
    blocks: [
      {
        id: "d4-2-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "CI/CD is a controlled path from source to running software. The pipeline should make validation, artifact identity, promotion and runtime verification visible."
      },
      {
        id: "d4-2-cicd",
        type: "illustration",
        heading: "The CI/CD control path",
        alt: "A source change is validated, built into an identified artifact, promoted through controlled environments and verified after deployment",
        bindingId: "D4.2:d4-2-cicd",
        nodes: ["Source", "Validate", "Artifact", "Promote", "Verify"],
        variant: "cicd-control-path-v1",
        caption:
          "Design the control model first; the vendor's YAML is only one implementation."
      }
    ]
  },


  "D4.1": {
    version: 1,
    blocks: [
      {
        id: "d4-1-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Production Git is not only about storing code. The workflow must let the team trace a running change back to source, review it, identify the exact release and recover safely."
      },
      {
        id: "d4-1-git-production-workflow",
        type: "illustration",
        heading: "The production Git workflow",
        alt: "A code change moves through review, commit, release identity, deployment evidence and rollback recovery",
        bindingId: "D4.1:d4-1-git-production-workflow",
        nodes: ["Change", "Review", "Commit", "Release", "Recovery"],
        variant: "git-production-workflow-v1",
        caption:
          "Treat Git history as evidence for production change, not just as developer history."
      }
    ]
  },


  "D3.5": {
    version: 1,
    blocks: [
      {
        id: "d3-5-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Kubernetes failure diagnosis is a controlled reasoning exercise: start from a known-good state, break one boundary, predict the symptom, collect evidence, then prove recovery."
      },
      {
        id: "d3-5-kubernetes-failure",
        type: "illustration",
        heading: "The Kubernetes failure loop",
        alt: "A known-good Kubernetes workload is changed at one boundary, a symptom appears, evidence narrows the cause, and the workload is recovered",
        bindingId: "D3.5:d3-5-kubernetes-failure",
        nodes: ["Baseline", "Fault", "Symptom", "Evidence", "Recovery"],
        variant: "kubernetes-failure-loop-v1",
        caption:
          "Treat CrashLoopBackOff, ImagePullBackOff, OOMKilled and failed readiness as evidence clues, not final diagnoses."
      }
    ]
  },


  "D3.4": {
    version: 1,
    blocks: [
      {
        id: "d3-4-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Kubernetes health and scaling become clear when startup, readiness, liveness, capacity and rollout are treated as different system states."
      },
      {
        id: "d3-4-kubernetes-health-scaling",
        type: "illustration",
        heading: "The Kubernetes health and scaling path",
        alt: "A workload starts, becomes ready for traffic, is kept alive by liveness checks, scales with resource and replica decisions, and rolls out a new version",
        bindingId: "D3.4:d3-4-kubernetes-health-scaling",
        nodes: ["Startup", "Readiness", "Liveness", "Capacity", "Rollout"],
        variant: "kubernetes-health-scaling-v1",
        caption:
          "Separate initialization, traffic readiness, restart health and capacity during rollout."
      }
    ]
  },


  "D3.3": {
    version: 1,
    blocks: [
      {
        id: "d3-3-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Kubernetes configuration, secrets and persistent data solve different problems. Their lifecycles should stay separate from the disposable Pod and image lifecycle."
      },
      {
        id: "d3-3-kubernetes-config-storage",
        type: "illustration",
        heading: "Configuration, secrets and persistent data",
        alt: "A Kubernetes workload receives configuration and secrets, mounts them into a Pod, and stores persistent data through a volume-backed storage boundary",
        bindingId: "D3.3:d3-3-kubernetes-config-storage",
        nodes: ["Config", "Secret", "Mount", "Pod", "Persistence"],
        variant: "kubernetes-config-storage-v1",
        caption:
          "Separate configuration lifecycle, secret handling, application mounts and persistent data lifecycle."
      }
    ]
  },


  "D3.2": {
    version: 1,
    blocks: [
      {
        id: "d3-2-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Kubernetes networking stays understandable when you separate stable Service identity, selector matching, the current endpoint set, Pod lifecycle and the evidence from a real request."
      },
      {
        id: "d3-2-kubernetes-networking",
        type: "illustration",
        heading: "The Kubernetes network path",
        alt: "A client resolves a Kubernetes Service, the selector determines its endpoint set, traffic reaches a selected Pod, and evidence exposes the path",
        bindingId: "D3.2:d3-2-kubernetes-networking",
        nodes: ["Service", "Selector", "Endpoint set", "Pod", "Evidence"],
        variant: "kubernetes-networking-v1",
        caption:
          "Trace a request through stable Service identity, selector matching, endpoint membership and Pod availability."
      }
    ]
  },


  "D3.1": {
    version: 1,
    blocks: [
      {
        id: "d3-1-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Kubernetes becomes easier to understand when YAML is treated as desired state and controllers are treated as the machinery that keeps actual state moving toward it."
      },
      {
        id: "d3-1-kubernetes-model",
        type: "illustration",
        heading: "The Kubernetes reconciliation loop",
        alt: "Kubernetes compares desired state with actual state, a controller acts, and the system moves toward the desired state",
        bindingId: "D3.1:d3-1-kubernetes-model",
        nodes: ["Desired State", "Controller", "Observe", "Act", "Converge"],
        variant: "kubernetes-reconciliation-v1",
        caption:
          "YAML describes desired state; the control loop does the ongoing work."
      }
    ]
  },


  "D2.7": {
    version: 1,
    blocks: [
      {
        id: "d2-7-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Controlled failure turns Docker from a command vocabulary into an evidence-based operating skill. Change one boundary, predict the symptom, collect evidence, then prove recovery."
      },
      {
        id: "d2-7-break-docker",
        type: "illustration",
        heading: "The controlled Docker failure loop",
        alt: "A known-good Docker stack is changed in one place, a predicted symptom is observed, evidence identifies the boundary, and the system is restored",
        bindingId: "D2.7:d2-7-break-docker",
        nodes: ["Baseline", "Change", "Symptom", "Evidence", "Recovery"],
        variant: "docker-failure-loop-v1",
        caption:
          "The experiment is only complete when the system is restored and the original user path is proven again."
      }
    ]
  },


  "D2.6": {
    version: 1,
    blocks: [
      {
        id: "d2-6-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Docker networking and storage make earlier DevOps ideas concrete. Internal service names, published ports and persistent volumes are separate boundaries, so their failures need separate diagnoses."
      },
      {
        id: "d2-6-docker-network-storage",
        type: "illustration",
        heading: "The Docker service boundary",
        alt: "A Docker service connects through a network and service name to a port while persistent data lives in a volume",
        bindingId: "D2.6:d2-6-docker-network-storage",
        nodes: ["Service", "Network", "Name", "Port", "Volume"],
        variant: "docker-network-storage-v1",
        caption:
          "Use the visual to separate internal discovery, external access and data lifetime."
      }
    ]
  },


  "D2.5": {
    version: 1,
    blocks: [
      {
        id: "d2-5-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Containers make application environments more repeatable by isolating processes and packaging their files and configuration, without creating a full virtual machine."
      },
      {
        id: "d2-5-containers",
        type: "illustration",
        heading: "The container execution model",
        alt: "An image creates a container that runs a process inside isolated namespaces while sharing the host kernel",
        bindingId: "D2.5:d2-5-containers",
        nodes: ["Image", "Container", "Process", "Namespaces", "Host Kernel"],
        variant: "container-execution-v1",
        caption:
          "Keep Image, Container and Process separate, and remember that the host kernel is shared."
      }
    ]
  },


  "D2.4": {
    version: 1,
    blocks: [
      {
        id: "d2-4-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "HTTPS combines HTTP with TLS. The client must establish a protected session and validate the server identity before it should trust the connection as intended."
      },
      {
        id: "d2-4-tls",
        type: "illustration",
        heading: "The HTTPS trust path",
        alt: "A client checks a server certificate, completes a TLS handshake, establishes a protected session and interprets trust evidence",
        bindingId: "D2.4:d2-4-tls",
        nodes: ["Client", "Certificate", "Handshake", "Secure Session", "Evidence"],
        variant: "tls-trust-v1",
        caption:
          "Separate certificate identity, cryptographic handshake and application behavior."
      }
    ]
  },


  "D2.3": {
    version: 1,
    blocks: [
      {
        id: "d2-3-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "HTTP is an application protocol carried over lower network layers. Its method, path, headers, status and body give you different evidence than DNS, transport or TLS."
      },
      {
        id: "d2-3-http",
        type: "illustration",
        heading: "The HTTP exchange",
        alt: "An HTTP request carries method, path and headers to an application route that returns a status, headers and body for the client to interpret",
        bindingId: "D2.3:d2-3-http",
        nodes: ["Request", "Headers", "Route", "Response", "Evidence"],
        variant: "http-exchange-v1",
        caption:
          "Read HTTP as a structured application conversation on top of lower layers."
      }
    ]
  },


  "D2.2": {
    version: 1,
    blocks: [
      {
        id: "d2-2-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "DNS is a distributed naming system. Resolver choice, caching, authoritative data, record type and TTL all affect what answer a client sees."
      },
      {
        id: "d2-2-dns",
        type: "illustration",
        heading: "The DNS answer path",
        alt: "A DNS name is queried through a resolver that may use cached data or ask authoritative servers, with record type and TTL shaping the answer",
        bindingId: "D2.2:d2-2-dns",
        nodes: ["Name", "Resolver", "Cache", "Authority", "Freshness"],
        variant: "dns-resolution-v1",
        caption:
          "Trace the answer from the client's resolver to authoritative data, then account for caching and freshness."
      }
    ]
  },


  "D2.1": {
    version: 1,
    blocks: [
      {
        id: "d2-1-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "IP can reach a host without proving that the expected service is reachable. Transport adds ports and a delivery contract, and TCP and UDP make different trade-offs."
      },
      {
        id: "d2-1-transport",
        type: "illustration",
        heading: "The transport contract",
        alt: "An endpoint selects TCP or UDP for a port, with different delivery behavior and evidence at the transport layer",
        bindingId: "D2.1:d2-1-transport",
        nodes: ["Endpoint", "Port", "Transport", "Delivery", "Evidence"],
        variant: "transport-contract-v1",
        caption:
          "Separate host reachability, service reachability, transport behavior and application response."
      }
    ]
  },


  "D1.6": {
    version: 1,
    blocks: [
      {
        id: "d1-6-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Routing determines where packets go next. NAT may change address representation at a boundary. Treating them as the same mechanism makes partial reachability and asymmetric failures harder to diagnose."
      },
      {
        id: "d1-6-routing-model",
        type: "illustration",
        heading: "The routing decision",
        alt: "A destination address is matched against routes, sent to a next hop across a boundary, and verified with path evidence",
        bindingId: "D1.6:d1-6-routing-model",
        nodes: ["Destination", "Route", "Next hop", "Boundary", "Evidence"],
        variant: "routing-boundary-v1",
        caption:
          "Trace destination match, next hop, boundary behavior and return-path evidence separately."
      }
    ]
  },


  "D1.5": {
    version: 1,
    blocks: [
      {
        id: "d1-5-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "CIDR is not a notation trick. It defines a network boundary that determines which addresses belong together, how traffic is routed, and how large a segment can be."
      },
      {
        id: "d1-5-cidr-model",
        type: "illustration",
        heading: "The subnet boundary",
        alt: "An IP address is split by a CIDR prefix into network and host space, producing a defined range that can be verified",
        bindingId: "D1.5:d1-5-cidr-model",
        nodes: ["Address", "Prefix", "Boundary", "Range", "Verify"],
        variant: "cidr-boundary-v1",
        caption:
          "Reason from the boundary first, then calculate the usable range."
      }
    ]
  },

  "D1.4": {
    version: 1,
    blocks: [
      {
        id: "d1-4-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Networking becomes easier to troubleshoot when each layer has a clear question: is the interface active, can the local link deliver, does the host have the right IP context, and does routing point toward the destination?"
      },
      {
        id: "d1-4-network-model",
        type: "illustration",
        heading: "The network operating model",
        alt: "A networked host uses an interface and local link to reach an IP destination through routing, with each layer producing different evidence",
        bindingId: "D1.4:d1-4-network-model",
        nodes: ["Interface", "Link", "IP", "Route", "Evidence"],
        variant: "network-operating-model-v1",
        caption:
          "MAC, IP, route and port answer different questions in the same request path."
      }
    ]
  },

  "D1.3": {
    version: 1,
    blocks: [
      {
        id: "d1-3-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Production behavior depends on more than application code. User identity, permissions, environment, service supervision and logs form the execution context around the process."
      },
      {
        id: "d1-3-service-context",
        type: "illustration",
        heading: "The service execution context",
        alt: "A service process runs with an identity and environment, accesses resources under permissions, follows a lifecycle, and leaves log evidence",
        bindingId: "D1.3:d1-3-service-context",
        nodes: ["Process", "Identity", "Resource", "Service", "Logs"],
        variant: "service-permission-model-v1",
        caption:
          "Same code, different execution context, different system behavior."
      }
    ]
  },

  "D1.2": {
    version: 1,
    blocks: [
      {
        id: "d1-2-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "The terminal becomes an engineering instrument when you can start with a system question, choose the right producer, compose tools, route evidence, and explain the result."
      },
      {
        id: "d1-2-terminal-tool",
        type: "illustration",
        heading: "The terminal as an evidence pipeline",
        alt: "A diagnostic question is answered by composing commands, transforming output, routing it through pipes or files, and interpreting the resulting evidence",
        bindingId: "D1.2:d1-2-terminal-tool",
        nodes: ["Question", "Producer", "Transform", "Route", "Evidence"],
        variant: "terminal-composition-v1",
        caption:
          "Use commands as evidence-producing components, not as a list to memorize."
      }
    ]
  },

  "D1.1": {
    version: 1,
    blocks: [
      {
        id: "d1-1-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "Linux operations become easier when you can explain the path from application work to process state, kernel-managed resources and the evidence exposed by the system."
      },
      {
        id: "d1-1-linux-model",
        type: "illustration",
        heading: "The Linux operating model",
        alt: "Application work runs as processes that request kernel-managed CPU, memory, files and network resources, which operators inspect as evidence",
        bindingId: "D1.1:d1-1-linux-model",
        nodes: ["Application", "Process", "Kernel", "Resources", "Evidence"],
        variant: "linux-operating-model-v1",
        caption:
          "Trace the behavior from application work to the process and resources the kernel manages."
      }
    ]
  },

  "B1.1": {
    version: 1,
    blocks: [
      {
        id: "b1-1-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "A report such as 'the app is slow' is a symptom, not a diagnosis. Start with the user-visible behavior, identify the running process, inspect resource and dependency evidence, and prove which hypothesis survives."
      },
      {
        id: "b1-1-process-diagnosis",
        type: "illustration",
        heading: "From symptom to process evidence",
        alt: "A slow application symptom is narrowed to a process, resource or dependency and then verified with evidence",
        bindingId: "B1.1:b1-1-process-diagnosis",
        nodes: ["Symptom", "Process", "Resource", "Dependency", "Proof"],
        variant: "process-diagnosis-v1",
        caption:
          "Use the smallest observation that separates the likely causes."
      }
    ]
  },

  "B3.2": {
    version: 1,
    blocks: [
      {
        id: "b3-2-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "An incident is not just a broken command. It is a live system problem where user impact, evidence, mitigation, recovery and learning must stay connected."
      },
      {
        id: "b3-2-incident",
        type: "illustration",
        heading: "The incident loop",
        alt: "A production incident moves from user impact through scoping and evidence to mitigation, stable recovery and follow-up learning",
        bindingId: "B3.2:b3-2-incident",
        nodes: ["Impact", "Scope", "Evidence", "Mitigate", "Recover", "Learn"],
        variant: "incident-loop-v1",
        caption:
          "Reduce harm, keep evidence, prove recovery, then turn the incident into a stronger system."
      }
    ]
  },

  "B3.1": {
    version: 1,
    blocks: [
      {
        id: "b3-1-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "A queue separates accepting work from processing it, but it also introduces new system states: waiting work, consumer throughput, retries and duplicate delivery."
      },
      {
        id: "b3-1-queue",
        type: "illustration",
        heading: "Where the work is now",
        alt: "Work moves from a producer into a queue, through a consumer, and into an outcome while queue depth and duplicate delivery remain visible",
        bindingId: "B3.1:b3-1-queue",
        nodes: ["Producer", "Queue", "Consumer", "Outcome"],
        variant: "queue-state-v1",
        caption:
          "Follow the message state and the evidence at each boundary."
      }
    ]
  },

  "B2.3": {
    version: 1,
    blocks: [
      {
        id: "b2-3-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "A backup is a copy, not proof that the service can return to a useful state. Recovery requires restore, compatibility, verification and a user-facing recovery check."
      },
      {
        id: "b2-3-recovery",
        type: "illustration",
        heading: "From backup to recovery",
        alt: "A system backup is restored into a safe target, checked for compatibility, verified, and returned to a working service state",
        bindingId: "B2.3:b2-3-recovery",
        nodes: ["Backup", "Restore", "Compatibility", "Verify", "Recover"],
        variant: "backup-recovery-v1",
        caption:
          "Recovery is a system path, not a successful backup command."
      }
    ]
  },

  "B2.2": {
    version: 1,
    blocks: [
      {
        id: "b2-2-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "A report such as 'everything is slow' is only a symptom. Observability gives us different kinds of evidence so we can scope the problem, compare competing causes and prove recovery."
      },
      {
        id: "b2-2-observability",
        type: "illustration",
        heading: "From symptom to evidence",
        alt: "A vague slow-service report becomes scoped evidence across request latency, service signals, dependency signals and proof",
        bindingId: "B2.2:b2-2-observability",
        nodes: ["Symptom", "Scope", "Service", "Dependency", "Proof"],
        variant: "observability-diagnosis-v1",
        caption:
          "Use the signal that answers the next useful question; do not collect dashboards without a diagnostic purpose."
      }
    ]
  },

  "B2.1": {
    version: 1,
    blocks: [
      {
        id: "b2-1-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "A production change should remain traceable from source change to tested artifact to deployed release and then to runtime evidence. The goal is not slower delivery; it is controlled delivery that can be explained and recovered."
      },
      {
        id: "b2-1-safe-delivery",
        type: "illustration",
        heading: "The release path",
        alt: "A code change is reviewed, tested, built into an identified artifact, deployed, and verified in the running service",
        bindingId: "B2.1:b2-1-safe-delivery",
        nodes: ["Change", "Review", "Test", "Artifact", "Deploy", "Verify"],
        variant: "delivery-pipeline-v1",
        caption:
          "A release is a traceable path from source change to verified runtime behavior."
      }
    ]
  },

  "B1.5": {
    version: 1,
    blocks: [
      {
        id: "b1-5-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "An application is not repeatable because one engineer knows how to start it. It is repeatable when another engineer can follow the same startup, configuration, health and user-path contract without hidden operational knowledge."
      },
      {
        id: "b1-5-repeatability",
        type: "illustration",
        heading: "The repeatable service contract",
        alt: "An application image receives environment configuration, starts with its dependencies, becomes ready, and is proven through a real user request",
        bindingId: "B1.5:b1-5-repeatability",
        nodes: ["Image", "Configuration", "Runtime", "Health", "User path"],
        variant: "repeatable-service-v1",
        caption:
          "Repeatability is a contract from packaged application to proven user behavior."
      }
    ]
  },
  "B1.2": {
    version: 1,
    blocks: [
      {
        id: "b1-2-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "A request does not jump straight from a browser to an application. It crosses several boundaries, and each boundary gives us different evidence when something fails."
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
      }
    ]
  },
  "B1.3": {
    version: 1,
    blocks: [
      {
        id: "b1-3-problem",
        type: "text",
        heading: "Why this matters",
        body:
          "An API can be reachable while its secure session fails, or the secure session can work while the application returns an error. HTTP, TLS and DNS help us see how far a request actually got."
      },
      {
        id: "b1-3-request-stack",
        type: "illustration",
        heading: "One HTTPS request",
        alt: "DNS, routing, transport, TLS and HTTP cooperate to produce an HTTPS response",
        bindingId: "B1.3:b1-3-request-stack",
        nodes: ["DNS", "Route", "Transport", "TLS", "HTTP"],
        variant: "https-stack-v1",
        caption:
          "DNS, routing, transport, TLS and HTTP cooperate; a failure at one stage changes the evidence."
      }
    ]
  },
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
        block.variant !== "container-boundary-v1" &&
        block.variant !== "request-path-v1" &&
        block.variant !== "https-stack-v1" &&
        block.variant !== "repeatable-service-v1" &&
        block.variant !== "delivery-pipeline-v1" &&
        block.variant !== "observability-diagnosis-v1" &&
        block.variant !== "backup-recovery-v1" &&
        block.variant !== "queue-state-v1" &&
        block.variant !== "incident-loop-v1" &&
        block.variant !== "process-diagnosis-v1" &&
        block.variant !== "linux-operating-model-v1" &&
        block.variant !== "terminal-composition-v1" &&
        block.variant !== "service-permission-model-v1" &&
        block.variant !== "network-operating-model-v1" &&
        block.variant !== "cidr-boundary-v1" &&
        block.variant !== "routing-boundary-v1" &&
        block.variant !== "dns-resolution-v1" &&
        block.variant !== "http-exchange-v1" &&
        block.variant !== "tls-trust-v1" &&
        block.variant !== "container-execution-v1" &&
        block.variant !== "docker-network-storage-v1" &&
        block.variant !== "docker-failure-loop-v1" &&
        block.variant !== "kubernetes-reconciliation-v1" &&
        block.variant !== "kubernetes-networking-v1" &&
        block.variant !== "kubernetes-config-storage-v1" &&
        block.variant !== "kubernetes-health-scaling-v1" &&
        block.variant !== "kubernetes-failure-loop-v1" &&
        block.variant !== "git-production-workflow-v1" &&
        block.variant !== "cicd-control-path-v1" &&
        block.variant !== "github-actions-execution-v1" &&
        block.variant !== "iac-control-loop-v1" &&
        block.variant !== "terraform-lifecycle-v1" &&
        block.variant !== "cloud-primitives-v1" &&
        block.variant !== "scaling-control-loop-v1" &&
        block.variant !== "transport-contract-v1"
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
