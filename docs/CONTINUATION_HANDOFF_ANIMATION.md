# Animation / Curriculum Binding — Continuation Addendum

**Date:** 2026-09-25
**Repository:** devops_programme
**Branch:** main
**Latest main merge:** 97d4f25345a7cae09b393f3b017e7e5d3502c22d

## Current verified state

The animation platform work has been merged to main.

Verified post-merge GitHub Actions run:

- workflow run: 36082470933
- job: full-programme-gate
- status: completed
- conclusion: success
- all substantive programme-contract, unit/integration, TypeScript and Next.js production-build steps completed successfully.

Do not confuse this with browser visual validation. Live browser/preview validation remains separate and is not claimed here.

## Animation platform status

Implemented and merged:

- reusable animation contracts
- semantic SVG primitives
- deterministic animation runtime
- voice-timeline cue model
- shared SVG/React stage
- accessibility and reduced-motion behavior
- geometry/collision validation
- red-team geometry tests
- animation library registry
- HTTP request reference animation
- animation unit/integration tests.

The reference animation is:

Browser -> API Gateway -> API -> Database

The implementation deliberately uses explicit packet hops so a packet cannot visually pass through the gateway incorrectly.

## Critical next architecture decision

The next implementation step is **not** to create dozens of independent animation React components.

The curriculum must own the exact instructional sequence.

Required model:

Curriculum
  -> ordered lesson content
  -> lesson illustration binding
  -> reusable animation capability
  -> deterministic runtime
  -> SVG renderer

The animation library must never become a second curriculum.

It provides reusable capabilities; the curriculum decides:

- which illustration appears
- where it appears in the lesson
- which voice cues activate which animation events
- which interactive steps exist
- the order of those steps
- what completion means.

## Required new binding layer

Introduce a strict curriculum/application contract for lesson illustration bindings.

The binding should contain, at minimum:

- stable binding ID
- reusable animation ID
- voice-cue-to-event mappings
- ordered interaction steps
- required completion steps
- explicit success/completion conditions.

A lesson must be able to express:

text
-> illustration
-> prediction
-> animation event
-> interactive illustration
-> learner action 1
-> learner action 2
-> recovery
-> verification
-> recall

without moving that sequencing logic into the animation library.

## Fail-closed rules

The curriculum/programme gate must reject:

- missing illustration binding
- missing animation
- unknown voice cue
- unknown animation event
- unknown interaction
- duplicate interaction order
- missing required success condition
- impossible interaction path
- interactive illustration without a declared interaction sequence
- silent fallback to a generic animation.

## Voice rule

The actual aligned podcast audio clock remains authoritative.

Required path:

PodcastCoach audio time
  -> authored lesson voice cue
  -> curriculum illustration binding
  -> animation event
  -> deterministic visual state

Do not create a second audio owner, animation timer, or estimated timing system.

The current PodcastCoach already exposes the real audio time and authored cue model and should remain the voice authority.

## Interactive illustration rule

An animation can expose capabilities such as:

- select-node
- inspect-node
- send-request
- inject-failure
- recover

The curriculum chooses which capabilities are used and in what order.

Example:

1. Select DNS
2. Select route
3. Select port
4. Explain the timeout
5. Repair the route
6. Verify recovery

Do not let the animation component invent this sequence.

## Test doctrine

Continue TDD and invariant testing.

Required test layers for the binding feature:

- binding unit contract tests
- lesson-to-binding integration tests
- voice cue/event integration tests
- interaction-order tests
- fail-closed red-team mutations
- full programme completeness
- browser visual validation when a real accessible preview is available.

Do not add many animation scenarios before this binding contract exists.

## Planned canonical animation capabilities

After the binding contract is green, build reusable scenarios incrementally:

1. HTTP request
2. DNS resolution
3. HTTPS/TLS handshake
4. load balancing
5. container lifecycle
6. CI/CD pipeline
7. deployment and rollback
8. queue and worker
9. service failure and recovery
10. observability/tracing.

The curriculum decides which of these are actually used by a lesson.

## Current animation-related source

- app/src/animations/contracts.ts
- app/src/animations/runtime.ts
- app/src/animations/AnimationStage.tsx
- app/src/animations/library.ts
- app/src/animations/scenarios/httpRequest.ts
- app/src/animations/examples/httpRequestPlayback.ts
- app/src/animations/README.md

## Authoritative documents

- docs/curriculum/COURSE_DESIGN_STANDARDS.md
- docs/curriculum/CURRICULUM_ILLUSTRATION_BINDING.md
- docs/CONTINUATION_HANDOFF_CURRENT.md
- docs/CONTINUATION_HANDOFF_ANIMATION.md
- docs/TESTING_ARCHITECTURE.md

The curriculum-binding standard is the normative source for this specific architecture decision.

## Next implementation boundary

Implement the **curriculum illustration-binding contract and validators first**, with red-team coverage.

Only after that contract is green should new canonical animation scenarios be added at scale.

This preserves the invariant:

> **Curriculum determines teaching. Animation library provides reusable visual capabilities.**
