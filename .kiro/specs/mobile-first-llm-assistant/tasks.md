# Implementation Plan: Mobile-First LLM Assistant

## 🎯 PROJECT STATUS: READY FOR IMPLEMENTATION

### Overview
This implementation plan covers six milestones for the Mobile-First LLM Assistant feature. **Milestone 1 foundation completed** with Test-Driven Development and Red Team security testing.

### Current Status
- **✅ M1.1 COMPLETE**: Component structure built and tested (32 tests passing)
- **🔒 Security Foundation**: Input sanitization, XSS prevention implemented
- **🧪 Testing Infrastructure**: 547/548 tests passing overall
- **📱 Mobile Patterns**: Viewport detection and responsive logic ready
- **📋 Remaining Tasks**: M1.3-M1.6, M2-M6 ready for implementation

### Milestones Ready for Implementation:
- **M1**: Floating LLM Assistant (foundation complete, remaining tasks ready)
- **M2**: Mobile-first responsive layout (patterns established)
- **M3**: CI infrastructure fix (validation patterns ready)
- **M4**: Machine verification expansion (contract patterns defined)
- **M5**: Podcast audio completion (component foundation tested)
- **M6**: Animation library expansion (DNS animation contract created)

---

## ✅ COMPLETED TASKS

### Task M1.1: Create Floating LLM Assistant component structure ✅ COMPLETE

**Description:** Created the core component structure for the floating LLM Assistant with security hardening and comprehensive testing.

**Files Created:**
- `app/src/components/FloatingLLMAssistant/FloatingLLMAssistant.tsx` - Main component with responsive positioning
- `app/src/components/FloatingLLMAssistant/AssistantTrigger.tsx` - Floating button with animations
- `app/src/components/FloatingLLMAssistant/AssistantPanel.tsx` - Chat interface with context display
- `app/src/components/FloatingLLMAssistant/types.ts` - TypeScript interfaces
- `app/src/components/FloatingLLMAssistant/utils.ts` - Security utilities (sanitization, validation)
- `app/src/components/FloatingLLMAssistant/utils.js` - JavaScript utilities for testing

**Security Implementation:**
- Input sanitization with XSS prevention
- HTML entity encoding for all user inputs
- Event handler blocking and JavaScript URL prevention
- Resource exhaustion protection

**Test Coverage:**
- **32 tests** including Red Team security testing
- Component rendering and state management
- Accessibility compliance (ARIA labels, keyboard navigation)
- Responsive positioning across viewports
- Security validation for injection attacks

**Acceptance Criteria Met:**
- ✅ M1AC1: Floating Assistant appears as button on right side (desktop)
- ✅ M1AC2: Positions on bottom-right corner on mobile (<768px)
- ✅ M1AC3: Clicking trigger expands panel with chat interface
- ✅ M1AC4: Panel includes context display for current lesson
- ✅ M1AC5: All components pass accessibility tests

**Test Results:** All 32 tests passing, including Red Team security tests

---

## 🚀 TASKS READY FOR IMPLEMENTATION

---

### Task M1.2: Implement LLM context provider

**Description:** Create a React context provider that manages lesson context and query caching for the LLM Assistant.

**Files to create:**
- `app/src/components/FloatingLLMAssistant/LLMContext.ts`

**Files to modify:**
- `app/src/app/layout.tsx` (add LLMContextProvider wrapper)

**Acceptance Criteria:**
- M1AC6: Context provider stores current lesson's ID, title, objective, and domain
- M1AC7: Context provider updates when learner navigates between lessons
- M1AC8: Context provider caches queries locally for offline resubmission (up to 24 hours)
- M1AC9: Context provider maintains context history for navigation
- M1AC10: Query caching respects 24-hour expiration limit

**Estimated Effort:** 3 days

**Test Requirements:**
- Unit tests for context updates on lesson changes
- Tests for query caching and retrieval
- Tests for offline query queuing
- Tests for cache expiration (24-hour limit)

---

### Task M1.3: Implement LLM API client

**Description:** Create the LLM API client that handles query submission and response retrieval from the LLM provider.

**Files to create:**
- `app/src/components/FloatingLLMAssistant/LLMClient.ts`

