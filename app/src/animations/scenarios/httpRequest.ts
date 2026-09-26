import type { AnimationDefinitionV1 } from "../contracts";

export const httpRequestAnimation: AnimationDefinitionV1 = {
  version: 1,
  id: "http-request",
  title: "HTTP Request Flow",
  viewport: { width: 1200, height: 675 },
  visual: {
    theme: "devops-dark-v1",
    customization: {
      accent: "cyan",
      density: "comfortable",
      emphasis: "standard",
      nodeVariant: "technical",
      motion: {
        travelMs: 700,
        emphasisMs: 280,
        settleMs: 380,
        easing: "standard"
      }
    }
  },
  primitives: [
    { kind: "node", id: "browser", label: "Browser", role: "client", x: 70, y: 292, width: 180, height: 90 },
    { kind: "node", id: "gateway", label: "API Gateway", role: "gateway", x: 385, y: 292, width: 210, height: 90 },
    { kind: "node", id: "api", label: "API", role: "service", x: 730, y: 292, width: 180, height: 90 },
    { kind: "node", id: "database", label: "Database", role: "database", x: 1000, y: 292, width: 150, height: 90 },
    { kind: "connection", id: "browser-gateway", from: "browser", to: "gateway" },
    { kind: "connection", id: "gateway-api", from: "gateway", to: "api" },
    { kind: "connection", id: "api-database", from: "api", to: "database" },
    { kind: "packet", id: "request-browser-gateway", label: "GET", from: "browser", to: "gateway" },
    { kind: "packet", id: "request-gateway-api", label: "GET", from: "gateway", to: "api" }
  ],
  states: [
    {
      id: "initial",
      status: "neutral",
      targetStatuses: [
        { targetId: "browser", status: "neutral" },
        { targetId: "gateway", status: "neutral" },
        { targetId: "api", status: "neutral" },
        { targetId: "database", status: "neutral" }
      ]
    },
    {
      id: "api-active",
      status: "active",
      targetStatuses: [{ targetId: "api", status: "active" }]
    }
  ],
  events: [
    { id: "send-browser-gateway", action: "send", targetId: "request-browser-gateway", targetStateId: "initial" },
    { id: "send-gateway-api", action: "send", targetId: "request-gateway-api", targetStateId: "initial" },
    { id: "activate-api", action: "set-status", targetId: "api", targetStateId: "api-active" }
  ],
  interactions: [
    { id: "send-browser-gateway", action: "click", targetId: "browser", eventIds: ["send-browser-gateway"] },
    { id: "send-gateway-api", action: "click", targetId: "gateway", eventIds: ["send-gateway-api"] },
    { id: "inspect-api", action: "click", targetId: "api", eventIds: ["activate-api"] }
  ],
  accessibility: {
    title: "HTTP request flow",
    description:
      "A browser sends an HTTP request through an API gateway to an API service backed by a database.",
    reducedMotion: "supported"
  }
};
