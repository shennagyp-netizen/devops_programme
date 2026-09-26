import { describe, expect, it, vi, beforeEach } from "vitest";

// Test implementation of animation contract validation
class AnimationContractTester {
  constructor() {
    this.minimalDefinition = () => ({
      version: 1,
      id: "test-animation",
      title: "Test Animation",
      visual: {
        theme: "devops-dark-v1"
      },
      primitives: [
        {
          kind: "node",
          id: "client",
          label: "Client",
          role: "client",
          x: 0,
          y: 0,
          width: 100,
          height: 80
        }
      ],
      states: [
        {
          id: "initial",
          status: "idle",
          targetStatuses: [{ targetId: "client", status: "idle" }]
        }
      ],
      events: [
        {
          id: "start",
          action: "activate",
          targetId: "client",
          targetStateId: "active"
        }
      ],
      interactions: [],
      accessibility: {
        title: "Test animation",
        description: "A test animation for validation",
        reducedMotion: "supported"
      }
    });
  }

  validateAnimationDefinition(definition) {
    // Required fields
    const requiredFields = ['version', 'id', 'title', 'visual', 'primitives', 'states', 'events', 'accessibility'];
    
    for (const field of requiredFields) {
      if (!(field in definition)) {
        return { valid: false, error: `Missing required field: ${field}` };
      }
    }

    // Version check
    if (definition.version !== 1) {
      return { valid: false, error: `Unsupported version: ${definition.version}` };
    }

    // ID validation
    if (typeof definition.id !== 'string' || definition.id.length === 0) {
      return { valid: false, error: 'Invalid animation ID' };
    }

    // Title validation
    if (typeof definition.title !== 'string' || definition.title.length === 0) {
      return { valid: false, error: 'Invalid animation title' };
    }

    // Visual theme validation
    if (!definition.visual || typeof definition.visual !== 'object') {
      return { valid: false, error: 'Invalid visual configuration' };
    }

    // Primitives validation
    if (!Array.isArray(definition.primitives) || definition.primitives.length === 0) {
      return { valid: false, error: 'Animation must have at least one primitive' };
    }

    for (const primitive of definition.primitives) {
      if (!primitive.id || !primitive.kind) {
        return { valid: false, error: 'Primitive missing required fields' };
      }
    }

    // States validation
    if (!Array.isArray(definition.states) || definition.states.length === 0) {
      return { valid: false, error: 'Animation must have at least one state' };
    }

    // Events validation
    if (!Array.isArray(definition.events)) {
      return { valid: false, error: 'Events must be an array' };
    }

    // Accessibility validation
    const accessibility = definition.accessibility;
    if (!accessibility.title || !accessibility.description) {
      return { valid: false, error: 'Accessibility missing title or description' };
    }

    return { valid: true };
  }

  validateAnimationLessonBinding(binding) {
    if (!binding || typeof binding !== 'object') {
      return { valid: false, error: 'Binding must be an object' };
    }

    if (!binding.animationId || typeof binding.animationId !== 'string') {
      return { valid: false, error: 'Invalid animationId in binding' };
    }

    if (!binding.lessonId || typeof binding.lessonId !== 'string') {
      return { valid: false, error: 'Invalid lessonId in binding' };
    }

    if (binding.triggers && !Array.isArray(binding.triggers)) {
      return { valid: false, error: 'Triggers must be an array' };
    }

    return { valid: true };
  }

