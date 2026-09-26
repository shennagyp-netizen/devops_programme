# DevOps Programme V3 — Current Requirements

**Status:** authoritative current requirements for the V3 MVP  
**Last reviewed:** 2026-09-26  
**Repository:** `shennagyp-netizen/devops_programme`

This document supersedes the old Kiro-specific mobile-first assistant requirements as the product authority. Historical Kiro specifications remain in `.kiro/specs/mobile-first-llm-assistant/` for implementation history.

## 1. Product surfaces

### R1 — Public programme website
The root website is the public sales/marketing surface.

It must present the programme in a Coursera-like commercial learning-product style, including the three programme levels, projects, hands-on learning, assessment, supported platforms, differentiation and the path into the Learning Gateway.

**Status: COMPLETE**

### R2 — Learning Gateway
The authenticated learner experience is a course application, not the marketing site.

It must provide:
- course selection: Beginner / Intermediate / Advanced;
- platform selection: macOS / Linux / Windows;
- prerequisite diagnostics;
- course sections and project spine;
- lesson navigation;
- Learn / Do / Recall / Design / Assessment modes;
- hands-on exercise requirements;
- learner progress.

**Status: COMPLETE**

## 2. Authentication and learner state

### R3 — Simple first-party authentication
The MVP must use deliberately small first-party authentication:
- email/password;
- scrypt password hashing;
- opaque HTTP-only session cookie;
- PostgreSQL/Drizzle persistence.

The MVP must not introduce Clerk, OAuth, JWT access/refresh infrastructure, or a general learner API-token identity system.

**Status: COMPLETE**

### R4 — Server-authoritative learner progress
Saved learner completion must be bound to the authenticated account.

The browser must never provide the trusted learner ID. Completion records must be unique on:

`user + itemType + itemId`

Repeated completion must be idempotent.

Mastery remediation telemetry is a separate concern and must not be treated as duplicate completion history.

**Status: COMPLETE**

## 3. Curriculum

### R5 — Three-course architecture
The programme must contain:
- Beginner: DevOps through problems;
- Intermediate: full DevOps engineering;
- Advanced: large-scale distributed/production operations.

Each course must contain three projects.

**Status: COMPLETE**

### R6 — Foundation/application interleaving
Foundations must be explicitly identified in curriculum metadata but taught in operational context rather than as a long academic prerequisite gate.

The learner should encounter a problem first and learn the relevant tool/concept because the problem creates the need.

**Status: COMPLETE**

### R7 — Exercises and projects
Every authored lesson must have a lesson-specific hands-on task.

Projects must carry milestones, failure scenarios, evidence requirements and completion criteria.

**Status: COMPLETE**

### R8 — Adaptive prerequisite learning
Each curriculum section should have a prerequisite diagnostic that can recommend:
- skip/condense theory;
- normal theory;
- remediation.

The hands-on exercise remains mandatory.

**Status: COMPLETE**

## 4. Hands-on execution

### R9 — Manual terminal path
Every hands-on lesson must remain usable without any special local agent.

The learner selects macOS/Linux/Windows, receives the appropriate command/instructions, performs the work, and records structured evidence.

Browser-entered evidence must never be described as machine attestation.

**Status: COMPLETE**

### R10 — Local browser-to-laptop terminal bridge
The existing terminal bridge is part of the MVP and must not be removed.

The learner can run:

`npm run terminal-agent`

The agent must:
- listen only on loopback;
- print a pairing token;
- accept only catalog-defined runtime task IDs;
- validate the actual host platform;
- reject destructive runtime commands;
- execute with `shell: false`;
- enforce command timeouts;
- return a structured machine-verification envelope.

The browser must:
- detect agent availability;
- accept the pairing token;
- send only the runtime task identity and platform;
- display returned step results;
- validate the envelope before recording machine evidence.

The terminal pairing token is a local execution credential and is deliberately separate from the learner account session.

**Status: COMPLETE**

### R11 — Machine-verification coverage
Published runtime tasks may mark a task as `machine-verified`.

A probe task must not by itself unlock an exercise. An exercise-scoped machine task may satisfy the machine-verification requirement.

Current catalogue coverage is intentionally narrow and does **not** mean the entire hands-on curriculum is machine verified.

**Status: COMPLETE FOR CURRENT MVP BOUNDARY / PARTIAL FOR FULL-CURRICULUM COVERAGE**

Current authored runtime coverage includes B1.1, B1.2 and B1.3, with B1.2 remaining a probe and B1.1/B1.3 exercise-scoped.

## 5. Assessment

### R12 — Three assessment forms per section
Every curriculum section must expose three assessment forms/families with varied difficulty:
- conceptual;
- diagnostic;
- hands-on.

The item banks must preserve the authored difficulty distribution and schema contracts.

**Status: COMPLETE AT BANK/CONTRACT LEVEL**

### R13 — Learner-facing exam execution
The learner must actually be able to start an assessment, answer items, submit it, receive deterministic scoring/feedback, and retain one completion outcome for that assessment item/form.

The UI must not merely display the intended exam structure.

**Status: INCOMPLETE**

Current application state exposes the three assessment forms and validated pilot banks, but the present `AssessmentPanel` is informational rather than a complete exam runner/scoring workflow.

This is the principal product-completion gap in the current learner experience.

## 6. Co-teacher and AI tutor

### R14 — Fixed continuous co-teacher
The authored podcast/co-teacher remains the stable instructional voice.

It must stay separate from the AI tutor.

The voice presentation must remain synchronized with lesson/illustration runtime events through the lesson voice clock.

**Status: COMPLETE**

### R15 — Four explanation levels
The same lesson information must be available as four explanation levels:
1. very simple;
2. simple technical;
3. professional;
4. expert.

