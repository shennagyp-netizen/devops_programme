import type { CourseLevel } from "./programme";

export type ProjectPhase = {
  id: string;
  title: string;
  objective: string;
  hours: number;
  exitEvidence: string[];
};

export type ProjectDefinition = {
  id: string;
  course: CourseLevel;
  title: string;
  objective: string;
  environment: string;
  estimatedHours: number;
  phases: ProjectPhase[];

  milestones: string[];
  competencyGates: string[];
  failureScenarios: string[];
  evidenceRequirements: string[];
  completionCriteria: string[];
  deliverables: string[];
  reviewGates: string[];
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
    estimatedHours: 18,
    phases: [
      { id: "B1-P1", title: "Baseline and service map", objective: "Build the known-good service picture before changing it.", hours: 4, exitEvidence: ["baseline request path", "process/runtime map"] },
      { id: "B1-P2", title: "Containerize and observe", objective: "Move the service into a repeatable container boundary and trace its path.", hours: 5, exitEvidence: ["image/runtime evidence", "container network evidence"] },
      { id: "B1-P3", title: "Incident and recovery", objective: "Create two different bounded failures, separate hypotheses, and prove recovery.", hours: 5, exitEvidence: ["failure timeline", "recovery evidence"] },
      { id: "B1-P4", title: "Harden and hand off", objective: "Document the operating model, reset path and prevention changes.", hours: 4, exitEvidence: ["runbook", "post-incident redesign"] },
    ],
    deliverables: ["service architecture sketch", "known-good baseline record", "failure/recovery incident report", "operator runbook"],
    reviewGates: ["clean baseline approved", "container boundary proven", "incident recovery proven", "handoff reviewed"],
    changeHistory: ["Record the known-good service and request-path baseline before containerization.","Record the containerization change, image identity and resulting runtime state.","Record the deliberate configuration or dependency change and the recovery evidence.","Record the redesign decision made after the first failure."],
    incidentHistory: ["Record a request-path incident with scope, observations and recovery verification.","Record a container or configuration incident without hiding the pre-change evidence.","Record the incident review and the prevention change added afterward."],
    milestones: [
      "Observe the service as a process",
      "Trace one request through DNS, transport and HTTP",
      "Containerize the service",
      "Break one configuration or dependency",
      "Recover and record the evidence",
      "Publish the baseline service map",
      "Repeat the container from a clean environment",
      "Write the incident review and prevention change",
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
    estimatedHours: 22,
    phases: [
      { id: "B2-P1", title: "Release engineering", objective: "Create a traceable change, checks and artifact identity.", hours: 5, exitEvidence: ["release identity", "automated check evidence"] },
      { id: "B2-P2", title: "Production observation", objective: "Deploy a known artifact and build a useful operational signal set.", hours: 5, exitEvidence: ["deployment evidence", "observability decision record"] },
      { id: "B2-P3", title: "Recovery operations", objective: "Run a bad-release and dependency-performance incident, including rollback or mitigation.", hours: 7, exitEvidence: ["incident timeline", "rollback/mitigation proof"] },
      { id: "B2-P4", title: "Recovery redesign", objective: "Test restore or rollback again from a clean baseline and write the prevention changes.", hours: 5, exitEvidence: ["recovery drill", "updated runbook"] },
    ],
    deliverables: ["release and artifact record", "observability decision record", "rollback/restore runbook", "release postmortem"],
    reviewGates: ["release traceability proven", "observability decision reviewed", "rollback proven", "postmortem accepted"],
    changeHistory: ["Record the release identity and automated checks before promotion.","Record the artifact promoted and the deployment change.","Record the observability or recovery change introduced after the first failure.","Record the rollback or restore procedure after it is tested."],
    incidentHistory: ["Record a bad-release incident and the evidence used to choose rollback.","Record a dependency-performance incident and its mitigation.","Record a restore or rollback incident and the verification that recovery was complete."],
    milestones: [
      "Create a release identity",
      "Run automated checks",
      "Deploy a known artifact",
      "Observe a controlled failure",
      "Restore from backup or rollback",
      "Define the rollback trigger before promotion",
      "Rehearse restore from a clean baseline",
      "Complete the release incident review",
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
    estimatedHours: 26,
    phases: [
      { id: "B3-P1", title: "Asynchronous architecture", objective: "Build producer, queue and worker paths and define expected load behavior.", hours: 6, exitEvidence: ["queue architecture", "baseline throughput evidence"] },
      { id: "B3-P2", title: "Retry and idempotency", objective: "Add bounded retry, idempotency and backpressure controls.", hours: 6, exitEvidence: ["retry behavior evidence", "idempotency proof"] },
      { id: "B3-P3", title: "Distributed incident", objective: "Inject slow consumers and dependency overload, then lead recovery.", hours: 8, exitEvidence: ["incident timeline", "recovery verification"] },
      { id: "B3-P4", title: "Redesign and defense", objective: "Quantify what changed, document trade-offs and defend the final design.", hours: 6, exitEvidence: ["trade-off record", "final system review"] },
    ],
    deliverables: ["queue architecture and load notes", "retry/idempotency design", "distributed incident report", "redesign review"],
    reviewGates: ["queue behavior understood", "retry safety proven", "distributed incident recovered", "redesign defended"],
    changeHistory: ["Record the baseline synchronous path before adding asynchronous work.","Record the producer, queue and consumer change and the expected protection it adds.","Record the retry and idempotency change and the observed effect.","Record the redesign after dependency failure."],
    incidentHistory: ["Record a slow-consumer incident and queue recovery.","Record a retry-amplification incident and the safe mitigation.","Record a downstream database or dependency incident and the recovery verification."],
    milestones: [
      "Add producer and consumer",
      "Observe queue growth",
      "Introduce retries and idempotency",
      "Inject dependency failure",
      "Run the first incident and verify recovery",
      "Measure queue arrival and service rates",
      "Bound retry admission under pressure",
      "Run a second incident with a different bottleneck",
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
    estimatedHours: 34,
    phases: [
      { id: "I1-P1", title: "Platform baseline", objective: "Build the Kubernetes workload, namespaces, services and initial request path.", hours: 8, exitEvidence: ["cluster topology", "known-good reachability"] },
      { id: "I1-P2", title: "State and health", objective: "Add configuration, storage and probes; prove rollout behavior.", hours: 8, exitEvidence: ["state lifecycle evidence", "health/rollout evidence"] },
      { id: "I1-P3", title: "Failure operations", objective: "Break image, selector and health paths in separate incidents and recover each.", hours: 10, exitEvidence: ["three incident records", "recovery proof"] },
      { id: "I1-P4", title: "Scaling and runbook", objective: "Exercise scaling, reset the environment, and publish an operator runbook.", hours: 8, exitEvidence: ["scaling evidence", "operator runbook"] },
    ],
    deliverables: ["Kubernetes topology", "state and health runbook", "three incident records", "operator runbook"],
    reviewGates: ["platform baseline healthy", "state/health behavior proven", "three failures recovered", "operator runbook reviewed"],
    changeHistory: ["Record the initial Kubernetes deployment and service topology.","Record configuration, storage and health-probe changes with rollout evidence.","Record the scaling change and its effect on the request path.","Record the redesign after a controlled Kubernetes failure."],
    incidentHistory: ["Record an image or deployment failure with pod evidence.","Record a service or selector/networking failure and recovery.","Record a health or storage failure and recovery verification."],
    milestones: [
      "Deploy the container",
      "Expose it through a service",
      "Add configuration and storage",
      "Add health probes",
      "Scale and break the deployment",
      "Recover from a Kubernetes failure",
      "Validate namespace and configuration boundaries",
      "Rehearse storage recovery",
      "Publish the operator runbook",
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
    estimatedHours: 36,
    phases: [
      { id: "I2-P1", title: "Infrastructure foundation", objective: "Review and apply controlled infrastructure changes from repeatable plans.", hours: 8, exitEvidence: ["plan/apply evidence", "change review"] },
      { id: "I2-P2", title: "Operational visibility", objective: "Instrument logs, metrics and traces around explicit operational questions.", hours: 8, exitEvidence: ["signal map", "SLO proposal"] },
      { id: "I2-P3", title: "Drift and release incident", objective: "Create drift and deployment failures, diagnose with telemetry, and roll back safely.", hours: 10, exitEvidence: ["incident timeline", "rollback proof"] },
      { id: "I2-P4", title: "Reliability review", objective: "Tune SLOs, alerting and change controls using evidence from the incidents.", hours: 10, exitEvidence: ["SLO decision", "reliability review"] },
    ],
    deliverables: ["infrastructure change record", "signal/SLO map", "drift and rollback reports", "reliability review"],
    reviewGates: ["infrastructure change reproducible", "signals answer operational questions", "rollback proven under failure", "SLO review accepted"],
    changeHistory: ["Record the baseline infrastructure plan and applied resources.","Record the observability instrumentation and signal changes.","Record the SLO and alerting changes.","Record the rollback procedure after a controlled infrastructure change."],
    incidentHistory: ["Record a configuration-drift incident and its evidence.","Record a deployment failure and rollback decision.","Record an observability-gap incident and the telemetry redesign."],
    milestones: [
      "Review an infrastructure plan",
      "Apply a controlled change",
      "Capture logs, metrics and traces",
      "Define an SLO",
      "Perform a controlled rollback",
      "Create configuration-drift detection",
      "Test an alert before the controlled failure",
      "Run and review a second rollback",
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
    estimatedHours: 42,
    phases: [
      { id: "I3-P1", title: "Integrated platform", objective: "Combine application, Kubernetes and infrastructure into one production-like path.", hours: 10, exitEvidence: ["end-to-end topology", "baseline evidence"] },
      { id: "I3-P2", title: "Database behavior", objective: "Add data-path failure cases and prove recovery objectives.", hours: 10, exitEvidence: ["database incident record", "RPO/RTO evidence"] },
      { id: "I3-P3", title: "Distributed incident command", objective: "Run a cross-layer dependency failure with observability gaps and lead the response.", hours: 12, exitEvidence: ["incident command log", "recovery proof"] },
      { id: "I3-P4", title: "Disaster recovery and redesign", objective: "Run recovery from a clean baseline and defend the architecture after the incident.", hours: 10, exitEvidence: ["DR exercise", "post-incident redesign"] },
    ],
    deliverables: ["integrated architecture", "RPO/RTO and database recovery plan", "cross-layer incident report", "DR postmortem"],
    reviewGates: ["cross-layer baseline proven", "recovery objectives tested", "incident command proven", "DR review accepted"],
    changeHistory: ["Record integration changes across application, Kubernetes and infrastructure.","Record database behavior and recovery-path changes.","Record the disaster-recovery design and tested recovery changes.","Record post-incident redesign decisions."],
    incidentHistory: ["Record a database degradation incident across all relevant layers.","Record a distributed dependency failure and recovery.","Record a disaster-recovery exercise and the resulting corrective actions."],
    milestones: [
      "Integrate I1 and I2",
      "Add database behavior",
      "Run a distributed failure",
      "Perform disaster recovery",
      "Lead an incident review",
      "Define explicit RPO and RTO",
      "Rehearse dependency failover",
      "Complete the disaster-recovery postmortem",
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
    estimatedHours: 42,
    phases: [
      { id: "A1-P1", title: "Capacity model", objective: "Build workload and capacity assumptions, including queueing and survivor headroom.", hours: 10, exitEvidence: ["capacity model", "bottleneck evidence"] },
      { id: "A1-P2", title: "Global traffic", objective: "Add regions, global routing and locality-aware service behavior.", hours: 10, exitEvidence: ["routing policy", "regional evidence"] },
      { id: "A1-P3", title: "Regional failure", objective: "Inject saturation and regional failure, then prove survivor capacity and data behavior.", hours: 12, exitEvidence: ["regional incident record", "failover proof"] },
      { id: "A1-P4", title: "Architecture defense", objective: "Document trade-offs, recovery limits and cost/performance constraints.", hours: 10, exitEvidence: ["architecture review", "recovery decision record"] },
    ],
    deliverables: ["capacity model", "global routing and locality design", "regional failure report", "architecture defense"],
    reviewGates: ["capacity model justified", "traffic policy exercised", "regional failure recovered", "architecture trade-offs defended"],
    changeHistory: ["Record the baseline workload and single-region capacity assumptions.","Record the second-region deployment and global traffic policy.","Record caching or replica changes and the resulting locality behavior.","Record the redesign after a regional failure."],
    incidentHistory: ["Record a regional saturation incident and capacity evidence.","Record a stale-data incident and freshness recovery.","Record a regional failover incident and recovery verification."],
    milestones: [
      "Model capacity",
      "Deploy two regions",
      "Route global traffic",
      "Add local caching or replicas",
      "Inject a regional failure",
      "Model survivor capacity after a region loss",
      "Test traffic policy during failover",
      "Measure data freshness after recovery",
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
    estimatedHours: 40,
    phases: [
      { id: "A2-P1", title: "Dependency graph", objective: "Map critical dependencies and define failure blast-radius hypotheses.", hours: 9, exitEvidence: ["dependency map", "failure hypotheses"] },
      { id: "A2-P2", title: "Fault injection", objective: "Break a dependency and a partial network path under controlled conditions.", hours: 10, exitEvidence: ["fault-injection record", "observed blast radius"] },
      { id: "A2-P3", title: "Retry storm response", objective: "Create retry pressure, tune backoff/jitter and protect the failing dependency.", hours: 11, exitEvidence: ["retry load evidence", "mitigation proof"] },
      { id: "A2-P4", title: "Resilience redesign", objective: "Prove bounded recovery and redesign the system to reduce repeat failure.", hours: 10, exitEvidence: ["resilience review", "recovery verification"] },
    ],
    deliverables: ["dependency/failure map", "fault-injection plan", "retry-storm analysis", "resilience redesign"],
    reviewGates: ["dependency map reviewed", "fault injection bounded", "retry pressure controlled", "resilience redesign proven"],
    changeHistory: ["Record the dependency map before fault injection.","Record the first controlled dependency failure and its blast radius.","Record retry-policy changes and the effect on load.","Record the partial-network failure design and recovery changes."],
    incidentHistory: ["Record a dependency-collapse incident and recovery.","Record a retry-storm incident and bounded retry mitigation.","Record a partial-network failure incident and recovery verification."],
    milestones: [
      "Map dependencies",
      "Break one dependency",
      "Create retry pressure",
      "Inject partial network failure",
      "Recover and verify",
      "Define fault-injection safety controls",
      "Measure blast radius at each boundary",
      "Run a recovery game day",
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
    estimatedHours: 48,
    phases: [
      { id: "A3-P1", title: "Workload science", objective: "Build a workload model and quantify latency, throughput and capacity limits.", hours: 12, exitEvidence: ["workload model", "capacity baseline"] },
      { id: "A3-P2", title: "Scale bottlenecks", objective: "Scale one layer at a time and measure where the bottleneck moves.", hours: 12, exitEvidence: ["before/after load evidence", "bottleneck record"] },
      { id: "A3-P3", title: "Consistency and availability", objective: "Test cache, replication and consistency choices under realistic pressure.", hours: 12, exitEvidence: ["trade-off evidence", "failure behavior record"] },
      { id: "A3-P4", title: "Executive technical defense", objective: "Defend the final architecture, failure plan, cost assumptions and redesign.", hours: 12, exitEvidence: ["architecture defense", "final incident/recovery report"] },
    ],
    deliverables: ["workload/capacity model", "bottleneck experiments", "consistency/availability trade-off record", "final architecture defense"],
    reviewGates: ["workload model quantified", "bottleneck movement measured", "trade-offs tested", "final architecture defended"],
    changeHistory: ["Record the initial workload model and capacity assumptions.","Record each scaling change and the bottleneck it moves.","Record consistency, availability and caching design changes.","Record the final architecture revision after controlled stress."],
    incidentHistory: ["Record a capacity-collapse incident and bottleneck evidence.","Record cache-miss amplification and the mitigation.","Record a trade-off failure under load and the resulting redesign."],
    milestones: [
      "Build a workload model",
      "Find the first bottleneck",
      "Scale and move the bottleneck",
      "Review consistency and availability choices",
      "Defend the architecture with evidence",
      "Define workload classes",
      "Run a bottleneck-transition experiment",
      "Conduct the final architecture and cost review",
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

