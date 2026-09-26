import { describe, expect, it, vi, beforeEach } from "vitest";

// Red team test implementation for animation contracts
class AnimationRedTeamTester {
  constructor() {
    this.sanitizeAnimationData = (data) => {
      if (!data || typeof data !== 'object') return null;
      
      // Deep clone to avoid mutation
      const sanitized = JSON.parse(JSON.stringify(data));
      
      // Remove any script tags or event handlers from labels and descriptions
      const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=/gi, 'data-')
          .replace(/javascript:/gi, 'data:')
          .replace(/data:/gi, 'safe-data:');
      };
      
      // Recursively sanitize strings in the object
      const sanitizeObject = (obj) => {
        if (Array.isArray(obj)) {
          return obj.map(item => sanitizeObject(item));
        } else if (obj && typeof obj === 'object') {
          const result = {};
          for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string') {
              result[key] = sanitizeString(value);
            } else {
              result[key] = sanitizeObject(value);
            }
          }
          return result;
        }
        return obj;
      };
      
      return sanitizeObject(sanitized);
    };

    this.validateAgainstInjection = (animationData) => {
      const injections = [
        { pattern: /<script/i, description: 'Script tags' },
        { pattern: /on\w+\s*=/, description: 'Event handlers' },
        { pattern: /javascript:/i, description: 'JavaScript URLs' },
        { pattern: /eval\(/, description: 'eval calls' },
        { pattern: /document\./, description: 'Document access' },
        { pattern: /window\./, description: 'Window access' },
        { pattern: /localStorage/, description: 'Local storage access' },
        { pattern: /cookie/i, description: 'Cookie access' }
      ];
      
      const jsonString = JSON.stringify(animationData);
      const issues = [];
      
      injections.forEach(({ pattern, description }) => {
        if (pattern.test(jsonString)) {
          issues.push(description);
        }
      });
      
      return {
        safe: issues.length === 0,
        issues,
        message: issues.length > 0 
          ? `Found potential injection vectors: ${issues.join(', ')}`
          : 'No injection vectors detected'
      };
    };

    this.testResourceExhaustion = (animationDefinition, maxPrimitives = 100, maxStates = 50) => {
      if (!animationDefinition.primitives) {
        return { safe: false, error: 'No primitives defined' };
      }
      
      if (!animationDefinition.states) {
        return { safe: false, error: 'No states defined' };
      }
      
      const primitiveCount = animationDefinition.primitives.length;
      const stateCount = animationDefinition.states.length;
      
      const issues = [];
      if (primitiveCount > maxPrimitives) {
        issues.push(`Too many primitives: ${primitiveCount} (max: ${maxPrimitives})`);
      }
      
      if (stateCount > maxStates) {
        issues.push(`Too many states: ${stateCount} (max: ${maxStates})`);
      }
      
      // Check for circular references in connections
      if (animationDefinition.connections) {
        const visited = new Set();
        const recStack = new Set();
        
        const hasCycle = (nodeId) => {
          visited.add(nodeId);
          recStack.add(nodeId);
          
          const outgoing = animationDefinition.connections
            .filter(conn => conn.from === nodeId)
            .map(conn => conn.to);
          
          for (const neighbor of outgoing) {
            if (!visited.has(neighbor)) {
              if (hasCycle(neighbor)) return true;
            } else if (recStack.has(neighbor)) {
              return true;
            }
          }
          
          recStack.delete(nodeId);
          return false;
        };
        
        const allNodes = [
          ...animationDefinition.primitives.map(p => p.id),
          ...animationDefinition.connections.flatMap(c => [c.from, c.to])
        ].filter((v, i, a) => a.indexOf(v) === i);
        
        for (const node of allNodes) {
          if (!visited.has(node)) {
            if (hasCycle(node)) {
              issues.push('Circular reference detected in connections');
              break;
            }
          }
        }
      }
      
      return {
        safe: issues.length === 0,
        issues,
        message: issues.length > 0 
          ? `Resource exhaustion risks: ${issues.join('; ')}`
          : 'No resource exhaustion risks detected'
      };
    };
  }
}