The explanation level changes presentation, not the underlying information contract.

**Status: COMPLETE**

### R16 — Tutor
The AI tutor must be contextual to the current lesson and learning mode and support:
- text questions;
- browser voice input where supported;
- spoken tutor responses where supported;
- retries for transient provider failure;
- local pending-query retry after connectivity returns;
- input-size limits;
- prompt-injection resistance;
- provider credentials kept server-side.

The tutor must never claim that it executed a command unless the runtime system actually produced evidence.

**Status: COMPLETE**

## 7. Podcast/TTS

### R17 — Authored-script-first TTS
The curriculum script is the source of truth.

The runtime may use browser speech synthesis/TTS rather than requiring repository-stored MP3/WAV recordings.

The player must keep the complete authored transcript visible and synchronize lesson highlighting to runtime speech events without inventing fake timing from character counts.

Learners may change speech speed without changing the selected explanation content.

**Status: COMPLETE**

The old requirement that every lesson must have MP3/WAV audio assets is intentionally retired.

### R18 — Podcast authoring QA
Published lesson scripts must pass the existing language, identity, explanation-equivalence and synchronization contracts.

**Status: COMPLETE FOR CURRENT PUBLISHED CONTENT CONTRACT**

## 8. Animation/visual teaching system

### R19 — Reusable React/SVG animation library
Illustrations and interactive animations must use the reusable animation system and explicit contracts rather than ad-hoc per-lesson graphics.

Curriculum bindings must determine which animation is used by which lesson.

**Status: COMPLETE**

### R20 — DNS resolution animation
DNS lessons must have a stepwise visual model covering:
client/query → recursive resolver → root → TLD → authoritative server → response.

The animation must support the defined runtime controls and have a graceful textual/static fallback.

**Status: COMPLETE**

### R21 — Voice/animation synchronization
Lesson voice events must drive the animation presentation where a lesson declares a synchronized animation contract.

**Status: COMPLETE**

## 9. Cross-platform support

### R22 — Platform-aware commands
The curriculum must maintain a shared learning objective while providing platform-aware commands/adapters for macOS, Linux and Windows.

**Status: COMPLETE FOR CURRENT AUTHORED CONTENT**

The current local runtime bridge validates that the selected platform matches the actual host platform.

## 10. UX/responsiveness

### R23 — Responsive learning interface
The learner application must adapt from desktop multi-column presentation to tablet and single-column mobile presentation while preserving core functionality.

Navigation must remain accessible on mobile.

Controls must retain usable touch targets.

**Status: IMPLEMENTED / VISUAL QA STILL REQUIRED**

The current application uses Mantine AppShell responsive behavior and a mobile lesson-navigation drawer. Automated source contracts exist, but final screenshot-based visual verification has not been recorded as a release artifact.

## 11. Security and quality

### R24 — TDD and red-team coverage
Security-sensitive boundaries must have negative tests covering at least:
- authentication/session boundaries;
- learner-progress authorization;
- tutor input and prompt injection;
- runtime-envelope validation;
- terminal-agent token enforcement;
- arbitrary-shell rejection;
- animation/contract tampering where relevant.

**Status: COMPLETE FOR CURRENT MVP SURFACES**

### R25 — Green release gate
A releasable change must pass:
- content contracts;
- assessment contracts;
- diagnostics;
- projects;
- platforms;
- hands-on contracts;
- programme contracts;
- runtime verification contract;
- authenticated progress contract;
- full unit/integration suite;
- TypeScript;
- Next.js production build.

**Status: COMPLETE ON CURRENT MAIN BASELINE**

## 12. Deployment verification

### R26 — Production deployment verification
The current `main` revision must have a successful production deployment, and the public marketing route plus authenticated-learning boundary should be smoke-tested against the deployed result.

**Status: NOT YET VERIFIED IN THIS AUDIT**

This is a release/operations verification item, not a source-code contract.

## 13. Non-goals for the MVP

The current MVP does not require:
- third-party identity providers;
- JWT/token ecosystems;
- arbitrary browser shell execution;
- a managed remote execution service;
- cryptographic physical-machine attestation;
- native iOS/Android applications;
- multilingual course delivery;
- custom LLM fine-tuning;
- group collaboration;
- a general analytics platform;
- full machine verification for every authored exercise.

## 14. Current completeness conclusion

The current V3 source architecture is **not yet fully product-complete**.

The implementation baseline is strong and the engineering gate is green, but two product-release items remain explicit:

1. **Assessment execution/scoring:** the assessment UI is presently a validated structure/pilot-bank presentation rather than a complete learner exam workflow.
2. **Production visual/deployment verification:** source/build gates are green, but a final deployed smoke/visual verification record is still required.

The local terminal pairing workflow is **not** a gap. It is an intentional part of the MVP and must remain.


## Current assessment runner status — 2026-09-26

The learner-facing assessment flow is now operational for the MVP without changing authored question content.

Implemented:
- server-created assessment attempt;
- deterministic blueprint-controlled form selection from the existing pilot bank;
- server-owned answer key during delivery;
- fixed assessment clock derived from the blueprint;
- previous/next navigation;
- item palette;
- mark-for-review state;
- single submission transition;
- persisted assessment attempt record bound to the authenticated learner;
- automatic scoring only for objectively keyed selected-response items;
- explicit review-required state for constructed-response and hands-on evidence;
- late-submission state;
- no question-bank authoring changes.

This is operational learner assessment delivery, not certification-grade testing. Formal psychometric calibration, standard setting, secure operational item-pool separation, controlled exposure, and formal reviewer workflows remain future maturity work.

Production deployment and final visual/smoke verification remain separate release evidence gates.
