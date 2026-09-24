import type { CourseLevel } from "./programme";

export type ProjectDefinition = {
  id: string;
  course: CourseLevel;
  title: string;
  objective: string;
  environment: string;
  milestones: string[];
  competencyGates: string[];
  failureScenarios: string[];
  evidenceRequirements: string[];
  completionCriteria: string[];
};

export const projects: ProjectDefinition[] = [
  {
    id: "B1",
    course: "beginner",
    title: "Containerized Application",
    objective: "Turn a small useful service into a repeatable locally operated workload.",
    environment: "macOS, Linux or Windows development machine with a container runtime.",
    milestones: [
      "Observe the service as a process",
      "Trace one request through DNS, transport and HTTP",
      "Containerize the service",
      "Break one configuration or dependency",
      "Recover and record the evidence"
    ],
    competencyGates: ["B-F1.core", "B-F2.core", "B-A1.core", "B-A2.core"],
    failureScenarios: [
      "service process is alive but not progressing",
      "wrong port or unreachable service",
      "container configuration failure"
    ],
    evidenceRequirements: [
      "request-path observation",
      "container inspection",
      "failure diagnosis",
      "recovery evidence"
    ],
    completionCriteria: [
      "service can be started from a clean environment",
      "learner can explain the request path",
      "one deliberate failure is diagnosed and recovered"
    ]
  },
  {
    id: "B2",
    course: "beginner",
    title: "Productionized Service",
    objective: "Add controlled delivery, observability and recovery to the service.",
    environment: "Repository plus local or disposable CI/deployment environment.",
    milestones: [
      "Create a release identity",
      "Run automated checks",
      "Deploy a known artifact",
      "Observe a controlled failure",
      "Restore from backup or rollback"
    ],
    competencyGates: ["B-A3.core", "B-A4.core"],
    failureScenarios: [
      "bad release",
      "slow dependency",
      "failed restore"
    ],
    evidenceRequirements: [
      "release identity",
      "deployment result",
      "failure evidence",
      "restore or rollback verification"
    ],
    completionCriteria: [
      "change path is repeatable",
      "failure can be diagnosed from evidence",
      "recovery is verified"
    ]
  },
  {
    id: "B3",
    course: "beginner",
    title: "Distributed Service",
    objective: "Add asynchronous work and recover from a real distributed-service failure.",
    environment: "Disposable multi-service environment with a queue and worker.",
    milestones: [
      "Add producer and consumer",
      "Observe queue growth",
      "Introduce retries and idempotency",
      "Inject dependency failure",
      "Run the first incident and verify recovery"
    ],
    competencyGates: ["B-A5.core"],
    failureScenarios: [
      "slow consumer",
      "retry amplification",
      "database overload behind workers"
    ],
    evidenceRequirements: [
      "queue behavior",
      "retry behavior",
      "incident timeline",
      "recovery verification"
    ],
    completionCriteria: [
      "queue protects the front path",
      "retry behavior is bounded",
      "incident is repaired with evidence"
    ]
  },
  {
    id: "I1",
    course: "intermediate",
    title: "Production Kubernetes Platform",
    objective: "Operate an application on Kubernetes with networking, state, health and scaling.",
    environment: "Local Kubernetes cluster or disposable managed cluster.",
    milestones: [
      "Deploy the container",
      "Expose it through a service",
      "Add configuration and storage",
      "Add health probes",
      "Scale and break the deployment",
      "Recover from a Kubernetes failure"
    ],
    competencyGates: ["I-F1.core", "I-F2.core", "I-A1.core", "I-A2.core", "I-A3.core"],
    failureScenarios: [
      "ImagePullBackOff or bad image",
      "service selector mismatch",
      "unhealthy pod or storage failure"
    ],
    evidenceRequirements: [
      "kubectl observations",
      "network-path evidence",
      "pod/service state",
      "recovery record"
    ],
    completionCriteria: [
      "learner can explain reconciliation",
      "application is reachable through the intended path",
      "one controlled Kubernetes failure is recovered"
    ]
  },
  {
    id: "I2",
    course: "intermediate",
    title: "Infrastructure and Observability",
    objective: "Build reproducible infrastructure and operational evidence around a service.",
    environment: "Terraform-compatible cloud or local infrastructure plus CI.",
    milestones: [
      "Review an infrastructure plan",
      "Apply a controlled change",
      "Capture logs, metrics and traces",
      "Define an SLO",
      "Perform a controlled rollback"
    ],
    competencyGates: ["I-A4.core", "I-A5.core"],
    failureScenarios: [
      "configuration drift",
      "bad deployment",
      "missing observability signal"
    ],
    evidenceRequirements: [
      "plan/apply evidence",
      "observability evidence",
      "rollback proof",
      "SLO decision"
    ],
    completionCriteria: [
      "infrastructure changes are reviewable",
      "a failure has enough telemetry for diagnosis",
      "rollback is repeatable"
    ]
  },
  {
    id: "I3",
    course: "intermediate",
    title: "Integrated Production Platform",
    objective: "Operate application, Kubernetes, infrastructure, observability and recovery as one system.",
    environment: "Disposable end-to-end production-like environment.",
    milestones: [
      "Integrate I1 and I2",
      "Add database behavior",
      "Run a distributed failure",
      "Perform disaster recovery",
      "Lead an incident review"
    ],
    competencyGates: ["I-A5.core", "I-A6.core"],
    failureScenarios: [
      "database degradation",
      "regional or dependency failure",
      "observability gap during incident"
    ],
    evidenceRequirements: [
      "incident timeline",
      "cross-layer evidence",
      "recovery proof",
      "redesign decision"
    ],
    completionCriteria: [
      "failure can be localized across layers",
      "recovery objective is stated and tested",
      "post-incident redesign is evidence-based"
    ]
  },
  {
    id: "A1",
    course: "advanced",
    title: "Global Distributed Platform",
    objective: "Design and operate a multi-region system with capacity, traffic and data-locality constraints.",
    environment: "Multi-region simulation or disposable cloud environment.",
    milestones: [
      "Model capacity",
      "Deploy two regions",
      "Route global traffic",
      "Add local caching or replicas",
      "Inject a regional failure"
    ],
    competencyGates: ["A-F1.core", "A-F2.core", "A-F3.core", "A-A1.core"],
    failureScenarios: [
      "region saturation",
      "stale local data",
      "regional traffic failover"
    ],
    evidenceRequirements: [
      "capacity model",
      "routing evidence",
      "data-freshness evidence",
      "regional recovery record"
    ],
    completionCriteria: [
      "capacity bottleneck is explicit",
      "traffic policy has failure behavior",
      "data-locality trade-offs are documented and tested"
    ]
  },
  {
    id: "A2",
    course: "advanced",
    title: "Failure Engineering Platform",
    objective: "Use controlled fault injection to expose dependency, retry and partial-network failures.",
    environment: "Disposable distributed system with safe fault injection.",
    milestones: [
      "Map dependencies",
      "Break one dependency",
      "Create retry pressure",
      "Inject partial network failure",
      "Recover and verify"
    ],
    competencyGates: ["A-A2.core"],
    failureScenarios: [
      "dependency collapse",
      "retry storm",
      "partial network failure"
    ],
    evidenceRequirements: [
      "failure hypothesis",
      "injection record",
      "system response",
      "recovery verification"
    ],
    completionCriteria: [
      "failure blast radius is understood",
      "retry behavior is bounded",
      "recovery is proven"
    ]
  },
  {
    id: "A3",
    course: "advanced",
    title: "Massive-Scale Service",
    objective: "Design a very large system while making latency, consistency, availability, cost and complexity trade-offs explicit.",
    environment: "Capacity simulation plus a representative distributed-service prototype.",
    milestones: [
      "Build a workload model",
      "Find the first bottleneck",
      "Scale and move the bottleneck",
      "Review consistency and availability choices",
      "Defend the architecture with evidence"
    ],
    competencyGates: ["A-A3.core"],
    failureScenarios: [
      "capacity collapse",
      "cache miss amplification",
      "trade-off failure under load"
    ],
    evidenceRequirements: [
      "capacity model",
      "load-test observations",
      "trade-off matrix",
      "failure analysis"
    ],
    completionCriteria: [
      "bottlenecks are quantified",
      "trade-offs are measurable",
      "architecture survives a controlled stress scenario"
    ]
  }
];

export const projectsByCourse: Record<CourseLevel, ProjectDefinition[]> = {
  beginner: projects.filter((project) => project.course === "beginner"),
  intermediate: projects.filter((project) => project.course === "intermediate"),
  advanced: projects.filter((project) => project.course === "advanced")
};