**Acceptance Criteria:**
- M1AC11: Client sends queries to LLM API with lesson context in system prompt
- M1AC12: Client implements rate limiting with exponential backoff (max 2 retries)
- M1AC13: Client includes lesson ID, title, objective, and domain in context
- M1AC14: Client handles network failures gracefully (informs learner, queues for retry)
- M1AC15: Client validates input to prevent injection attacks

**Estimated Effort:** 3 days

**Test Requirements:**
- Unit tests for API calls with mocked LLM provider
- Tests for retry logic with exponential backoff
- Tests for input validation and injection prevention
- Tests for offline error handling

---

### Task M1.4: Implement speech-to-text integration

**Description:** Implement voice input functionality using the Web Speech API for speech recognition.

**Files to create:**
- `app/src/components/FloatingLLMAssistant/VoiceInput.tsx`

**Acceptance Criteria:**
- M1AC16: Microphone button appears in the assistant interface
- M1AC17: Visual indicator shows recording status while user speaks
- M1AC18: Speech-to-text conversion appears in text input after recording
- M1AC19: Error handling displays when recognition fails (allows typing as fallback)
- M1AC20: Recording latency under 200ms from button press to start

**Estimated Effort:** 2 days

**Test Requirements:**
- Unit tests for microphone access and recording
- Tests for speech-to-text conversion
- Tests for error handling and fallback to text input
- Performance tests for recording latency

---

### Task M1.5: Implement text-to-speech integration

**Description:** Implement text-to-speech functionality for audio playback of LLM responses.

**Files to create:**
- `app/src/components/FloatingLLMAssistant/LLMAudio.tsx`

**Acceptance Criteria:**
- M1AC21: Speaker button appears after LLM generates text response
- M1AC22: Multi-sentence responses are segmented for natural audio playback
- M1AC23: Audio playback includes play, pause, and seek controls
- M1AC24: Error handling indicates audio playback is unavailable if TTS fails
- M1AC25: Audio playback works with browser security policies (user interaction required)

**Estimated Effort:** 2 days

**Test Requirements:**
- Unit tests for audio synthesis and playback
- Tests for multi-sentence segmentation
- Tests for error handling when TTS fails
- Tests for browser security policy compliance

---

### Task M1.6: Implement chat history display

**Description:** Create the chat history component that shows conversation messages between learner and assistant.

**Files to create:**
- `app/src/components/FloatingLLMAssistant/ChatHistory.tsx`

**Acceptance Criteria:**
- M1AC26: Messages display with clear role indicators (user vs assistant)
- M1AC27: Loading states appear while waiting for LLM response
- M1AC28: Offline indicator appears when network connectivity is lost
- M1AC29: Cached queries can be resubmitted when online
- M1AC30: Message history preserves conversation context

**Estimated Effort:** 2 days

**Test Requirements:**
- Unit tests for message rendering and state management
- Tests for loading state display
- Tests for offline mode handling
- Tests for cached query resubmission

---

## Milestone 2: Mobile-First Responsive Layout

### Task M2.1: Create responsive layout utilities

**Description:** Create utility functions and hooks for detecting viewport size and managing responsive state.

**Files to create:**
- `app/src/utils/responsive.ts`

**Acceptance Criteria:**
- M2AC1: `useResponsive` hook returns correct viewport ('mobile', 'tablet', 'desktop')
- M2AC2: Breakpoints: mobile <768px, tablet 768-1199px, desktop ≥1200px
- M2AC3: Hook provides boolean flags: `isMobile`, `isTablet`, `isDesktop`
- M2AC4: Hook updates on window resize events
- M2AC5: Performance optimized with debounced resize handling

**Estimated Effort:** 2 days

**Test Requirements:**
- Unit tests for each viewport detection scenario
- Tests for resize event handling
- Tests for breakpoint boundary conditions

---

### Task M2.2: Update App.tsx with responsive layout

**Description:** Modify the main App component to implement responsive grid layout for three desktop/tablet/mobile modes.

**Files to modify:**
- `app/src/App.tsx`

**Files to create:**
- `app/src/components/MobileSidebar.tsx`

