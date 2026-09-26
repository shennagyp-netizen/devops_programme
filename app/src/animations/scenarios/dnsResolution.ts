import type { AnimationDefinitionV1 } from "../contracts";

export const dnsResolutionAnimation: AnimationDefinitionV1 = {
  version: 1,
  id: "dns-resolution",
  title: "DNS Resolution Path",
  viewport: { width: 1200, height: 675 },
  visual: {
    theme: "devops-dark-v1",
    customization: {
      accent: "cyan",
      density: "comfortable",
      emphasis: "standard",
      nodeVariant: "technical",
      motion: {
        travelMs: 650,
        emphasisMs: 260,
        settleMs: 360,
        easing: "standard"
      }
    }
  },
  primitives: [
    { kind: "node", id: "client", label: "Client", role: "client", x: 30, y: 270, width: 150, height: 90 },
    { kind: "node", id: "resolver", label: "Recursive Resolver", role: "server", x: 210, y: 270, width: 190, height: 90 },
    { kind: "node", id: "root", label: "Root Server", role: "server", x: 435, y: 270, width: 170, height: 90 },
    { kind: "node", id: "tld", label: "TLD Server", role: "server", x: 640, y: 270, width: 170, height: 90 },
    { kind: "node", id: "authoritative", label: "Authoritative Server", role: "server", x: 845, y: 270, width: 190, height: 90 },
    { kind: "node", id: "answer", label: "Answer Returns", role: "server", x: 845, y: 435, width: 190, height: 80 },
    { kind: "connection", id: "client-resolver", from: "client", to: "resolver" },
    { kind: "connection", id: "resolver-root", from: "resolver", to: "root" },
    { kind: "connection", id: "root-tld", from: "root", to: "tld" },
    { kind: "connection", id: "tld-authoritative", from: "tld", to: "authoritative" },
    { kind: "connection", id: "authoritative-answer", from: "authoritative", to: "answer" },
    { kind: "packet", id: "query-packet", label: "DNS query", from: "client", to: "resolver" },
    { kind: "packet", id: "response-packet", label: "DNS answer", from: "authoritative", to: "answer" }
  ],
  states: [
    {
      id: "idle",
      status: "neutral",
      targetStatuses: [
        { targetId: "client", status: "neutral" },
        { targetId: "resolver", status: "neutral" },
        { targetId: "root", status: "neutral" },
        { targetId: "tld", status: "neutral" },
        { targetId: "authoritative", status: "neutral" },
        { targetId: "answer", status: "neutral" }
      ]
    },
    {
      id: "query-flow",
      status: "active",
      targetStatuses: [
        { targetId: "resolver", status: "active" },
        { targetId: "root", status: "active" },
        { targetId: "tld", status: "active" },
        { targetId: "authoritative", status: "active" }
      ]
    },
    {
      id: "resolution-complete",
      status: "healthy",
      targetStatuses: [
        { targetId: "client", status: "healthy" },
        { targetId: "resolver", status: "healthy" },
        { targetId: "authoritative", status: "healthy" },
        { targetId: "answer", status: "healthy" }
      ]
    }
  ],
  events: [
    { id: "query", action: "highlight", targetId: "client", targetStateId: "query-flow" },
    { id: "resolver", action: "highlight", targetId: "resolver", targetStateId: "query-flow" },
    { id: "root", action: "highlight", targetId: "root", targetStateId: "query-flow" },
    { id: "tld", action: "highlight", targetId: "tld", targetStateId: "query-flow" },
    { id: "authoritative", action: "highlight", targetId: "authoritative", targetStateId: "query-flow" },
    { id: "answer", action: "highlight", targetId: "answer", targetStateId: "resolution-complete" }
  ],
  interactions: [
    { id: "query", action: "click", targetId: "client", eventIds: ["query"] },
    { id: "resolver", action: "click", targetId: "resolver", eventIds: ["resolver"] },
    { id: "root", action: "click", targetId: "root", eventIds: ["root"] },
    { id: "tld", action: "click", targetId: "tld", eventIds: ["tld"] },
    { id: "authoritative", action: "click", targetId: "authoritative", eventIds: ["authoritative"] },
    { id: "answer", action: "click", targetId: "answer", eventIds: ["answer"] }
  ],
  accessibility: {
    title: "DNS resolution path",
    description:
      "A client query moves to a recursive resolver, which can consult root, TLD and authoritative servers before the answer returns.",
    reducedMotion: "supported"
  }
};
