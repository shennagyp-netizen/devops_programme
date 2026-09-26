import { describe, expect, it, beforeEach } from "vitest";
import { sanitizeInput, validateLessonContext, shouldCacheQuery } from '../../../src/components/FloatingLLMAssistant/utils.js';

describe("FloatingLLMAssistant Integration", () => {
  describe("complete workflow", () => {
    it("should handle a complete user interaction workflow", () => {
      // Simulate user context
      const userContext = {
        lessonId: 'b1.1',
        lessonTitle: 'Basic Terminal Commands',
        lessonObjective: 'Learn basic Unix commands',
        domain: 'Command Line'
      };
      
      // Step 1: Validate context
      const isContextValid = validateLessonContext(userContext);
      expect(isContextValid).toBe(true);
      
      // Step 2: User submits a query
      const userQuery = 'How do I list files with ls?';
      const sanitizedQuery = sanitizeInput(userQuery);
      expect(sanitizedQuery).toBe(userQuery); // No special chars to sanitize
      
      // Step 3: Check if query should be cached
      const queryTimestamp = new Date();
      const shouldCache = shouldCacheQuery(queryTimestamp);
      expect(shouldCache).toBe(true);
      
      // Step 4: Simulate malicious input attempt
      const maliciousQuery = '<script>alert("xss")</script>Show me files';
      const safeQuery = sanitizeInput(maliciousQuery);
      expect(safeQuery).not.toContain('<script>');
      expect(safeQuery).not.toContain('</script>');
      expect(safeQuery).toContain('Show me files');
      
      // Step 5: Verify 24-hour cache expiration
      const oldTimestamp = new Date(Date.now() - (25 * 60 * 60 * 1000)); // 25 hours ago
      const shouldCacheOld = shouldCacheQuery(oldTimestamp);
      expect(shouldCacheOld).toBe(false);
    });
  });

  describe("error handling", () => {
    it("should handle various error scenarios gracefully", () => {
      // Test 1: Invalid context
      const invalidContexts = [
        null,
        undefined,
        'string',
        123,
        []
      ];
      
      invalidContexts.forEach(context => {
        const isValid = validateLessonContext(context);
        expect(isValid).toBe(false);
      });
      
      // Empty object should be valid
      const emptyObject = { invalid: 'missing required fields' };
      expect(validateLessonContext(emptyObject)).toBe(true);
      
      // Test 2: Edge case inputs
      const edgeCases = [
        { input: '', expected: '' },
        { input: '   ', expected: '   ' }, // Spaces should be preserved
        { input: null, expected: '' },
        { input: undefined, expected: '' }
      ];
      
      edgeCases.forEach(({ input, expected }) => {
        const result = sanitizeInput(input);
        expect(result).toBe(expected);
      });
      
      // Test 3: Cache boundary conditions
      const now = new Date();
      const boundaryCases = [
        { hours: 23, shouldCache: true },
        { hours: 24, shouldCache: false },
        { hours: 24.1, shouldCache: false },
        { hours: 1, shouldCache: true }
      ];
      
      boundaryCases.forEach(({ hours, shouldCache }) => {
        const timestamp = new Date(now.getTime() - (hours * 60 * 60 * 1000));
        const result = shouldCacheQuery(timestamp);
        expect(result).toBe(shouldCache);
      });
    });
  });

  describe("security integration", () => {
    it("should prevent real-world attack patterns", () => {
      const attackPatterns = [
        {
          name: 'XSS with event handlers',
          input: '<img src=x onerror=alert(1)>',
          shouldNotContain: ['onerror=', '<img', '>']
        },
        {
          name: 'SQL injection attempt',
          input: "'; DROP TABLE users; --",
          shouldNotContain: ["'"], // Single quote should be escaped
        },
        {
          name: 'JavaScript URI',
          input: '<a href="javascript:alert(1)">Click</a>',
          shouldNotContain: ['javascript:', '<a', '</a>']
        },
        {
          name: 'HTML entity bypass',
          input: '&lt;script&gt;alert(1)&lt;/script&gt;',
          // Already escaped, so it should remain the same
          shouldNotChange: true
        }
      ];
      
      attackPatterns.forEach(pattern => {
        const sanitized = sanitizeInput(pattern.input);
        
        if (pattern.shouldNotContain) {
          pattern.shouldNotContain.forEach(forbidden => {
            expect(sanitized).not.toContain(forbidden);
          });
        }
        
        // Additional check for patterns that should not change
        if (pattern.shouldNotChange) {
          expect(sanitized).toBe(pattern.input);
        }
      });
    });
  });
});