**Acceptance Criteria:**
- M2AC6: On ≥1200px, three-column layout displays (sidebar + content + tools)
- M2AC7: On 768-1199px, two-column layout displays (sidebar + content/tools)
- M2AC8: On <768px, single-column stacked layout displays
- M2AC9: All functionality preserved when switching between layouts
- M2AC10: Mobile sidebar accessible via toggle button on mobile devices

**Estimated Effort:** 3 days

**Test Requirements:**
- Integration tests for each breakpoint layout
- Tests for mobile sidebar opening/closing
- Tests for layout preservation across viewport changes

---

### Task M2.3: Update CSS with responsive rules

**Description:** Add responsive CSS rules for layout containers, floating assistant positioning, and mobile touch targets.

**Files to modify:**
- `app/src/styles.css`

**Acceptance Criteria:**
- M2AC11: Floating Assistant trigger uses fixed positioning on mobile (bottom-right)
- M2AC12: Touch targets minimum size 44x44px on mobile devices
- M2AC13: Grid layout changes with @media queries for each breakpoint
- M2AC14: Sidebar hidden by default on mobile, shown with toggle
- M2AC15: Reduced motion support (`prefers-reduced-motion`) applied

**Estimated Effort:** 2 days

**Test Requirements:**
- Visual regression tests for layout changes
- Tests for mobile touch target sizing
- Tests for responsive breakpoint transitions

---

## Milestone 3: CI Infrastructure Fix

### Task M3.1: Audit failing CI checks

**Description:** Analyze CI workflow to identify which validation checks are failing and root causes.

**Files to examine:**
- `.github/workflows/app.yml`
- CI workflow logs from latest failures

**Acceptance Criteria:**
- M3AC1: All failing validation checks identified
- M3AC2: Root cause analysis completed for each failure
- M3AC3: Fix strategy documented with specific remediation steps

**Estimated Effort:** 2 days

**Test Requirements:**
- No code changes required; documentation deliverable

---

### Task M3.2: Fix content contract failures

**Description:** Resolve failures in the content contract validation check.

**Acceptance Criteria:**
- M3AC4: `npm run check:content` passes without errors
- M3AC5: Content contracts validated against all lessons

**Estimated Effort:** 3 days

**Test Requirements:**
- Manual verification of fix
- CI run to confirm check passes

---

### Task M3.3: Fix assessment contract failures

**Description:** Resolve failures in the assessment contract validation check.

**Acceptance Criteria:**
- M3AC6: `npm run check:assessment` passes without errors
- M3AC7: Assessment contracts validated against all assessments

**Estimated Effort:** 3 days

**Test Requirements:**
- Manual verification of fix
- CI run to confirm check passes

---

### Task M3.4: Fix diagnostics contract failures

**Description:** Resolve failures in the diagnostics contract validation check.

**Acceptance Criteria:**
- M3AC8: `npm run check:diagnostics` passes without errors
- M3AC9: Diagnostics contracts validated against all diagnostics

**Estimated Effort:** 3 days

**Test Requirements:**
- Manual verification of fix
- CI run to confirm check passes

---

### Task M3.5: Fix project contract failures

**Description:** Resolve failures in the project contract validation check.

**Acceptance Criteria:**
- M3AC10: `npm run check:projects` passes without errors
- M3AC11: Project contracts validated against all project components

**Estimated Effort:** 3 days

**Test Requirements:**
- Manual verification of fix
- CI run to confirm check passes

---

### Task M3.6: Fix remaining validation failures

**Description:** Resolve any remaining validation failures including runtime verification and progress architecture.

**Acceptance Criteria:**
- M3AC12: `npm run check:runtime` passes without errors
- M3AC13: `npm run check:progress` passes without errors
- M3AC14: All completeness checks pass (beginner, intermediate, advanced, programme)
- M3AC15: Full CI workflow passes end-to-end without failures

**Estimated Effort:** 5 days

**Test Requirements:**
- Full CI run to confirm all checks pass
- Regression testing for existing functionality

---

## Milestone 4: Machine Verification Expansion

### Task M4.1: Create verification contract for B1.1

**Description:** Implement machine verification contract for the B1.1 exercise (Basic Terminal Commands).

