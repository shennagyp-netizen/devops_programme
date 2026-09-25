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
