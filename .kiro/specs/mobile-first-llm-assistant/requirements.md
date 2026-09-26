# Requirements Document

> **Historical specification.** This Kiro requirements document describes an earlier feature slice. The authoritative current V3 product requirements and completeness status are in `docs/REQUIREMENTS_V3.md`. In particular, the current MVP retains the local terminal pairing-token bridge, uses simple first-party authentication, uses authored-script browser TTS rather than requiring stored audio files, and treats the current assessment runner and production visual/deployment verification as remaining gaps.

## Introduction

This document defines the requirements for the Mobile-First LLM Assistant feature. This feature extends the DevOps Programme learning platform with three key capabilities:

1. A floating LLM Assistant that provides contextual, voice-enabled coaching support
2. A mobile-first responsive layout that adapts from three-column desktop to single-column mobile views
3. Production infrastructure improvements including CI fixes, expanded machine verification, podcast audio completion, and animation library expansion

The LLM Assistant acts as a continuous co-teacher that learners can engage with via voice or text to ask questions, request explanations, and receive guidance specific to their current lesson context.

## Glossary

- **System**: The DevOps Programme learning platform (Next.js application)
- **LLM Assistant**: Artificial intelligence assistant that provides contextual coaching support
- **Floating Assistant**: UI component that remains visible while scrolling through lesson content
- **Mobile-First Layout**: Responsive design approach prioritizing single-column mobile viewing
- **CI Infrastructure**: GitHub Actions workflow that validates code quality and content contracts
- **Machine Verification**: Runtime verification system that executes learner exercises on their local machines
- **Podcast Audio**: Synchronized spoken learning content for lessons
- **Animation Library**: Interactive visualizations demonstrating DevOps concepts (DNS resolution expansion)
- **Three-Column Desktop View**: Layout with sidebar navigation, lesson content, and learning tools
- **Learner**: User of the DevOps Programme system
- **DevOps Terminal Agent**: Local process that executes verified exercises on the learner's machine
- **Course Levels**: Beginner, Intermediate, Advanced progression paths

## Requirements

### Requirement 1: Floating LLM Assistant Component

**User Story:** As a learner, I want a persistent, accessible LLM Assistant that stays visible while I navigate through lesson content, so that I can get help without losing my place.

#### Acceptance Criteria

1. WHEN the lesson page loads, THE LLM Assistant SHALL appear as a floating button or panel positioned on the right side of the screen
2. WHILE the learner scrolls through lesson content, THE Floating Assistant SHALL maintain its relative position and visibility
3. WHEN the learner clicks the Floating Assistant, THE Assistant SHALL expand to show a chat interface with voice input capabilities
4. WHERE mobile devices have screens narrower than 768px, THE Floating Assistant SHALL position on the bottom-right corner with reduced size
5. THE LLM Assistant SHALL provide context-aware responses based on the current lesson's topic, objective, and content
6. IF network connectivity is lost during a query, THE LLM Assistant SHALL inform the learner and store the query for resubmission when connectivity is restored

### Requirement 2: Voice Input and Output

**User Story:** As a learner with limited typing ability or preference for spoken interaction, I want to speak my questions and hear the responses, so that I can engage with the assistant naturally without manual typing.

#### Acceptance Criteria

1. WHEN the LLM Assistant interface is opened, THE Interface SHALL provide a microphone button for voice input
2. WHILE the learner is speaking, THE Interface SHALL display a visual indicator showing recording status
3. WHEN voice input is completed, THE Interface SHALL convert speech to text and submit it as the query
4. WHEN the LLM Assistant generates a text response, THE Interface SHALL provide a speaker button to play the response as audio
5. WHERE the LLM Assistant provides multi-sentence responses, THE Interface SHALL segment audio playback into natural speech units
6. IF voice recognition fails, THE Interface SHALL display the error and allow the learner to type the question instead
7. IF text-to-speech fails, THE Interface SHALL indicate audio playback is unavailable but still show the text response

### Requirement 3: Context-Aware Responses

**User Story:** As a learner asking questions about specific concepts, I want the assistant to understand my current lesson context, so that I receive relevant, specific answers rather than generic explanations.

#### Acceptance Criteria