**Files to create:**
- `app/src/lib/verification/b1-1.ts`
- `app/src/data/verification/b1-1.ts`

**Acceptance Criteria:**
- M4AC1: Verification includes steps for pwd, echo, and man commands
- M4AC2: Each step defines expected output patterns or exit codes
- M4AC3: Verification passes if all steps succeed (passThreshold: 1.0)
- M4AC4: Timeout set to 30 seconds for verification
- M4AC5: Verification contract validates against exercise requirements

**Estimated Effort:** 2 days

**Test Requirements:**
- Unit tests for verification contract execution
- Tests for expected output pattern matching
- Tests for timeout handling

---

### Task M4.2: Create verification contract for B1.3

**Description:** Implement machine verification contract for the B1.3 exercise (File Operations).

**Files to create:**
- `app/src/lib/verification/b1-3.ts`
- `app/src/data/verification/b1-3.ts`

**Acceptance Criteria:**
- M4AC6: Verification includes steps for file creation, writing, reading, and deletion
- M4AC7: Each step validates correct command execution
- M4AC8: Verification clears test files after completion (cleanup step)
- M4AC9: Verification passes if all four steps succeed
- M4AC10: Timeout set to 30 seconds for verification

**Estimated Effort:** 2 days

**Test Requirements:**
- Unit tests for verification contract execution
- Tests for file system operations
- Tests for cleanup step verification

---

### Task M4.3: Create ExerciseVerification component

**Description:** Build a reusable component that integrates machine verification into lesson pages.

**Files to create:**
- `app/src/components/ExerciseVerification.tsx`

**Files to modify:**
- `app/src/app/animations/[animationId]/page.tsx` (add verification for B1.1, B1.3)
- `app/src/app/lessons/[lessonId]/page.tsx` (add verification for B1.1, B1.3)

**Acceptance Criteria:**
- M4AC11: Component shows "Run Verification" button alongside manual terminal instructions
- M4AC12: Verification state displays (idle, running, completed, failed)
- M4AC13: Success state shows verification passed message
- M4AC14: Failed state shows detailed error information and retry option
- M4AC15: Evidence recorded when verification succeeds

**Estimated Effort:** 4 days

**Test Requirements:**
- Unit tests for component state management
- Integration tests with verification contracts
- Tests for evidence recording on success

---

### Task M4.4: Integrate verification into lesson pages

**Description:** Add ExerciseVerification component to B1.1 and B1.3 lesson pages.

**Files to modify:**
- `app/src/app/animations/[animationId]/page.tsx` (B1.1, B1.3 sections)
- `app/src/app/lessons/[lessonId]/page.tsx` (B1.1, B1.3 sections)

**Acceptance Criteria:**
- M4AC16: B1.1 page includes ExerciseVerification component
- M4AC17: B1.3 page includes ExerciseVerification component
- M4AC18: Verification component uses correct exercise ID
- M4AC19: Manual terminal instructions remain alongside verification option

**Estimated Effort:** 2 days

**Test Requirements:**
- Integration tests on lesson pages
- Tests for verification initialization with correct exercise ID

---

## Milestone 5: Podcast Audio Completion

### Task M5.1: Audit existing podcast audio

**Description:** Create and run a script to audit current podcast audio coverage and identify missing files.

**Files to create:**
- `scripts/audit-podcasts.ts`

**Acceptance Criteria:**
- M5AC1: All lessons identified with missing audio files
- M5AC2: Audit report generated with missing file list
- M5AC3: Audio manifest structure reviewed for gaps

**Estimated Effort:** 2 days

**Test Requirements:**
- Manual verification of audit results

---

### Task M5.2: Create audio manifest structure

**Description:** Define and implement the audio synchronization format for podcast audio.

**Files to create:**
- `app/public/podcasts/audio-manifest.json`

**Files to modify:**
- `app/public/podcasts/manifest.json` (update with episode mappings)

**Acceptance Criteria:**
- M5AC4: Audio manifest includes lesson ID, total duration, and segments
- M5AC5: Each segment has start time, end time, text, and lesson section
- M5AC6: Audio files stored with consistent naming convention (lessonId/audio.mp3)
- M5AC7: Audio manifest JSON validates against schema

**Estimated Effort:** 3 days