describe("Animation Contracts Red Team", () => {
  let redTeamTester;
  
  beforeEach(() => {
    redTeamTester = new AnimationRedTeamTester();
  });

  describe("injection attack prevention", () => {
    it("should detect script tag injection in labels", () => {
      const maliciousAnimation = {
        version: 1,
        id: "malicious",
        title: "Test<script>alert('xss')</script>",
        visual: { theme: "devops-dark-v1" },
        primitives: [{ kind: "node", id: "node1", label: "Normal" }],
        states: [{ id: "state1", status: "idle", targetStatuses: [] }],
        events: [],
        accessibility: { title: "Test", description: "Test", reducedMotion: "supported" }
      };
      
      const result = redTeamTester.validateAgainstInjection(maliciousAnimation);
      
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Script tags');
    });

    it("should detect event handler injection", () => {
      const maliciousAnimation = {
        version: 1,
        id: "malicious",
        title: "Test",
        visual: { theme: "devops-dark-v1" },
        primitives: [{ 
          kind: "node", 
          id: "node1", 
          label: "Node with onerror='alert(1)'" 
        }],
        states: [{ id: "state1", status: "idle", targetStatuses: [] }],
        events: [],
        accessibility: { title: "Test", description: "Test", reducedMotion: "supported" }
      };
      
      const result = redTeamTester.validateAgainstInjection(maliciousAnimation);
      
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Event handlers');
    });

    it("should detect JavaScript URL injection", () => {
      const maliciousAnimation = {
        version: 1,
        id: "malicious",
        title: "Test",
        visual: { theme: "devops-dark-v1" },
        primitives: [{ 
          kind: "node", 
          id: "node1", 
          label: "Click me",
          // Simulating a property that might be used for URLs
          metadata: { url: "javascript:alert('xss')" }
        }],
        states: [{ id: "state1", status: "idle", targetStatuses: [] }],
        events: [],
        accessibility: { title: "Test", description: "Test", reducedMotion: "supported" }
      };
      
      const result = redTeamTester.validateAgainstInjection(maliciousAnimation);
      
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('JavaScript URLs');
    });

    it("should pass safe animation data", () => {
      const safeAnimation = {
        version: 1,
        id: "safe",
        title: "Safe Animation",
        visual: { theme: "devops-dark-v1" },
        primitives: [{ kind: "node", id: "node1", label: "Client Node" }],
        states: [{ id: "state1", status: "idle", targetStatuses: [] }],
        events: [],
        accessibility: { 
          title: "Safe animation", 
          description: "A perfectly safe animation", 
          reducedMotion: "supported" 
        }
      };
      
      const result = redTeamTester.validateAgainstInjection(safeAnimation);
      
      expect(result.safe).toBe(true);
      expect(result.issues.length).toBe(0);
    });
  });

  describe("data sanitization", () => {
    it("should sanitize script tags from animation data", () => {
      const maliciousData = {
        title: "Test<script>alert('xss')</script>Title",
        description: "Normal description"
      };
      
      const sanitized = redTeamTester.sanitizeAnimationData(maliciousData);
      
      expect(sanitized.title).not.toContain('<script>');
      expect(sanitized.title).not.toContain('</script>');
      expect(sanitized.title).toContain('TestTitle');
    });

    it("should sanitize event handlers", () => {
      const maliciousData = {
        label: "Node<img src=x onerror=alert(1)>",
        tooltip: "Hover text"
      };
      
      const sanitized = redTeamTester.sanitizeAnimationData(maliciousData);
      
      expect(sanitized.label).not.toContain('onerror=');
      expect(sanitized.label).toContain('data-');
    });

    it("should handle nested objects", () => {
      const nestedData = {
        primitives: [
          {
            id: "node1",
            label: "Safe label",
            metadata: {
              description: "Test<script>malicious</script>"
            }
          }
        ]
      };
      
      const sanitized = redTeamTester.sanitizeAnimationData(nestedData);
      
      expect(sanitized.primitives[0].metadata.description).not.toContain('<script>');
      expect(sanitized.primitives[0].metadata.description).not.toContain('</script>');
    });

    it("should return null for invalid input", () => {
      expect(redTeamTester.sanitizeAnimationData(null)).toBe(null);
      expect(redTeamTester.sanitizeAnimationData(undefined)).toBe(null);
      expect(redTeamTester.sanitizeAnimationData("string")).toBe(null);
      expect(redTeamTester.sanitizeAnimationData(123)).toBe(null);
    });
  });

  describe("resource exhaustion attacks", () => {
    it("should detect excessive primitives", () => {
      const excessiveAnimation = {
        primitives: Array.from({ length: 150 }, (_, i) => ({
          kind: "node",
          id: `node${i}`,
          label: `Node ${i}`
        })),
        states: [{ id: "state1", status: "idle", targetStatuses: [] }]
      };
      
      const result = redTeamTester.testResourceExhaustion(excessiveAnimation, 100, 50);
      
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Too many primitives: 150 (max: 100)');
    });

    it("should detect excessive states", () => {
      const excessiveAnimation = {
        primitives: [{ kind: "node", id: "node1", label: "Node" }],
        states: Array.from({ length: 75 }, (_, i) => ({
          id: `state${i}`,
          status: "idle",
          targetStatuses: []
        }))
      };
      
      const result = redTeamTester.testResourceExhaustion(excessiveAnimation, 100, 50);
      
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Too many states: 75 (max: 50)');
    });

    it("should detect circular references", () => {
      const circularAnimation = {
        primitives: [
          { kind: "node", id: "a", label: "A" },
          { kind: "node", id: "b", label: "B" },
          { kind: "node", id: "c", label: "C" }
        ],
        states: [{ id: "state1", status: "idle", targetStatuses: [] }],
        connections: [
          { id: "1", from: "a", to: "b", label: "A to B" },
          { id: "2", from: "b", to: "c", label: "B to C" },
          { id: "3", from: "c", to: "a", label: "C to A" } // Creates a cycle
        ]
      };
      
      const result = redTeamTester.testResourceExhaustion(circularAnimation);
      
      expect(result.safe).toBe(false);
      expect(result.issues).toContain('Circular reference detected in connections');
    });

    it("should pass reasonable animation", () => {
      const reasonableAnimation = {
        primitives: Array.from({ length: 10 }, (_, i) => ({
          kind: "node",
          id: `node${i}`,
          label: `Node ${i}`
        })),
        states: Array.from({ length: 5 }, (_, i) => ({
          id: `state${i}`,
          status: "idle",
          targetStatuses: []
        })),
        connections: [
          { id: "1", from: "node1", to: "node2", label: "Connection" }
        ]
      };
      
      const result = redTeamTester.testResourceExhaustion(reasonableAnimation);
      
      expect(result.safe).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it("should handle missing primitives or states", () => {
      const incompleteAnimation = {
        primitives: [],
        // Missing states
      };
      
      const result = redTeamTester.testResourceExhaustion(incompleteAnimation);
      
      expect(result.safe).toBe(false);
      expect(result.error).toBe('No states defined');
    });
  });

  describe("malformed data handling", () => {
    it("should handle extremely deep nesting", () => {
      const createDeepObject = (depth) => {
        let obj = { value: "leaf" };
        for (let i = 0; i < depth; i++) {
          obj = { nested: obj };
        }
        return obj;
      };
      
      const deepAnimation = {
        primitives: [{ 
          kind: "node", 
          id: "deep", 
          label: "Deep",
          metadata: createDeepObject(100)
        }],
        states: [{ id: "state1", status: "idle", targetStatuses: [] }]
      };
      
      // This test ensures we don't crash on deep nesting
      const sanitized = redTeamTester.sanitizeAnimationData(deepAnimation);
      expect(sanitized).toBeDefined();
      expect(sanitized.primitives[0].id).toBe("deep");
    });

    it("should handle large strings", () => {
      const largeString = "A".repeat(1000000); // 1MB string
      
      const largeAnimation = {
        primitives: [{ 
          kind: "node", 
          id: "large", 
          label: largeString
        }],
        states: [{ id: "state1", status: "idle", targetStatuses: [] }]
      };
      
      const result = redTeamTester.validateAgainstInjection(largeAnimation);
      expect(result).toBeDefined();
      // Should complete without crashing
    });
  });
});