1. WHEN a query is submitted, THE LLM Assistant SHALL include the current lesson's ID, title, objective, and domain in the request context
2. WHEN generating a response, THE Assistant SHALL reference specific concepts from the current lesson when relevant
3. WHILE the learner navigates between lessons, THE Assistant SHALL update its context to reflect the new lesson's content
4. WHERE the query relates to concepts covered in prerequisite lessons, THE Assistant SHALL mention those relationships
5. IF a query cannot be answered with the available context, THE Assistant SHALL indicate what additional information would help
6. THE Assistant SHALL NOT fabricate information not present in the lesson content or curriculum materials

### Requirement 4: Three-Column to Single-Column Responsive Layout

**User Story:** As a learner using a mobile device, I want the interface to adapt from a desktop three-column layout to a single-column mobile layout, so that I can access all features without horizontal scrolling or zooming.

#### Acceptance Criteria

1. ON screens 1200px or wider, THE System SHALL display a three-column layout: sidebar navigation, lesson content area, and learning tools panel
2. ON screens between 768px and 1199px, THE System SHALL display a two-column layout: sidebar navigation on the left, lesson content and tools on the right
3. ON screens narrower than 768px, THE System SHALL display a single-column layout with stacked sections
4. WHEN switching from desktop to mobile layout, THE System SHALL preserve all functionality without hiding or removing features
5. WHERE the sidebar contains lesson navigation, THE System SHALL provide an accessible toggle or modal for mobile devices
6. THE Floating Assistant SHALL adjust its positioning and size based on viewport width (right side on desktop, bottom-right on mobile)

### Requirement 5: CI Infrastructure Fix

**User Story:** As a developer maintaining the platform, I need the CI infrastructure to pass validation checks, so that code changes can be safely merged without blocking deployments.

#### Acceptance Criteria

1. WHEN the CI workflow runs, THE System SHALL execute all existing validation jobs without failure
2. WHEN validation jobs complete successfully, THE System SHALL report success status to the GitHub Actions interface
3. IF a validation job fails, THE System SHALL provide clear error messages identifying the failing test or check
4. THE CI workflow SHALL validate content contracts, assessment contracts, diagnostics contracts, and project contracts
5. WHEN code changes are pushed to the repository, THE System SHALL automatically trigger CI validation

### Requirement 6: Machine Verification Expansion

**User Story:** As a learner working through beginner-level exercises, I want machine verification available for B1.1 and B1.3 exercises, so that my solutions can be automatically validated against my local environment.

#### Acceptance Criteria

1. WHEN the learner reaches B1.1 exercise, THE System SHALL provide machine verification options alongside manual terminal instructions
2. WHEN the learner reaches B1.3 exercise, THE System SHALL provide machine verification options alongside manual terminal instructions
3. WHERE the DevOps Terminal Agent is installed and connected, THE System SHALL allow learners to run verified exercises directly from the browser
4. IF machine verification succeeds, THE System SHALL record the evidence and mark the exercise as complete
5. IF machine verification fails, THE System SHALL provide detailed error information and allow retry attempts
6. THE System SHALL maintain existing machine verification for other exercises without regression

### Requirement 7: Podcast Audio Completion

**User Story:** As a learner who prefers audio learning, I want complete podcast audio available for all lessons, so that I can learn by listening while commuting or multitasking.

#### Acceptance Criteria

1. FOR ALL published lessons, THE System SHALL have corresponding podcast audio files synchronized with lesson content
2. WHEN a lesson is loaded, THE System SHALL attempt to load the matching podcast audio manifest
3. IF podcast audio is unavailable for a lesson, THE System SHALL indicate the audio sync state and fall back to guided transcript mode
4. WHERE podcast audio exists, THE System SHALL synchronize transcript display with audio playback timing
5. THE System SHALL allow learners to seek, pause, and resume podcast audio independently
6. Podcast audio files SHALL be stored in the public/podcasts directory with appropriate naming conventions

### Requirement 8: Animation Library Expansion (DNS Resolution)

**User Story:** As a learner trying to understand DNS resolution, I want an interactive animation showing the step-by-step process, so that I can visualize how domain names map to IP addresses.

#### Acceptance Criteria

