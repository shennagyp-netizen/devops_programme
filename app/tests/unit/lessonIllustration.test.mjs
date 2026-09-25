import { describe, expect, it } from "vitest";
import {
  getLessonIllustrationModel,
  validateLessonIllustrationModel
} from "../../src/data/lessonIllustration.ts";

describe("lesson illustration teaching model", () => {
  it("turns the B1.4 container visual into a concrete causal model", () => {
    const model = getLessonIllustrationModel({
      id: "b1-4-isolation",
      type: "illustration",
      heading: "The isolation boundary",
      alt: "A container starts from an image, runs a process, and shares the host kernel",
      bindingId: "B1.4:b1-4-isolation",
      nodes: ["Image", "Container", "Process"],
      variant: "container-boundary-v1",
      caption: "Image, container and process are different layers."
    });

    expect(model.variant).toBe("container-boundary-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "image",
      "container",
      "process"
    ]);
    expect(model.foundation.label).toBe("Shared host kernel");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "persistent-data",
      "published-port"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "process-listening",
      "container-port",
      "host-port",
      "network-path"
    ]);
  });

  it("does not silently invent a specialized visual for unknown lessons", () => {
    const model = getLessonIllustrationModel({
      id: "generic",
      type: "illustration",
      heading: "A generic flow",
      alt: "A generic causal flow",
      bindingId: "generic:visual",
      nodes: ["Problem", "Mechanism", "Evidence"]
    });

    expect(model.variant).toBe("causal-flow-v1");
    expect(model.stages.map((stage) => stage.label)).toEqual([
      "Problem",
      "Mechanism",
      "Evidence"
    ]);
    expect(model.foundation).toBeUndefined();
  });
});




  it("models terminal work as a composed evidence flow", () => {
    const model = getLessonIllustrationModel({
      id: "d1-2-terminal-tool",
      type: "illustration",
      heading: "The terminal as an evidence pipeline",
      alt: "A diagnostic question is answered by composing commands, transforming output, routing it through pipes or files, and interpreting the resulting evidence",
      bindingId: "D1.2:d1-2-terminal-tool",
      nodes: ["Question", "Producer", "Transform", "Route", "Evidence"],
      variant: "terminal-composition-v1"
    });

    expect(model.variant).toBe("terminal-composition-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "question",
      "producer",
      "transform",
      "route",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("Small tools become a dataflow system");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "pipes",
      "redirection",
      "filtering",
      "stderr"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "right-question",
      "right-producer",
      "output-routing",
      "evidence-meaning"
    ]);
  });

  it("models the Linux operating model from application work to kernel-managed evidence", () => {
    const model = getLessonIllustrationModel({
      id: "d1-1-linux-model",
      type: "illustration",
      heading: "The Linux operating model",
      alt: "Application work runs as processes that request kernel-managed CPU, memory, files and network resources, which operators inspect as evidence",
      bindingId: "D1.1:d1-1-linux-model",
      nodes: ["Application", "Process", "Kernel", "Resources", "Evidence"],
      variant: "linux-operating-model-v1"
    });

    expect(model.variant).toBe("linux-operating-model-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "application",
      "process",
      "kernel",
      "resources",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("The kernel mediates access to shared resources");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "process-state",
      "file-descriptors",
      "signals",
      "observability"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "process-identity",
      "kernel-resource",
      "execution-context",
      "evidence-sequence"
    ]);
  });

  it("models process diagnosis from symptom to process, resource, dependency and proof", () => {
    const model = getLessonIllustrationModel({
      id: "b1-1-process-diagnosis",
      type: "illustration",
      heading: "From symptom to process evidence",
      alt: "A slow application symptom is narrowed to a process, resource or dependency and then verified with evidence",
      bindingId: "B1.1:b1-1-process-diagnosis",
      nodes: ["Symptom", "Process", "Resource", "Dependency", "Proof"],
      variant: "process-diagnosis-v1"
    });

    expect(model.variant).toBe("process-diagnosis-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "symptom",
      "process",
      "resource",
      "dependency",
      "proof"
    ]);
    expect(model.foundation.label).toBe("A process is code running with state and resources");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "ps",
      "open-endpoints",
      "cpu-trap",
      "state"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "scope-symptom",
      "process-identity",
      "resource-or-wait",
      "evidence-proof"
    ]);
  });

  it("models an incident as impact, scope, evidence, mitigation, recovery and learning", () => {
    const model = getLessonIllustrationModel({
      id: "b3-2-incident",
      type: "illustration",
      heading: "The incident loop",
      alt: "A production incident moves from user impact through scoping and evidence to mitigation, stable recovery and follow-up learning",
      bindingId: "B3.2:b3-2-incident",
      nodes: ["Impact", "Scope", "Evidence", "Mitigate", "Recover", "Learn"],
      variant: "incident-loop-v1"
    });

    expect(model.variant).toBe("incident-loop-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "impact",
      "scope",
      "evidence",
      "mitigate",
      "recover",
      "learn"
    ]);
    expect(model.foundation.label).toBe("Reduce harm before chasing a perfect explanation");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "timeline",
      "change-identity",
      "blast-radius",
      "recovery-proof"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "user-impact",
      "first-signal",
      "safe-action",
      "stable-recovery"
    ]);
  });

  it("models queue work as producer, queued state, consumer and outcome", () => {
    const model = getLessonIllustrationModel({
      id: "b3-1-queue",
      type: "illustration",
      heading: "Where the work is now",
      alt: "Work moves from a producer into a queue, through a consumer, and into an outcome while queue depth and duplicate delivery remain visible",
      bindingId: "B3.1:b3-1-queue",
      nodes: ["Producer", "Queue", "Consumer", "Outcome"],
      variant: "queue-state-v1"
    });

    expect(model.variant).toBe("queue-state-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "producer",
      "queue",
      "consumer",
      "outcome"
    ]);
    expect(model.foundation.label).toBe("Backpressure");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "retry",
      "idempotency",
      "dead-letter"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "arrival-rate",
      "queue-depth",
      "consumer-throughput",
      "duplicate-safety"
    ]);
  });

  it("models recovery as backup, restore, compatibility and proven service recovery", () => {
    const model = getLessonIllustrationModel({
      id: "b2-3-recovery",
      type: "illustration",
      heading: "From backup to recovery",
      alt: "A system backup is restored into a safe target, checked for compatibility, verified, and returned to a working service state",
      bindingId: "B2.3:b2-3-recovery",
      nodes: ["Backup", "Restore", "Compatibility", "Verify", "Recover"],
      variant: "backup-recovery-v1"
    });

    expect(model.variant).toBe("backup-recovery-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "backup",
      "restore",
      "compatibility",
      "verify",
      "recover"
    ]);
    expect(model.foundation.label).toBe("RPO + RTO");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "backup-age",
      "restore-target",
      "encryption-key"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "backup-usable",
      "restore-works",
      "application-compatible",
      "user-recovery"
    ]);
  });

  it("models observability as a diagnosis path from vague symptom to correlated proof", () => {
    const model = getLessonIllustrationModel({
      id: "b2-2-observability",
      type: "illustration",
      heading: "From symptom to evidence",
      alt: "A vague slow-service report becomes scoped evidence across request latency, service signals, dependency signals and proof",
      bindingId: "B2.2:b2-2-observability",
      nodes: ["Symptom", "Scope", "Service", "Dependency", "Proof"],
      variant: "observability-diagnosis-v1"
    });

    expect(model.variant).toBe("observability-diagnosis-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "symptom",
      "scope",
      "service",
      "dependency",
      "proof"
    ]);
    expect(model.foundation.label).toBe("Signals answer different questions");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "metrics",
      "logs",
      "health",
      "traces"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "scope-question",
      "correlated-change",
      "alternative-cause",
      "recovery-proof"
    ]);
  });

  it("models database scaling as query path, correctness, copies, distribution and evidence", () => {
    const model = getLessonIllustrationModel({
      id: "d5-2-database-scale",
      type: "illustration",
      heading: "The database scaling path",
      alt: "A database workload follows an access path, preserves transaction correctness, expands through copies or partitioning, and is evaluated with evidence",
      bindingId: "D5.2:d5-2-database-scale",
      nodes: ["Query", "Access Path", "Correctness", "Copies", "Distribution", "Evidence"],
      variant: "database-scale-v1"
    });

    expect(model.variant).toBe("database-scale-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "query",
      "access-path",
      "correctness",
      "copies",
      "distribution",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("Capacity changes must preserve data correctness");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "index",
      "transactions",
      "replication",
      "partitioning"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "query-cost",
      "write-correctness",
      "replica-freshness",
      "partition-scope"
    ]);
  });

  it("models scaling as workload, capacity, distribution, shared state, bottleneck and evidence", () => {
    const model = getLessonIllustrationModel({
      id: "d5-1-scaling",
      type: "illustration",
      heading: "The scaling control path",
      alt: "Rising workload meets capacity limits, is distributed across instances, constrained by shared state, and diagnosed through the active bottleneck and evidence",
      bindingId: "D5.1:d5-1-scaling",
      nodes: ["Workload", "Capacity", "Distribution", "Shared State", "Bottleneck", "Evidence"],
      variant: "scaling-control-loop-v1"
    });

    expect(model.variant).toBe("scaling-control-loop-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "workload",
      "capacity",
      "distribution",
      "shared-state",
      "bottleneck",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("Scaling is a system property, not a server-size property");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "vertical",
      "horizontal",
      "stateless",
      "buffer"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "first-limit",
      "shared-state",
      "moved-bottleneck",
      "user-proof"
    ]);
  });

  it("models cloud architecture as workload, compute, network, state, identity and data services", () => {
    const model = getLessonIllustrationModel({
      id: "d4-6-cloud-primitives",
      type: "illustration",
      heading: "The provider-neutral cloud architecture",
      alt: "A workload is built from compute, network, state, identity and data services with dependencies and managed boundaries",
      bindingId: "D4.6:d4-6-cloud-primitives",
      nodes: ["Workload", "Compute", "Network", "State", "Identity", "Data Services"],
      variant: "cloud-primitives-v1"
    });

    expect(model.variant).toBe("cloud-primitives-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "workload",
      "compute",
      "network",
      "state",
      "identity",
      "data-services"
    ]);
    expect(model.foundation.label).toBe("Cloud products are implementations of infrastructure primitives");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "managed-boundary",
      "dependency-graph",
      "identity",
      "cost"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "bottleneck",
      "network-boundary",
      "state-owner",
      "access-model"
    ]);
  });

  it("models Terraform lifecycle as configuration, init, plan, apply and observe", () => {
    const model = getLessonIllustrationModel({
      id: "d4-5-terraform-lifecycle",
      type: "illustration",
      heading: "The Terraform lifecycle",
      alt: "Terraform loads configuration, initializes providers and state, creates a plan, applies changes and then observes the resulting infrastructure",
      bindingId: "D4.5:d4-5-terraform-lifecycle",
      nodes: ["Configuration", "Init", "Plan", "Apply", "Observe"],
      variant: "terraform-lifecycle-v1"
    });

    expect(model.variant).toBe("terraform-lifecycle-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "configuration",
      "init",
      "plan",
      "apply",
      "observe"
    ]);
    expect(model.foundation.label).toBe("Terraform is a lifecycle around desired configuration and provider state");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "init",
      "plan",
      "state-lock",
      "destroy"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "init-context",
      "plan-scope",
      "apply-result",
      "state-coordination"
    ]);
  });

  it("models IaC as intent, plan, apply, state and drift", () => {
    const model = getLessonIllustrationModel({
      id: "d4-4-iac",
      type: "illustration",
      heading: "The Infrastructure as Code control loop",
      alt: "Declared infrastructure intent is planned, applied to real resources, recorded in state and compared for drift",
      bindingId: "D4.4:d4-4-iac",
      nodes: ["Intent", "Plan", "Apply", "State", "Drift"],
      variant: "iac-control-loop-v1"
    });

    expect(model.variant).toBe("iac-control-loop-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "intent",
      "plan",
      "apply",
      "state",
      "drift"
    ]);
    expect(model.foundation.label).toBe("Declarative infrastructure separates desired intent from real resources");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "desired-state",
      "plan",
      "state",
      "drift"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "code-review",
      "plan-difference",
      "apply-result",
      "drift-detection"
    ]);
  });

  it("models GitHub Actions as workflow, job, runner, steps and artifact", () => {
    const model = getLessonIllustrationModel({
      id: "d4-3-github-actions",
      type: "illustration",
      heading: "The GitHub Actions execution model",
      alt: "A workflow creates jobs that run on runners through ordered steps and produce artifacts while caches and secrets serve separate purposes",
      bindingId: "D4.3:d4-3-github-actions",
      nodes: ["Workflow", "Job", "Runner", "Steps", "Artifact"],
      variant: "github-actions-execution-v1"
    });

    expect(model.variant).toBe("github-actions-execution-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "workflow",
      "job",
      "runner",
      "steps",
      "artifact"
    ]);
    expect(model.foundation.label).toBe("GitHub Actions encodes the pipeline; it does not replace the control model");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "runner",
      "cache",
      "artifact",
      "secrets"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "job-context",
      "step-log",
      "output-identity",
      "secret-boundary"
    ]);
  });

  it("models CI/CD as source, validation, artifact, promotion and verification", () => {
    const model = getLessonIllustrationModel({
      id: "d4-2-cicd",
      type: "illustration",
      heading: "The CI/CD control path",
      alt: "A source change is validated, built into an identified artifact, promoted through controlled environments and verified after deployment",
      bindingId: "D4.2:d4-2-cicd",
      nodes: ["Source", "Validate", "Artifact", "Promote", "Verify"],
      variant: "cicd-control-path-v1"
    });

    expect(model.variant).toBe("cicd-control-path-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "source",
      "validate",
      "artifact",
      "promote",
      "verify"
    ]);
    expect(model.foundation.label).toBe("A pipeline is a control system, not a YAML file");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "gates",
      "build-once",
      "environment",
      "provenance"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "source-identity",
      "validation-evidence",
      "artifact-identity",
      "runtime-proof"
    ]);
  });

  it("models Git production workflow as change, review, commit, release and recovery", () => {
    const model = getLessonIllustrationModel({
      id: "d4-1-git-production-workflow",
      type: "illustration",
      heading: "The production Git workflow",
      alt: "A code change moves through review, commit, release identity, deployment evidence and rollback recovery",
      bindingId: "D4.1:d4-1-git-production-workflow",
      nodes: ["Change", "Review", "Commit", "Release", "Recovery"],
      variant: "git-production-workflow-v1"
    });

    expect(model.variant).toBe("git-production-workflow-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "change",
      "review",
      "commit",
      "release",
      "recovery"
    ]);
    expect(model.foundation.label).toBe("Git history becomes operational evidence");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "branch",
      "commit",
      "release-tag",
      "revert"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "change-trace",
      "reviewed-change",
      "release-identity",
      "rollback-path"
    ]);
  });

  it("models Kubernetes failure diagnosis as baseline, fault, symptom, evidence and recovery", () => {
    const model = getLessonIllustrationModel({
      id: "d3-5-kubernetes-failure",
      type: "illustration",
      heading: "The Kubernetes failure loop",
      alt: "A known-good Kubernetes workload is changed at one boundary, a symptom appears, evidence narrows the cause, and the workload is recovered",
      bindingId: "D3.5:d3-5-kubernetes-failure",
      nodes: ["Baseline", "Fault", "Symptom", "Evidence", "Recovery"],
      variant: "kubernetes-failure-loop-v1"
    });

    expect(model.variant).toBe("kubernetes-failure-loop-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "baseline",
      "fault",
      "symptom",
      "evidence",
      "recovery"
    ]);
    expect(model.foundation.label).toBe("A Kubernetes status is a clue, not the diagnosis");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "events",
      "describe",
      "logs",
      "health"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "hypothesis",
      "boundary",
      "evidence-sequence",
      "recovery-proof"
    ]);
  });

  it("models Kubernetes health and scaling as startup, readiness, liveness, capacity and rollout", () => {
    const model = getLessonIllustrationModel({
      id: "d3-4-kubernetes-health-scaling",
      type: "illustration",
      heading: "The Kubernetes health and scaling path",
      alt: "A workload starts, becomes ready for traffic, is kept alive by liveness checks, scales with resource and replica decisions, and rolls out a new version",
      bindingId: "D3.4:d3-4-kubernetes-health-scaling",
      nodes: ["Startup", "Readiness", "Liveness", "Capacity", "Rollout"],
      variant: "kubernetes-health-scaling-v1"
    });

    expect(model.variant).toBe("kubernetes-health-scaling-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "startup",
      "readiness",
      "liveness",
      "capacity",
      "rollout"
    ]);
    expect(model.foundation.label).toBe("Running, ready and scalable are different states");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "startup-probe",
      "readiness-probe",
      "liveness-probe",
      "resources"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "startup-state",
      "traffic-state",
      "restart-state",
      "capacity-state"
    ]);
  });

  it("models Kubernetes configuration and storage as separate lifecycles", () => {
    const model = getLessonIllustrationModel({
      id: "d3-3-kubernetes-config-storage",
      type: "illustration",
      heading: "Configuration, secrets and persistent data",
      alt: "A Kubernetes workload receives configuration and secrets, mounts them into a Pod, and stores persistent data through a volume-backed storage boundary",
      bindingId: "D3.3:d3-3-kubernetes-config-storage",
      nodes: ["Config", "Secret", "Mount", "Pod", "Persistence"],
      variant: "kubernetes-config-storage-v1"
    });

    expect(model.variant).toBe("kubernetes-config-storage-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "config",
      "secret",
      "mount",
      "pod",
      "persistence"
    ]);
    expect(model.foundation.label).toBe("Configuration, secrets and persistent data have different lifecycles");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "configmap",
      "secret",
      "mount",
      "volume"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "config-source",
      "secret-consumption",
      "mount-path",
      "data-survival"
    ]);
  });

  it("models Kubernetes networking as service, selector, endpoint set, pod and evidence", () => {
    const model = getLessonIllustrationModel({
      id: "d3-2-kubernetes-networking",
      type: "illustration",
      heading: "The Kubernetes network path",
      alt: "A client resolves a Kubernetes Service, the selector determines its endpoint set, traffic reaches a selected Pod, and evidence exposes the path",
      bindingId: "D3.2:d3-2-kubernetes-networking",
      nodes: ["Service", "Selector", "Endpoint set", "Pod", "Evidence"],
      variant: "kubernetes-networking-v1"
    });

    expect(model.variant).toBe("kubernetes-networking-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "service",
      "selector",
      "endpoint-set",
      "pod",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("A Service is a stable abstraction over a changing set of Pods");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "service-identity",
      "selector",
      "endpoints",
      "pod-readiness"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "service-lookup",
      "selector-match",
      "endpoint-membership",
      "traffic-proof"
    ]);
  });

  it("models Kubernetes reconciliation as desired state, controller, observation, action and convergence", () => {
    const model = getLessonIllustrationModel({
      id: "d3-1-kubernetes-model",
      type: "illustration",
      heading: "The Kubernetes reconciliation loop",
      alt: "Kubernetes compares desired state with actual state, a controller acts, and the system moves toward the desired state",
      bindingId: "D3.1:d3-1-kubernetes-model",
      nodes: ["Desired State", "Controller", "Observe", "Act", "Converge"],
      variant: "kubernetes-reconciliation-v1"
    });

    expect(model.variant).toBe("kubernetes-reconciliation-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "desired-state",
      "controller",
      "observe",
      "act",
      "converge"
    ]);
    expect(model.foundation.label).toBe("Kubernetes is a reconciliation system");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "desired-state",
      "controller",
      "actual-state",
      "feasibility"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "specification",
      "controller-action",
      "replacement-health",
      "feasibility"
    ]);
  });

  it("models controlled Docker failure as hypothesis, change, symptom, evidence and recovery", () => {
    const model = getLessonIllustrationModel({
      id: "d2-7-break-docker",
      type: "illustration",
      heading: "The controlled Docker failure loop",
      alt: "A known-good Docker stack is changed in one place, a predicted symptom is observed, evidence identifies the boundary, and the system is restored",
      bindingId: "D2.7:d2-7-break-docker",
      nodes: ["Baseline", "Change", "Symptom", "Evidence", "Recovery"],
      variant: "docker-failure-loop-v1"
    });

    expect(model.variant).toBe("docker-failure-loop-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "baseline",
      "change",
      "symptom",
      "evidence",
      "recovery"
    ]);
    expect(model.foundation.label).toBe("Change one boundary, predict one symptom, collect evidence, then recover");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "single-change",
      "prediction",
      "evidence",
      "recovery-proof"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "process",
      "network",
      "configuration",
      "storage"
    ]);
  });

  it("models Docker networking and storage as service, network, name, port and volume boundaries", () => {
    const model = getLessonIllustrationModel({
      id: "d2-6-docker-network-storage",
      type: "illustration",
      heading: "The Docker service boundary",
      alt: "A Docker service connects through a network and service name to a port while persistent data lives in a volume",
      bindingId: "D2.6:d2-6-docker-network-storage",
      nodes: ["Service", "Network", "Name", "Port", "Volume"],
      variant: "docker-network-storage-v1"
    });

    expect(model.variant).toBe("docker-network-storage-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "service",
      "network",
      "name",
      "port",
      "volume"
    ]);
    expect(model.foundation.label).toBe("Service discovery, published ports and persistent data are different boundaries");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "internal-network",
      "service-name",
      "published-port",
      "volume"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "name-resolution",
      "internal-connectivity",
      "published-access",
      "data-persistence"
    ]);
  });

  it("models containers as image, container, process, namespaces and host kernel", () => {
    const model = getLessonIllustrationModel({
      id: "d2-5-containers",
      type: "illustration",
      heading: "The container execution model",
      alt: "An image creates a container that runs a process inside isolated namespaces while sharing the host kernel",
      bindingId: "D2.5:d2-5-containers",
      nodes: ["Image", "Container", "Process", "Namespaces", "Host Kernel"],
      variant: "container-execution-v1"
    });

    expect(model.variant).toBe("container-execution-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "image",
      "container",
      "process",
      "namespaces",
      "host-kernel"
    ]);
    expect(model.foundation.label).toBe("A container is an isolated process environment, not a virtual machine");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "image",
      "lifecycle",
      "namespaces",
      "kernel"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "process-command",
      "filesystem",
      "namespace-view",
      "kernel-assumption"
    ]);
  });

  it("models HTTPS as certificate identity, handshake, secure session and evidence", () => {
    const model = getLessonIllustrationModel({
      id: "d2-4-tls",
      type: "illustration",
      heading: "The HTTPS trust path",
      alt: "A client checks a server certificate, completes a TLS handshake, establishes a protected session and interprets trust evidence",
      bindingId: "D2.4:d2-4-tls",
      nodes: ["Client", "Certificate", "Handshake", "Secure Session", "Evidence"],
      variant: "tls-trust-v1"
    });

    expect(model.variant).toBe("tls-trust-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "client",
      "certificate",
      "handshake",
      "secure-session",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("Encryption and authentication are related but not identical");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "certificate-chain",
      "hostname",
      "private-key",
      "trust"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "identity-match",
      "certificate-validity",
      "handshake",
      "application-proof"
    ]);
  });

  it("models HTTP as an application exchange from request to response evidence", () => {
    const model = getLessonIllustrationModel({
      id: "d2-3-http",
      type: "illustration",
      heading: "The HTTP exchange",
      alt: "An HTTP request carries method, path and headers to an application route that returns a status, headers and body for the client to interpret",
      bindingId: "D2.3:d2-3-http",
      nodes: ["Request", "Headers", "Route", "Response", "Evidence"],
      variant: "http-exchange-v1"
    });

    expect(model.variant).toBe("http-exchange-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "request",
      "headers",
      "route",
      "response",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("HTTP is an application protocol, not the network itself");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "request-line",
      "status-code",
      "headers",
      "body"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "request-shape",
      "route-selection",
      "status-meaning",
      "user-proof"
    ]);
  });

  it("models DNS as a naming path from query to resolver, authority and freshness", () => {
    const model = getLessonIllustrationModel({
      id: "d2-2-dns",
      type: "illustration",
      heading: "The DNS answer path",
      alt: "A DNS name is queried through a resolver that may use cached data or ask authoritative servers, with record type and TTL shaping the answer",
      bindingId: "D2.2:d2-2-dns",
      nodes: ["Name", "Resolver", "Cache", "Authority", "Freshness"],
      variant: "dns-resolution-v1"
    });

    expect(model.variant).toBe("dns-resolution-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "name",
      "resolver",
      "cache",
      "authority",
      "freshness"
    ]);
    expect(model.foundation.label).toBe("DNS is a distributed naming system");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "recursive-resolver",
      "authoritative-server",
      "record-types",
      "ttl-cache"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "resolver-used",
      "record-type",
      "authoritative-data",
      "freshness"
    ]);
  });

  it("models TCP and UDP as distinct transport contracts", () => {
    const model = getLessonIllustrationModel({
      id: "d2-1-transport",
      type: "illustration",
      heading: "The transport contract",
      alt: "An endpoint selects TCP or UDP for a port, with different delivery behavior and evidence at the transport layer",
      bindingId: "D2.1:d2-1-transport",
      nodes: ["Endpoint", "Port", "Transport", "Delivery", "Evidence"],
      variant: "transport-contract-v1"
    });

    expect(model.variant).toBe("transport-contract-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "endpoint",
      "port",
      "transport",
      "delivery",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("IP reaches the host; transport reaches the service");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "tcp",
      "udp",
      "socket",
      "failure-signals"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "port-listen",
      "transport-choice",
      "connection-state",
      "application-response"
    ]);
  });

  it("models routing as destination, route, next hop, boundary and evidence", () => {
    const model = getLessonIllustrationModel({
      id: "d1-6-routing-model",
      type: "illustration",
      heading: "The routing decision",
      alt: "A destination address is matched against routes, sent to a next hop across a boundary, and verified with path evidence",
      bindingId: "D1.6:d1-6-routing-model",
      nodes: ["Destination", "Route", "Next hop", "Boundary", "Evidence"],
      variant: "routing-boundary-v1"
    });

    expect(model.variant).toBe("routing-boundary-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "destination",
      "route",
      "next-hop",
      "boundary",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("Routing chooses where the packet goes next");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "specific-route",
      "default-route",
      "gateway",
      "nat"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "destination-match",
      "next-hop",
      "return-path",
      "boundary-change"
    ]);
  });

  it("models CIDR as an explicit network boundary from address to verified range", () => {
    const model = getLessonIllustrationModel({
      id: "d1-5-cidr-model",
      type: "illustration",
      heading: "The subnet boundary",
      alt: "An IP address is split by a CIDR prefix into network and host space, producing a defined range that can be verified",
      bindingId: "D1.5:d1-5-cidr-model",
      nodes: ["Address", "Prefix", "Boundary", "Range", "Verify"],
      variant: "cidr-boundary-v1"
    });

    expect(model.variant).toBe("cidr-boundary-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "address",
      "prefix",
      "boundary",
      "range",
      "verify"
    ]);
    expect(model.foundation.label).toBe("CIDR describes a network boundary");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "network-bits",
      "host-bits",
      "block-size",
      "segmentation"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "network-boundary",
      "usable-range",
      "same-subnet",
      "route-fit"
    ]);
  });

  it("models networking from interface and link to IP, route and evidence", () => {
    const model = getLessonIllustrationModel({
      id: "d1-4-network-model",
      type: "illustration",
      heading: "The network operating model",
      alt: "A networked host uses an interface and local link to reach an IP destination through routing, with each layer producing different evidence",
      bindingId: "D1.4:d1-4-network-model",
      nodes: ["Interface", "Link", "IP", "Route", "Evidence"],
      variant: "network-operating-model-v1"
    });

    expect(model.variant).toBe("network-operating-model-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "interface",
      "link",
      "ip",
      "route",
      "evidence"
    ]);
    expect(model.foundation.label).toBe("Different layers answer different questions");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "mac",
      "arp",
      "gateway",
      "interface-address"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "interface-state",
      "local-link",
      "ip-addressing",
      "route-selection"
    ]);
  });

  it("models service execution as process, identity, resource, lifecycle and logs", () => {
    const model = getLessonIllustrationModel({
      id: "d1-3-service-context",
      type: "illustration",
      heading: "The service execution context",
      alt: "A service process runs with an identity and environment, accesses resources under permissions, follows a lifecycle, and leaves log evidence",
      bindingId: "D1.3:d1-3-service-context",
      nodes: ["Process", "Identity", "Resource", "Service", "Logs"],
      variant: "service-permission-model-v1"
    });

    expect(model.variant).toBe("service-permission-model-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "process",
      "identity",
      "resource",
      "service",
      "logs"
    ]);
    expect(model.foundation.label).toBe("The running process has an execution context");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "user-group",
      "permissions",
      "environment",
      "lifecycle"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "process-context",
      "resource-access",
      "service-startup",
      "log-evidence"
    ]);
  });

  it("models safe delivery as a traceable path from change to verified release", () => {
    const model = getLessonIllustrationModel({
      id: "b2-1-safe-delivery",
      type: "illustration",
      heading: "The release path",
      alt: "A code change is reviewed, tested, built into an identified artifact, deployed, and verified in the running service",
      bindingId: "B2.1:b2-1-safe-delivery",
      nodes: ["Change", "Review", "Test", "Artifact", "Deploy", "Verify"],
      variant: "delivery-pipeline-v1"
    });

    expect(model.variant).toBe("delivery-pipeline-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "change",
      "review",
      "test",
      "artifact",
      "deploy",
      "verify"
    ]);
    expect(model.foundation.label).toBe("Release identity");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "build-once",
      "rollback-scope"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "known-change",
      "tested-artifact",
      "deployed-version",
      "runtime-health"
    ]);
  });

  it("models repeatable service operation as build, configure, start, health and user proof", () => {
    const model = getLessonIllustrationModel({
      id: "b1-5-repeatability",
      type: "illustration",
      heading: "The repeatable service contract",
      alt: "An application image receives environment configuration, starts with its dependencies, becomes ready, and is proven through a real user request",
      bindingId: "B1.5:b1-5-repeatability",
      nodes: ["Image", "Configuration", "Runtime", "Health", "User path"],
      variant: "repeatable-service-v1"
    });

    expect(model.variant).toBe("repeatable-service-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "image",
      "configuration",
      "runtime",
      "health",
      "user-path"
    ]);
    expect(model.foundation.label).toBe("Persistent data has its own lifecycle");
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "config-secrets",
      "startup-contract"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "configuration-loaded",
      "process-running",
      "service-ready",
      "user-path-works"
    ]);
  });

  it("models the request path as address, route, transport and application", () => {
    const model = getLessonIllustrationModel({
      id: "b1-2-request-path",
      type: "illustration",
      heading: "The request path",
      alt: "A request moves from a name through DNS, routing, transport and the application",
      bindingId: "B1.2:b1-2-request-path",
      nodes: ["Name", "Route", "Connection", "Application"],
      variant: "request-path-v1"
    });

    expect(model.variant).toBe("request-path-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "name",
      "route",
      "connection",
      "application"
    ]);
    expect(model.failureChecks.map((check) => check.id)).toEqual([
      "name-resolution",
      "route-selected",
      "port-reachable",
      "protocol-response"
    ]);
  });

  it("models HTTPS as a protocol stack instead of one generic network box", () => {
    const model = getLessonIllustrationModel({
      id: "b1-3-http-tls-dns",
      type: "illustration",
      heading: "One HTTPS request",
      alt: "DNS, routing, transport, TLS and HTTP cooperate to produce an HTTPS response",
      bindingId: "B1.3:request-stack",
      nodes: ["DNS", "Route", "Transport", "TLS", "HTTP"],
      variant: "https-stack-v1"
    });

    expect(model.variant).toBe("https-stack-v1");
    expect(model.stages.map((stage) => stage.id)).toEqual([
      "dns",
      "route",
      "transport",
      "tls",
      "http"
    ]);
    expect(model.callouts.map((callout) => callout.id)).toEqual([
      "timeout",
      "refusal",
      "tls-failure",
      "http-error"
    ]);
  });

  it("fails closed for an unknown authored illustration variant", () => {
    expect(
      getLessonIllustrationModel({
        id: "bad",
        type: "illustration",
        heading: "Bad",
        alt: "Bad visual",
        bindingId: "bad:visual",
        nodes: ["A", "B"],
        variant: "unknown-v9"
      })
    ).toMatchObject({
      variant: "causal-flow-v1"
    });
  });


  it("rejects an invalid model shape instead of rendering arbitrary data", () => {
    expect(
      validateLessonIllustrationModel({
        version: 1,
        variant: "not-real",
        stages: []
      })
    ).toEqual({
      valid: false,
      failures: [
        "illustration model variant is invalid",
        "illustration model needs at least two stages"
      ]
    });
  });
