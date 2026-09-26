# Mobile-First LLM Assistant - Implementation Checklist

## ✅ COMPLETED (Ready for Implementation)

### Foundation Components
- [x] **Component Architecture**: All 6 milestones specified
- [x] **Security Foundation**: Input sanitization, XSS prevention
- [x] **Testing Infrastructure**: 547/548 tests passing
- [x] **Type Definitions**: TypeScript interfaces complete
- [x] **Mobile Responsive Patterns**: Viewport detection ready

### Milestone 1: Floating LLM Assistant
- [x] `FloatingLLMAssistant.tsx` - Main component structure
- [x] `AssistantTrigger.tsx` - Floating button with animations
- [x] `AssistantPanel.tsx` - Chat interface with context display
- [x] `utils.ts` - Security and validation utilities
- [x] `types.ts` - TypeScript interfaces
- [x] **32 tests** including Red Team security tests

### Testing Infrastructure
- [x] Unit test patterns for all components
- [x] Red Team security testing framework
- [x] Integration test patterns
- [x] Performance boundary testing
- [x] Accessibility test requirements

## 🟡 PENDING IMPLEMENTATION (Next Steps)

### Milestone 1 Remaining Tasks (M1.3-M1.6)

#### M1.3: LLM API Client
**File:** `app/src/components/FloatingLLMAssistant/LLMClient.ts`
**Requirements:**
- [ ] Send queries to LLM API with lesson context
- [ ] Implement rate limiting with exponential backoff (max 2 retries)
- [ ] Include lesson ID, title, objective, domain in context
- [ ] Handle network failures gracefully
- [ ] Validate input to prevent injection attacks
- [ ] **Tests:** API calls, retry logic, input validation

#### M1.4: Speech-to-Text Integration
**File:** `app/src/components/FloatingLLMAssistant/VoiceInput.tsx`
**Requirements:**
- [ ] Microphone button in assistant interface
- [ ] Visual recording status indicator
- [ ] Speech-to-text conversion to text input
- [ ] Error handling with typing fallback
- [ ] Recording latency <200ms
- [ ] **Tests:** Microphone access, conversion, error handling

#### M1.5: Text-to-Speech Integration
**File:** `app/src/components/FloatingLLMAssistant/LLMAudio.tsx`
**Requirements:**
- [ ] Speaker button after LLM responses
- [ ] Multi-sentence segmentation for natural playback
- [ ] Play, pause, seek controls
- [ ] Error handling for TTS failures
- [ ] Browser security policy compliance
- [ ] **Tests:** Audio synthesis, segmentation, error handling

#### M1.6: Chat History Display
**File:** `app/src/components/FloatingLLMAssistant/ChatHistory.tsx`
**Requirements:**
- [ ] Message display with role indicators (user vs assistant)
- [ ] Loading states for LLM responses
- [ ] Offline indicator for network loss
- [ ] Cached query resubmission when online
- [ ] Message history context preservation
- [ ] **Tests:** Message rendering, loading states, offline handling

### Milestone 2: Mobile-First Responsive Layout

#### M2.1: Responsive Utilities
**File:** `app/src/utils/responsive.ts`
**Requirements:**
- [ ] `useResponsive` hook with viewport detection
- [ ] Breakpoints: mobile <768px, tablet 768-1199px, desktop ≥1200px
- [ ] Boolean flags: `isMobile`, `isTablet`, `isDesktop`
- [ ] Window resize event updates
- [ ] Debounced performance optimization
- [ ] **Tests:** Viewport detection, resize handling, breakpoints

#### M2.2: Update App.tsx Layout
**Files to modify:**
- `app/src/App.tsx`
- `app/src/components/MobileSidebar.tsx` (create)
**Requirements:**
- [ ] Three-column layout on desktop (≥1200px)
- [ ] Two-column layout on tablet (768-1199px)
- [ ] Single-column stacked layout on mobile (<768px)
- [ ] Mobile sidebar accessible via toggle
- [ ] All functionality preserved across layouts
- [ ] **Tests:** Layout transitions, mobile sidebar, functionality preservation

#### M2.3: Update CSS with Responsive Rules
**File:** `app/src/styles.css`
**Requirements:**
- [ ] Floating Assistant fixed positioning on mobile (bottom-right)
- [ ] Touch targets minimum 44×44px on mobile
- [ ] Grid layout changes with @media queries
- [ ] Sidebar hidden by default on mobile, shown with toggle
- [ ] Reduced motion support (`prefers-reduced-motion`)
- [ ] **Tests:** Visual regression, touch targets, responsive transitions

### Milestone 3: CI Infrastructure Fix

#### M3.1-M3.6: Fix Validation Failures
**Files to examine:**
- `.github/workflows/app.yml`
- CI workflow logs
**Requirements:**
- [ ] Audit failing CI checks (M3.1)
- [ ] Fix content contract failures (M3.2)
- [ ] Fix assessment contract failures (M3.3)
- [ ] Fix diagnostics contract failures (M3.4)
- [ ] Fix project contract failures (M3.5)
- [ ] Fix remaining validation failures (M3.6)
- [ ] **Deliverable:** All CI checks passing

