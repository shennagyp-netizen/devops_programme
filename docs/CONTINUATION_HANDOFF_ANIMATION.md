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

The curriculum-binding layer is now implemented and green. The next implementation step is **not** to create dozens of independent animation React components.

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

## Implemented curriculum binding layer

The strict curriculum/application contract for lesson illustration bindings is implemented in app/src/data/illustrationBindings.ts, with the curriculum-owned registry in app/src/data/curriculumIllustrationBindings.ts.

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

## Verified TDD state

Latest branch gate: workflow run 36087678753 completed successfully.

- 41 test files passed
- 297 tests passed
- all programme contract checks passed
- TypeScript typecheck passed
- Next.js production build passed

The curriculum binding registry is fail-closed: static illustration bindings are deterministic from curriculum content, while interactive/animated bindings must be explicitly authored. No hidden generic animation fallback is allowed.

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

The curriculum illustration-binding contract is now implemented and green.

The next boundary is to author the first real interactive/animated curriculum binding and connect it to the existing PodcastCoach audio clock without creating a second audio owner. Only after that should the canonical scenario catalogue expand.

This preserves the invariant:

> **Curriculum determines teaching. Animation library provides reusable visual capabilities.**

## 2026-09-25 CURRENT OVERRIDE — STANDALONE ANIMATION PLAYGROUND

PR #22 adds a real user-facing standalone launch surface for the reusable animation library.

Branch:
- `feature/standalone-animation-playground-v1`

Current branch head:
- `7d9330dfb81ffdacb96440421c36038de87df9bf`

Latest branch gate:
- workflow run: `36089003221`
- job: `full-programme-gate`
- conclusion: success
- 44 test files / 310 tests
- programme contract checks passed
- TypeScript typecheck passed
- Next.js production build passed.

This milestone closes the earlier distinction between “reusable/renderable” and “directly launchable”. The animation capability is now directly launchable through:

- `/animations` — standalone capability gallery
- `/animations/[animationId]` — standalone animation preview

The standalone preview host owns only a local preview clock for Play/Pause/Restart/Seek. It does not move timing ownership into the reusable animation runtime.

The separation is:

Standalone preview host
  -> local preview clock
  -> AnimationStage
  -> deterministic animation runtime
  -> reusable animation definition

Production lesson path remains:

PodcastCoach actual audio clock
  -> curriculum voice cue
  -> illustration binding
  -> animation event
  -> deterministic animation runtime
  -> AnimationStage

The preview cue fixture in `app/src/animations/previewCues.ts` is development/demo material. It is not a production curriculum voice binding and must never replace actual PodcastCoach timing.

Unknown animation IDs fail closed through `notFound()`. The standalone routes do not require Clerk auth, learner progress, lesson data or curriculum data.

Added source:
- `app/src/animations/preview.ts`
- `app/src/animations/previewCues.ts`
- `app/src/components/AnimationPlayground.tsx`
- `app/src/app/animations/page.tsx`
- `app/src/app/animations/[animationId]/page.tsx`

Added tests:
- `app/tests/unit/animationPreview.integration.test.mjs`
- `app/tests/unit/animationPreview.redteam.test.mjs`
- `app/tests/integration/standalone-animation-pages.integration.test.mjs`

Browser visual validation is still **Not yet validated** because no Vercel team/project is exposed through the current connected account and the container cannot reach GitHub directly. Contract/CI validation does not substitute for browser visual evidence.

### Next implementation boundary

1. Merge PR #22 only with the green branch gate.
2. Confirm the post-merge main gate on the exact merge commit.
3. Perform browser visual validation when an accessible preview exists.
4. Author the first real interactive/animated curriculum binding.
5. Connect that binding to the existing PodcastCoach actual audio clock.
6. Only then expand the reusable scenario catalogue.

The invariant remains:

> **Curriculum determines teaching. Animation library provides reusable visual capabilities. The standalone playground is a host for inspection, not a second curriculum.**


## 2026-09-25 POST-MERGE OVERRIDE — CURRENT MAIN

PR #22 has now been merged to main.

Authoritative main merge:
- PR: #22
- merge commit: `d6f659e174af388dc11d8e43a56dd40dda722945`
- exact post-merge workflow run: `36089271904`
- job: `full-programme-gate`
- conclusion: success
- 44 test files / 310 tests
- programme contract checks passed
- TypeScript typecheck passed
- Next.js production build passed.

Therefore the standalone animation capability is now part of main.

Current launch surfaces:
- `/animations`
- `/animations/[animationId]`

Current architecture:
- reusable animation runtime remains curriculum-independent and stateless
- standalone playground owns only its local preview clock
- curriculum bindings remain the production instructional integration boundary
- PodcastCoach remains the production audio-clock authority.

Browser visual validation remains **Not yet validated**. CI success proves contract/build correctness, not rendered browser appearance or live audio/animation synchronization.

The next boundary is the first real curriculum-authored animated binding using the actual PodcastCoach clock.