  createDNSResolutionAnimation() {
    return {
      version: 1,
      id: "dns-resolution",
      title: "DNS Resolution Process",
      visual: {
        theme: "devops-dark-v1",
        customization: {
          accent: "blue",
          density: "normal",
          emphasis: "medium",
          nodeVariant: "server",
          motion: {
            travelMs: 1000,
            emphasisMs: 300,
            settleMs: 500,
            easing: "standard"
          }
        }
      },
      primitives: [
        {
          kind: "node",
          id: "client",
          label: "Browser",
          role: "client",
          x: 100,
          y: 300,
          width: 120,
          height: 60
        },
        {
          kind: "node",
          id: "resolver",
          label: "DNS Resolver",
          role: "resolver",
          x: 300,
          y: 300,
          width: 140,
          height: 80
        },
        {
          kind: "node",
          id: "root",
          label: "Root Server",
          role: "root",
          x: 500,
          y: 100,
          width: 120,
          height: 60
        },
        {
          kind: "node",
          id: "tld",
          label: ".com Server",
          role: "tld",
          x: 500,
          y: 300,
          width: 120,
          height: 60
        },
        {
          kind: "node",
          id: "authoritative",
          label: "Authoritative Server",
          role: "authoritative",
          x: 500,
          y: 500,
          width: 160,
          height: 80
        }
      ],
      connections: [
        {
          id: "client-to-resolver",
          from: "client",
          to: "resolver",
          label: "DNS Query"
        },
        {
          id: "resolver-to-root",
          from: "resolver",
          to: "root",
          label: "Root Query"
        },
        {
          id: "root-to-tld",
          from: "root",
          to: "tld",
          label: "TLD Referral"
        },
        {
          id: "tld-to-authoritative",
          from: "tld",
          to: "authoritative",
          label: "Authoritative Referral"
        },
        {
          id: "authoritative-to-resolver",
          from: "authoritative",
          to: "resolver",
          label: "IP Response"
        },
        {
          id: "resolver-to-client",
          from: "resolver",
          to: "client",
          label: "Final Response"
        }
      ],
      states: [
        {
          id: "idle",
          status: "idle",
          targetStatuses: [
            { targetId: "client", status: "idle" },
            { targetId: "resolver", status: "idle" },
            { targetId: "root", status: "idle" },
            { targetId: "tld", status: "idle" },
            { targetId: "authoritative", status: "idle" }
          ]
        },
        {
          id: "query-flow",
          status: "active",
          targetStatuses: [
            { targetId: "client", status: "sending" },
            { targetId: "resolver", status: "processing" }
          ]
        },
        {
          id: "resolution-complete",
          status: "complete",
          targetStatuses: [
            { targetId: "client", status: "received" },
            { targetId: "resolver", status: "idle" },
            { targetId: "root", status: "idle" },
            { targetId: "tld", status: "idle" },
            { targetId: "authoritative", status: "idle" }
          ]
        }
      ],
      events: [
        {
          id: "start-resolution",
          action: "query",
          targetId: "client",
          targetStateId: "query-flow"
        },
        {
          id: "complete-resolution",
          action: "resolve",
          targetId: "client",
          targetStateId: "resolution-complete"
        }
      ],
      interactions: [
        {
          id: "click-client",
          trigger: "click",
          targetId: "client",
          actionId: "start-resolution"
        }
      ],
      accessibility: {
        title: "DNS resolution animation",
        description: "Shows how DNS resolution works from client to authoritative server and back",
        reducedMotion: "supported"
      }
    };
  }
}