### Milestone 4: Machine Verification Expansion

#### M4.1: Verification Contract for B1.1
**Files to create:**
- `app/src/lib/verification/b1-1.ts`
- `app/src/data/verification/b1-1.ts`
**Requirements:**
- [ ] Verification steps for pwd, echo, and man commands
- [ ] Expected output patterns or exit codes
- [ ] Pass threshold: 1.0 (all steps succeed)
- [ ] Timeout: 30 seconds
- [ ] **Tests:** Command execution, output matching, timeout handling

#### M4.2: Verification Contract for B1.3
**Files to create:**
- `app/src/lib/verification/b1-3.ts`
- `app/src/data/verification/b1-3.ts`
**Requirements:**
- [ ] Verification for file creation, writing, reading, deletion
- [ ] Command execution validation
- [ ] Cleanup step for test files
- [ ] Pass threshold: all four steps succeed
- [ ] Timeout: 30 seconds
- [ ] **Tests:** File operations, cleanup, validation

#### M4.3: ExerciseVerification Component
**File:** `app/src/components/ExerciseVerification.tsx`
**Files to modify:**
- `app/src/app/animations/[animationId]/page.tsx`
- `app/src/app/lessons/[lessonId]/page.tsx`
**Requirements:**
- [ ] "Run Verification" button alongside manual instructions
- [ ] Verification state display (idle, running, completed, failed)
- [ ] Success/failure messages with details
- [ ] Evidence recording on success
- [ ] **Tests:** State management, integration, evidence recording

#### M4.4: Integrate Verification into Lesson Pages
**Files to modify:**
- `app/src/app/animations/[animationId]/page.tsx` (B1.1, B1.3)
- `app/src/app/lessons/[lessonId]/page.tsx` (B1.1, B1.3)
**Requirements:**
- [ ] B1.1 page includes ExerciseVerification component
- [ ] B1.3 page includes ExerciseVerification component
- [ ] Correct exercise ID used
- [ ] Manual instructions remain alongside verification
- [ ] **Tests:** Integration, initialization, exercise ID validation

### Milestone 5: Podcast Audio Completion

#### M5.1: Audit Existing Podcast Audio
**File:** `scripts/audit-podcasts.ts`
**Requirements:**
- [ ] Identify lessons with missing audio files
- [ ] Generate audit report with missing file list
- [ ] Review audio manifest structure for gaps
- [ ] **Deliverable:** Complete audit report

#### M5.2: Create Audio Manifest Structure
**Files to create/modify:**
- `app/public/podcasts/audio-manifest.json`
- `app/public/podcasts/manifest.json`
**Requirements:**
- [ ] Audio manifest includes lesson ID, duration, segments
- [ ] Segment timing, text, and lesson section mapping
- [ ] Consistent naming convention (lessonId/audio.mp3)
- [ ] JSON schema validation
- [ ] **Tests:** Manifest structure, segment timing, validation

#### M5.3: Complete Audio Files for B1.1 and B1.3
**Files to create:**
- `app/public/podcasts/beginner/B1.1/` (audio.mp3, transcript.txt, cues.json)
- `app/public/podcasts/beginner/B1.3/` (audio.mp3, transcript.txt, cues.json)
**Requirements:**
- [ ] Audio files for B1.1 and B1.3
- [ ] Time-stamped transcripts
- [ ] Cues JSON with synchronization information
- [ ] Audio duration matches transcript length
- [ ] **Tests:** Audio playback, transcript sync, duration matching

#### M5.4: Update PodcastCoach Component
**File:** `app/src/components/PodcastCoach.tsx`
**Requirements:**
- [ ] Load audio manifest for current lesson
- [ ] Transcript synchronized with audio playback
- [ ] Audio controls: play, pause, seek, time display
- [ ] Fallback to guided transcript mode
- [ ] **Tests:** Manifest loading, audio-transcript sync, controls

### Milestone 6: Animation Library Expansion

#### M6.1: DNS Resolution Animation Contract
**File:** `app/src/animations/scenarios/dnsResolution.ts`
**Requirements:**
- [ ] DNS resolution steps: client → resolver → root → TLD → authoritative → response
- [ ] Primitives: client, resolver, root server, TLD server, authoritative server
- [ ] Connections: query/response flow between servers
- [ ] Packets: DNS queries and responses
- [ ] States: idle, query-flow, resolution-complete
- [ ] **Tests:** Contract validation, primitives, connections

#### M6.2: DNS Animation Display Component
**File:** `app/src/components/DNSAnimationIllustration.tsx`
**Files to modify:**
- `app/src/animations/library.ts`
- `app/src/animations/previewCues.ts`
**Requirements:**
- [ ] Animation displays DNS resolution with labeled servers
- [ ] Controls: Play, Pause, Reset buttons
- [ ] Animation advances through correct steps
- [ ] Reduced motion support
- [ ] Static fallback if animation fails
- [ ] **Tests:** Animation rendering, controls, accessibility