1. FOR DNS-related lessons, THE System SHALL include an animation illustrating the DNS resolution process
2. WHEN the animation loads, THE System SHALL display a series of steps: DNS query → resolver → root server → TLD server → authoritative server → response
3. WHERE the animation supports interaction, THE System SHALL allow learners to advance, pause, and reset the animation
4. THE Animation SHALL include labels for each server type and show the query/response flow direction
5. IF the animation fails to load, THE System SHALL provide a static diagram or text description as fallback
6. The animation library SHALL maintain existing animations without regression

## Non-Functional Requirements

### Usability
1. The LLM Assistant SHALL respond to queries within 5 seconds for 95% of requests under normal network conditions
2. The Floating Assistant SHALL have a minimal visual footprint on desktop (less than 5% of viewport width)
3. Mobile interface elements SHALL have touch targets of at least 44x44 pixels
4. The System SHALL load and render the mobile layout within 2 seconds on 4G connections

### Reliability
1. The LLM Assistant SHALL maintain availability of 99% during normal operating hours (6 AM to 12 AM UTC)
2. When the assistant is unavailable, THE System SHALL cache queries for up to 24 hours before discarding
3. The CI infrastructure SHALL pass validation for 99% of healthy code commits

### Performance
1. Adding the Floating Assistant to a lesson page SHALL increase initial load time by less than 500ms
2. Voice input recording SHALL capture audio with latency under 200ms from microphone activation
3. The System SHALL handle 1000 concurrent learners without degradation of assistant response time

### Accessibility
1. The Floating Assistant SHALL be navigable via keyboard tab order
2. Voice input controls SHALL be labeled with ARIA attributes for screen readers
3. The mobile single-column layout SHALL maintain logical reading order without visual jumping

### Security
1. Voice input SHALL be encrypted in transit using TLS 1.3
2. User queries and assistant responses SHALL not be stored longer than 24 hours without explicit consent
3. The LLM Assistant SHALL validate all input to prevent injection attacks

## Out of Scope

1. **Multi-language support**: Initial release will only support English language content
2. **LLM model fine-tuning**: The assistant will use existing models without custom training on curriculum data
3. **Real-time collaborative features**: The assistant operates individually for each learner, not for group collaboration
4. **Advanced analytics dashboard**: Usage analytics for the assistant will be minimal (aggregated counts only)
5. **Offline mode**: The assistant requires network connectivity; no local caching of AI responses
6. **Third-party LLM integrations**: Only the primary LLM provider will be supported
7. **Custom assistant avatars or personalities**: The assistant will have a single, professional persona
8. **Learner profile customization**: Assistant behavior will be uniform across all learners
9. **Mobile app development**: This feature is for the web application only; no native iOS or Android apps
10. **Voice accent adaptation**: The voice input system will use standard language models without accent-specific tuning
11. **Advanced animation interactions**: The DNS animation will support basic play/pause/reset but not complex user-modified scenarios

## Dependencies

### Internal Dependencies
1. The System requires the existing lesson content structure with IDs, titles, and objectives to provide context for the assistant
2. The System requires the existing DevOps Terminal Agent infrastructure to enable machine verification for B1.1 and B1.3
3. The System requires the existing podcast audio synchronization infrastructure to ensure audio completion works correctly
4. The System requires the existing animation library foundation to expand with DNS resolution animation
5. The System requires the current Next.js application structure and routing for layout changes to integrate properly

### External Dependencies
1. LLM API provider account with sufficient credits for production usage
2. Speech-to-text service (e.g., Whisper API or Web Speech API)
3. Text-to-speech service (e.g., Eleven Labs, Google Cloud TTS, or Web Speech API)
4. Network connectivity to LLM and voice services
5. GitHub Actions runners for CI infrastructure validation

### Milestone Dependencies
1. **M1 (Floating LLM Assistant)**: Depends on completion of Requirements 1-3
2. **M2 (Mobile-First Layout)**: Depends on completion of Requirement 4
3. **M3 (CI Infrastructure)**: Depends on completion of Requirement 5
4. **M4 (Machine Verification)**: Depends on M1 completion and existing terminal agent infrastructure
5. **M5 (Podcast Audio)**: Depends on existing podcast infrastructure and completion of Requirement 7
6. **M6 (Animation Library)**: Depends on existing animation library and completion of Requirement 8