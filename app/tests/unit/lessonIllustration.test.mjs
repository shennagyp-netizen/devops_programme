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