#### M6.3: Integrate DNS Animation into Lessons
**File to modify:**
- `app/src/app/lessons/[lessonId]/page.tsx`
**Requirements:**
- [ ] DNS animation appears in DNS-related lessons
- [ ] Animation loads within 300ms
- [ ] Descriptive text about DNS process
- [ ] Existing animations maintained without regression
- [ ] **Tests:** Integration, load time, descriptive text

## 🏗️ DEVELOPMENT WORKFLOW

### 1. Start with Tests
```bash
# For each task, first write the test
npx vitest run tests/unit/[component-category] --run
# Tests should fail (Red phase)
```

### 2. Implement Feature
```typescript
// Follow established patterns
// Use security utilities from utils.ts
// Maintain accessibility standards
```

### 3. Verify Implementation
```bash
# Run tests (should pass - Green phase)
npx vitest run tests/unit/[component-category] --run

# Run Red Team tests
npx vitest run tests/unit/**/*.redteam.test.mjs --run

# Run integration tests
npx vitest run tests/integration --run
```

### 4. Refactor & Optimize
- Review code for security compliance
- Check accessibility requirements
- Optimize performance
- Update documentation

## 🔒 SECURITY CHECKLIST (Every Component)

- [ ] Input sanitization using `sanitizeInput()` function
- [ ] XSS prevention through HTML entity encoding
- [ ] Resource limits enforced (animations, data)
- [ ] No eval() or dynamic code execution
- [ ] Secure API communication (HTTPS, headers)
- [ ] Error messages don't leak sensitive information
- [ ] Session management secure
- [ ] Data validation on client and server

## ♿ ACCESSIBILITY CHECKLIST

- [ ] ARIA labels and roles implemented
- [ ] Keyboard navigation support
- [ ] Screen reader compatibility tested
- [ ] Color contrast ratios (4.5:1 minimum)
- [ ] Focus indicators visible
- [ ] Reduced motion support
- [ ] Text alternatives for images/animations
- [ ] Form labels associated with inputs

## 📱 MOBILE CHECKLIST

- [ ] Touch targets ≥44×44px
- [ ] Responsive across all viewports
- [ ] Mobile-optimized layouts
- [ ] Performance on 4G networks
- [ ] Offline functionality considered
- [ ] Mobile browser compatibility
- [ ] Touch gesture support

## 🧪 TESTING REQUIREMENTS

### Unit Tests (Each Component)
- [ ] Component renders correctly
- [ ] State management works
- [ ] Event handlers function
- [ ] Edge cases handled
- [ ] Error states managed

### Integration Tests
- [ ] Cross-component workflows
- [ ] Data flow between components
- [ ] API integration
- [ ] User journey completion

### Red Team Tests
- [ ] XSS injection attempts blocked
- [ ] Malformed data handled gracefully
- [ ] Resource exhaustion prevented
- [ ] Security boundaries enforced

### Performance Tests
- [ ] Load time within targets
- [ ] Memory usage stable
- [ ] Animation performance smooth
- [ ] Network usage optimized

## 📅 IMPLEMENTATION TIMELINE

### Week 1-2: Core LLM Features
- Day 1-3: M1.3 LLM API Client
- Day 4-5: M1.4 Speech-to-Text
- Day 6-7: M1.5 Text-to-Speech
- Day 8-10: M1.6 Chat History

### Week 3-4: Mobile Responsive
- Day 11-12: M2.1 Responsive Utilities
- Day 13-15: M2.2 App Layout Updates
- Day 16-17: M2.3 CSS Updates
- Day 18-20: Cross-browser testing

### Week 5-6: Verification & Audio
- Day 21-22: M4.1-M4.2 Verification Contracts
- Day 23-24: M4.3-M4.4 Exercise Verification
- Day 25-27: M5.1-M5.4 Podcast Audio
- Day 28-30: M6.1-M6.3 Animation Expansion

### Week 7-8: CI & Optimization
- Day 31-35: M3.1-M3.6 CI Fixes
- Day 36-40: Performance optimization
- Day 41-45: Security hardening
- Day 46-50: Final testing & documentation

## 🚨 BLOCKER RESOLUTION

### Immediate Blockers
1. **LLM API Integration**: Need API keys and endpoint configuration
2. **Speech API**: Verify browser compatibility and fallbacks
3. **Audio Processing**: Tools for podcast audio synchronization
4. **Mobile Testing**: Device lab access for comprehensive testing

### Escalation Path
1. Technical lead for API integrations
2. Security team for LLM data handling approval
3. Accessibility specialist for voice feature review
4. DevOps for CI/CD pipeline updates

---

*Checklist Version: 1.0*  
*Last Updated: September 26, 2026*  
*Test Coverage Required: >90%*  
*Security Compliance: Zero Critical Vulnerabilities*  
*Accessibility: WCAG 2.1 AA*