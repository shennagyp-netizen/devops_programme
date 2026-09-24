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
  changeHistory: string[];
  incidentHistory: string[];
};

export const projects: ProjectDefinition[] = [
  {
    id: "B1",
    course: "beginner",
    title: "Containerized Application",
    objective: "Turn a small useful service into a repeatable locally operated workload.",
    environment: "macOS, Linux or Windows development machine with a container runtime.",
    changeHistory: ["Record the known-good service and request-path baseline before containerization.","Record the containerization change, image identity and resulting runtime state.","Record the deliberate configuration or dependency change and the recovery evidence.","Record the redesign decision made after the first failure."],
    incidentHistory: ["Record a request-path incident with scope, observations and recovery verification.","Record a container or configuration incident without hiding the pre-change evidence.","Record the incident review and the prevention change added afterward."],
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
    changeHistory: ["Record the release identity and automated checks before promotion.","Record the artifact promoted and the deployment change.","Record the observability or recovery change introduced after the first failure.","Record the rollback or restore procedure after it is tested."],
    incidentHistory: ["Record a bad-release incident and the evidence used to choose rollback.","Record a dependency-performance incident and its mitigation.","Record a restore or rollback incident and the verification that recovery was complete."],
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
    changeHistory: ["Record the baseline synchronous path before adding asynchronous work.","Record the producer, queue and consumer change and the expected protection it adds.","Record the retry and idempotency change and the observed effect.","Record the redesign after dependency failure."],
    incidentHistory: ["Record a slow-consumer incident and queue recovery.","Record a retry-amplification incident and the safe mitigation.","Record a downstream database or dependency incident and the recovery verification."],
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
    changeHistory: ["Record the initial Kubernetes deployment and service topology.","Record configuration, storage and health-probe changes with rollout evidence.","Record the scaling change and its effect on the request path.","Record the redesign after a controlled Kubernetes failure."],
    incidentHistory: ["Record an image or deployment failure with pod evidence.","Record a service or selector/networking failure and recovery.","Record a health or storage failure and recovery verification."],
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
    changeHistory: ["Record the baseline infrastructure plan and applied resources.","Record the observability instrumentation and signal changes.","Record the SLO and alerting changes.","Record the rollback procedure after a controlled infrastructure change."],
    incidentHistory: ["Record a configuration-drift incident and its evidence.","Record a deployment failure and rollback decision.","Record an observability-gap incident and the telemetry redesign."],
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
    changeHistory: ["Record integration changes across application, Kubernetes and infrastructure.","Record database behavior and recovery-path changes.","Record the disaster-recovery design and tested recovery changes.","Record post-incident redesign decisions."],
    incidentHistory: ["Record a database degradation incident across all relevant layers.","Record a distributed dependency failure and recovery.","Record a disaster-recovery exercise and the resulting corrective actions."],
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
    changeHistory: ["Record the baseline workload and single-region capacity assumptions.","Record the second-region deployment and global traffic policy.","Record caching or replica changes and the resulting locality behavior.","Record the redesign after a regional failure."],
    incidentHistory: ["Record a regional saturation incident and capacity evidence.","Record a stale-data incident and freshness recovery.","Record a regional failover incident and recovery verification."],
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
    changeHistory: ["Record the dependency map before fault injection.","Record the first controlled dependency failure and its blast radius.","Record retry-policy changes and the effect on load.","Record the partial-network failure design and recovery changes."],
    incidentHistory: ["Record a dependency-collapse incident and recovery.","Record a retry-storm incident and bounded retry mitigation.","Record a partial-network failure incident and recovery verification."],
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
    changeHistory: ["Record the initial workload model and capacity assumptions.","Record each scaling change and the bottleneck it moves.","Record consistency, availability and caching design changes.","Record the final architecture revision after controlled stress."],
    incidentHistory: ["Record a capacity-collapse incident and bottleneck evidence.","Record cache-miss amplification and the mitigation.","Record a trade-off failure under load and the resulting redesign."],
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