**Test Requirements:**
- Validation tests for audio manifest structure
- Tests for segment timing accuracy

---

### Task M5.3: Complete audio files for B1.1 and B1.3

**Description:** Record and create audio files for B1.1 and B1.3 lessons, including synced transcripts.

**Files to create:**
- `app/public/podcasts/beginner/B1.1/audio.mp3`
- `app/public/podcasts/beginner/B1.1/transcript.txt`
- `app/public/podcasts/beginner/B1.1/cues.json`
- `app/public/podcasts/beginner/B1.3/audio.mp3`
- `app/public/podcasts/beginner/B1.3/transcript.txt`
- `app/public/podcasts/beginner/B1.3/cues.json`

**Acceptance Criteria:**
- M5AC8: Audio files created for B1.1 and B1.3
- M5AC9: Transcripts include time-stamped segments
- M5AC10: Cues JSON contains synchronization information
- M5AC11: Audio duration matches transcript length

**Estimated Effort:** 4 days

**Test Requirements:**
- Manual testing of audio playback
- Tests for transcript synchronization

---

### Task M5.4: Update PodcastCoach component

**Description:** Modify the existing PodcastCoach component to support the new audio synchronization format.

**Files to modify:**
- `app/src/components/PodcastCoach.tsx`

**Acceptance Criteria:**
- M5AC12: Component loads audio manifest for current lesson
- M5AC13: Transcript display synchronized with audio playback timing
- M5AC14: Audio controls include play, pause, seek, and time display
- M5AC15: Fallback to guided transcript mode when audio unavailable

**Estimated Effort:** 3 days

**Test Requirements:**
- Unit tests for audio manifest loading
- Integration tests for audio-transcript synchronization
- Tests for audio control functionality

---

## Milestone 6: Animation Library Expansion

### Task M6.1: Create DNS resolution animation contract

**Description:** Define the DNS resolution animation using the animation contract format.

**Files to create:**
- `app/src/animations/scenarios/dnsResolution.ts`

**Acceptance Criteria:**
- M6AC1: Animation defines all DNS resolution steps (client → resolver → root → TLD → authoritative → response)
- M6AC2: Primitives include client, resolver, root server, TLD server, authoritative server
- M6AC3: Connections define query/response flow between servers
- M6AC4: Packets represent DNS queries and responses
- M6AC5: States include idle, query-flow, and resolution-complete

**Estimated Effort:** 3 days

**Test Requirements:**
- Validation tests for animation contract
- Tests for all required primitives and connections present

---

### Task M6.2: Implement DNS animation display component

**Description:** Create a component that renders the DNS resolution animation with controls.

**Files to create:**
- `app/src/components/DNSAnimationIllustration.tsx`

**Files to modify:**
- `app/src/animations/library.ts` (add dnsResolutionAnimation import)
- `app/src/animations/previewCues.ts` (add DNS cues)

**Acceptance Criteria:**
- M6AC6: Animation displays DNS resolution process with labeled servers
- M6AC7: Controls include Play, Pause, and Reset buttons
- M6AC8: Animation advances through steps in correct order
- M6AC9: Animation supports reduced motion preferences
- M6AC10: Static fallback displayed if animation fails to load

**Estimated Effort:** 4 days

**Test Requirements:**
- Unit tests for animation rendering
- Integration tests for animation control functionality
- Accessibility tests for screen reader compatibility

---

### Task M6.3: Integrate DNS animation into lessons

**Description:** Add DNS animation illustration to DNS-related lessons.

**Files to modify:**
- `app/src/app/lessons/[lessonId]/page.tsx` (add DNS animation to DNS-related lessons)

**Acceptance Criteria:**
- M6AC11: DNS animation appears in DNS-related lessons
- M6AC12: Animation loads within 300ms
- M6AC13: Animation includes descriptive text about DNS process
- M6AC14: Animation library maintains existing animations without regression

**Estimated Effort:** 2 days

**Test Requirements:**
- Integration tests on lesson pages
- Performance tests for animation load time

---

## Testing Milestones

### Task T1: Accessibility audit

**Description:** Conduct full accessibility audit to ensure WCAG 2.1 AA compliance.