describe("Animation Contracts", () => {
  let animationTester;
  
  beforeEach(() => {
    animationTester = new AnimationContractTester();
  });

  describe("animation definition validation", () => {
    it("should validate minimal animation definition", () => {
      const definition = animationTester.minimalDefinition();
      const result = animationTester.validateAnimationDefinition(definition);
      
      expect(result.valid).toBe(true);
    });

    it("should reject missing required fields", () => {
      const definition = { version: 1, id: "test" }; // Missing other fields
      const result = animationTester.validateAnimationDefinition(definition);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Missing required field");
    });

    it("should reject invalid version", () => {
      const definition = { ...animationTester.minimalDefinition(), version: 99 };
      const result = animationTester.validateAnimationDefinition(definition);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Unsupported version");
    });

    it("should reject empty animation ID", () => {
      const definition = { ...animationTester.minimalDefinition(), id: "" };
      const result = animationTester.validateAnimationDefinition(definition);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid animation ID");
    });

    it("should reject empty primitives array", () => {
      const definition = { ...animationTester.minimalDefinition(), primitives: [] };
      const result = animationTester.validateAnimationDefinition(definition);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("at least one primitive");
    });

    it("should reject primitives missing required fields", () => {
      const definition = {
        ...animationTester.minimalDefinition(),
        primitives: [{ label: "Node" }] // Missing id and kind
      };
      const result = animationTester.validateAnimationDefinition(definition);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Primitive missing required fields");
    });

    it("should reject missing accessibility info", () => {
      const definition = { 
        ...animationTester.minimalDefinition(), 
        accessibility: { title: "Test" } // Missing description
      };
      const result = animationTester.validateAnimationDefinition(definition);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Accessibility missing title or description");
    });
  });

  describe("lesson binding validation", () => {
    it("should validate complete lesson binding", () => {
      const binding = {
        animationId: "dns-resolution",
        lessonId: "networking-101",
        triggers: ["lesson-start", "concept-explanation"]
      };
      
      const result = animationTester.validateAnimationLessonBinding(binding);
      expect(result.valid).toBe(true);
    });

    it("should validate minimal lesson binding", () => {
      const binding = {
        animationId: "dns-resolution",
        lessonId: "networking-101"
      };
      
      const result = animationTester.validateAnimationLessonBinding(binding);
      expect(result.valid).toBe(true);
    });

    it("should reject binding missing animationId", () => {
      const binding = { lessonId: "networking-101" };
      const result = animationTester.validateAnimationLessonBinding(binding);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid animationId");
    });

    it("should reject binding missing lessonId", () => {
      const binding = { animationId: "dns-resolution" };
      const result = animationTester.validateAnimationLessonBinding(binding);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid lessonId");
    });

    it("should reject non-array triggers", () => {
      const binding = {
        animationId: "dns-resolution",
        lessonId: "networking-101",
        triggers: "not-an-array"
      };
      
      const result = animationTester.validateAnimationLessonBinding(binding);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Triggers must be an array");
    });

    it("should reject null binding", () => {
      const result = animationTester.validateAnimationLessonBinding(null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Binding must be an object");
    });
  });

  describe("DNS resolution animation", () => {
    it("should create valid DNS resolution animation", () => {
      const dnsAnimation = animationTester.createDNSResolutionAnimation();
      const result = animationTester.validateAnimationDefinition(dnsAnimation);
      
      expect(result.valid).toBe(true);
      expect(dnsAnimation.id).toBe("dns-resolution");
      expect(dnsAnimation.title).toBe("DNS Resolution Process");
    });

    it("should have all DNS resolution primitives", () => {
      const dnsAnimation = animationTester.createDNSResolutionAnimation();
      
      expect(dnsAnimation.primitives.length).toBe(5);
      
      const primitiveIds = dnsAnimation.primitives.map(p => p.id);
      expect(primitiveIds).toContain("client");
      expect(primitiveIds).toContain("resolver");
      expect(primitiveIds).toContain("root");
      expect(primitiveIds).toContain("tld");
      expect(primitiveIds).toContain("authoritative");
    });

    it("should have proper DNS resolution connections", () => {
      const dnsAnimation = animationTester.createDNSResolutionAnimation();
      
      expect(dnsAnimation.connections.length).toBe(6);
      
      const connectionLabels = dnsAnimation.connections.map(c => c.label);
      expect(connectionLabels).toContain("DNS Query");
      expect(connectionLabels).toContain("Root Query");
      expect(connectionLabels).toContain("TLD Referral");
      expect(connectionLabels).toContain("Authoritative Referral");
      expect(connectionLabels).toContain("IP Response");
      expect(connectionLabels).toContain("Final Response");
    });

    it("should have proper DNS resolution states", () => {
      const dnsAnimation = animationTester.createDNSResolutionAnimation();
      
      expect(dnsAnimation.states.length).toBe(3);
      
      const stateIds = dnsAnimation.states.map(s => s.id);
      expect(stateIds).toContain("idle");
      expect(stateIds).toContain("query-flow");
      expect(stateIds).toContain("resolution-complete");
    });

    it("should have accessibility information", () => {
      const dnsAnimation = animationTester.createDNSResolutionAnimation();
      
      expect(dnsAnimation.accessibility.title).toBe("DNS resolution animation");
      expect(dnsAnimation.accessibility.description).toContain("DNS resolution works");
      expect(dnsAnimation.accessibility.reducedMotion).toBe("supported");
    });
  });

  describe("animation customization", () => {
    it("should support visual customization", () => {
      const dnsAnimation = animationTester.createDNSResolutionAnimation();
      
      expect(dnsAnimation.visual.customization).toBeDefined();
      expect(dnsAnimation.visual.customization.accent).toBe("blue");
      expect(dnsAnimation.visual.customization.density).toBe("normal");
      expect(dnsAnimation.visual.customization.emphasis).toBe("medium");
      expect(dnsAnimation.visual.customization.nodeVariant).toBe("server");
      
      expect(dnsAnimation.visual.customization.motion.travelMs).toBe(1000);
      expect(dnsAnimation.visual.customization.motion.emphasisMs).toBe(300);
      expect(dnsAnimation.visual.customization.motion.settleMs).toBe(500);
      expect(dnsAnimation.visual.customization.motion.easing).toBe("standard");
    });
  });
});