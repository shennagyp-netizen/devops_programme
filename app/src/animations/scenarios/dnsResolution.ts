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
    { kind: "connection", id: "authoritative-answer", from: "authoritative", to: "answer" }
  ],
  states: [
    {
      id: "initial",
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
      id: "active",
      status: "active",
      targetStatuses: [
        { targetId: "resolver", status: "active" },
        { targetId: "root", status: "active" },
        { targetId: "tld", status: "active" },
        { targetId: "authoritative", status: "active" },
        { targetId: "answer", status: "active" }
      ]
    }
  ],
  events: [
    { id: "query", action: "highlight", targetId: "client", targetStateId: "initial" },
    { id: "resolver", action: "highlight", targetId: "resolver", targetStateId: "active" },
    { id: "root", action: "highlight", targetId: "root", targetStateId: "active" },
    { id: "tld", action: "highlight", targetId: "tld", targetStateId: "active" },
    { id: "authoritative", action: "highlight", targetId: "authoritative", targetStateId: "active" },
    { id: "answer", action: "highlight", targetId: "answer", targetStateId: "active" }
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