**Files to audit:**
- `app/src/components/FloatingLLMAssistant/` (all components)
- `app/src/utils/responsive.ts`
- `app/src/components/ExerciseVerification.tsx`
- `app/src/components/DNSAnimationIllustration.tsx`

**Acceptance Criteria:**
- T1AC1: All components pass keyboard navigation tests
- T1AC2: All components have proper ARIA labels and roles
- T1AC3: Color contrast ratios meet 4.5:1 minimum
- T1AC4: Focus indicators visible on all interactive elements
- T1AC5: Reduced motion support implemented

**Estimated Effort:** 3 days

**Test Requirements:**
- Accessibility automated tests (axe-core or similar)
- Manual keyboard navigation testing
- Screen reader testing (NVDA, VoiceOver)

---

### Task T2: Performance optimization

**Description:** Profile and optimize performance of all new components.

**Files to profile:**
- `app/src/components/FloatingLLMAssistant/`
- `app/src/utils/responsive.ts`
- `app/src/components/ExerciseVerification.tsx`
- `app/src/components/DNSAnimationIllustration.tsx`

**Acceptance Criteria:**
- T2AC1: Floating Assistant load impact <500ms
- T2AC1: Floating Assistant panel open time <100ms
- T2AC2: Mobile layout load time <2 seconds on 4G
- T2AC3: Animation load time <300ms
- T2AC4: Voice recording latency <200ms

**Estimated Effort:** 3 days

**Test Requirements:**
- Performance profiling with Lighthouse or WebPageTest
- Load time measurements for each component
- Network throttling tests

---

### Task T3: Integration testing

**Description:** Create end-to-end integration tests covering complete user workflows.

**Files to test:**
- All Milestone 1-6 components and utilities

**Acceptance Criteria:**
- T3AC1: Complete LLM Assistant workflow tested (voice input → LLM → audio response)
- T3AC2: Responsive layout tested across all breakpoints
- T3AC3: Machine verification workflow tested for B1.1 and B1.3
- T3AC4: Podcast audio playback tested with synchronization
- T3AC5: DNS animation tested with all controls

**Estimated Effort:** 4 days

**Test Requirements:**
- End-to-end tests with Playwright or Cypress
- Cross-browser testing
- Performance regression tests

---

## Summary

### Milestone Timeline

| Milestone | Tasks | Estimated Effort |
|-----------|-------|------------------|
| M1: Floating LLM Assistant | 6 | 16 days |
| M2: Mobile-First Layout | 3 | 7 days |
| M3: CI Infrastructure Fix | 6 | 21 days |
| M4: Machine Verification | 4 | 11 days |
| M5: Podcast Audio | 4 | 13 days |
| M6: Animation Library | 3 | 9 days |
| Testing | 3 | 10 days |
| **Total** | **29** | **87 days** |

### Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["M2.1", "M1.1", "M6.1"] },
    { "id": 1, "tasks": ["M1.2", "M2.2", "M6.2"] },
    { "id": 2, "tasks": ["M1.3", "M2.3", "M6.3"] },
    { "id": 3, "tasks": ["M1.4", "M1.5", "M4.1", "M5.1"] },
    { "id": 4, "tasks": ["M1.6", "M4.2", "M5.2"] },
    { "id": 5, "tasks": ["M3.1", "M4.3", "M5.3", "M5.4"] },
    { "id": 6, "tasks": ["M3.2", "M3.3", "M3.4", "M3.5"] },
    { "id": 7, "tasks": ["M3.6", "M4.4"] },
    { "id": 8, "tasks": ["T1", "T2", "T3"] }
  ]
}
```

---

## Notes

- Tasks marked with dependencies should be completed in order
- M3 (CI Infrastructure) may require external investigation to identify specific failures
- M5 (Podcast Audio) requires audio recording resources and time
- Testing tasks are critical and should not be skipped
- Each milestone can be developed independently after foundational tasks complete
- Integration testing (T3) should cover all milestones working together

---

## Verification Checklist

- [ ] All 29 tasks completed
- [ ] All acceptance criteria met
- [ ] Tests passing for all components
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Performance targets met
- [ ] CI workflow passes end-to-end
- [ ] No regressions in existing functionality

