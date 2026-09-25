# Animation Library

This package contains reusable DevOps SVG/React visual capabilities.

## Ownership and boundaries

The animation library is **not a curriculum**.

The required dependency direction is:

Curriculum
  -> lesson content order
  -> illustration binding
  -> animation capability
  -> deterministic runtime
  -> renderer

The curriculum is authoritative for instructional intent and order.

It decides:

- which illustration appears
- where it appears in the lesson
- which voice cues activate visual events
- which interactive capabilities are used
- the order of required learner interactions
- what counts as completion.

The animation library only supplies reusable capabilities.

It must not:

- decide lesson sequence
- decide what the learner should learn next
- own curriculum data
- own lesson progress
- own assessment flow
- own audio playback
- create a second voice session
- silently substitute an illustration when a curriculum binding is invalid.

## Reusable animation definition

A reusable animation definition contains:

- semantic SVG primitives
- deterministic states
- declared animation events
- declared learner interaction capabilities
- accessibility metadata
- approved visual customization
- geometry/routing data.

It must remain independent of specific lesson IDs.

For example:

~~~text
animationId = "http-request"
~~~

is reusable.

A lesson-specific relationship belongs in a separate curriculum binding:

~~~text
B1.2 -> binding -> "http-request"
~~~

The same animation capability may therefore be reused by multiple lessons with different bindings.

## Curriculum illustration binding

A binding is the strict contract between curriculum and library.

It should declare:

- binding identity
- animation identity
- voice cue -> animation event mappings
- ordered interaction steps
- required completion steps
- success/completion conditions.

The lesson content stream remains authoritative for the placement of the illustration.

Conceptually:

~~~text
ordered lesson content
  -> illustration block
  -> binding ID
  -> animation ID
  -> animation events
~~~

Do not put lesson-order logic into the animation definition.

See:
docs/curriculum/CURRICULUM_ILLUSTRATION_BINDING.md

## Voice synchronization

The voice clock is authoritative.

The host passes the current real audio position into:

~~~ts
animationTimelineAt(definition, cues, currentTimeMs)
~~~

The binding layer maps authored lesson voice cues to animation events.

The runtime projection must be deterministic: the same definition, binding/cue schedule and time must always produce the same visual state.

Do not infer animation timing from word count or a separate animation timer.

The runtime does not create audio, persistence or course progression.

## Interactive illustrations

Animations may expose capabilities such as:

- select
- inspect
- toggle
- trigger a declared event
- inject a bounded failure
- recover.

The curriculum determines which capabilities are used and their order.

Required learner steps must be explicit. Do not implement lesson progression through arbitrary onClick behavior inside an animation component.

## Fail-closed validation

The curriculum/content gate should reject:

- missing binding
- unknown animation
- unknown voice cue
- unknown animation event
- unknown interaction
- duplicate interaction order
- missing success condition
- unreachable required interaction
- interactive illustration with no declared interaction sequence.

Do not silently fall back to a generic illustration.

## Runtime

The voice clock is authoritative.

The host passes the current voice position to:

~~~ts
animationTimelineAt(definition, cues, currentTimeMs)
~~~

The returned projection is deterministic.

The runtime does not create audio, timers, persistence or course dependencies.

## Geometry

Visual correctness is part of the contract.

Validate:

- node overlap
- label overlap
- minimum clearance
- viewport bounds
- routes through unrelated nodes/labels
- packet paths through unrelated nodes/labels
- unintended connection crossings
- invalid route endpoints.

For future orthogonal/polyline routes, validate the actual routed path rather than only center-to-center endpoints.

## Authoring rules

Start with tests.

1. Write curriculum-binding tests.
2. Write geometry/collision tests.
3. Write contract tests for the animation scenario.
4. Write timeline tests for exact cue boundaries.
5. Implement the reusable capability.
6. Run red-team mutations.
7. Run the full programme gate.
8. Run browser visual validation when an accessible preview exists.

Use approved visual tokens. Customize an animation only through contract fields.

Never solve visual differences by inserting arbitrary colors or a second design language.

## First reference scenario

http-request demonstrates:

~~~text
Browser -> API Gateway -> API -> Database
~~~

The request animation uses explicit packet hops so the visual model cannot incorrectly draw a request directly through the gateway.

examples/httpRequestPlayback.ts is a standalone synchronization fixture. It is not course content.

## Planned reusable capabilities

The next scenarios should be implemented only after the curriculum-binding contract is established and green:

- DNS resolution
- HTTPS/TLS
- load balancing
- container lifecycle
- CI/CD pipeline
- deployment and rollback
- queues/workers
- service failure/recovery
- observability/tracing.


## Current implementation status

The curriculum binding contract is implemented and validated.

Curriculum-owned sources:
- src/data/lessonContent.ts — ordered content and binding identity
- src/data/curriculumIllustrationBindings.ts — binding registry
- src/data/illustrationBindings.ts — validation contract.

Current guarantees:
- every authored illustration resolves through the curriculum binding registry
- missing bindings fail closed
- interactive/animated content cannot silently fall back to a static or generic animation
- animation code cannot import curriculum/data modules.

Verified on the latest branch gate:
- 41 test files
- 297 tests
- TypeScript typecheck
- Next.js production build.

The next step is real curriculum use of an animated binding; the library itself does not choose that lesson or sequence.

## Standalone preview surface — current

The reusable animation library is now directly launchable without a course or lesson.

User-facing development/inspection routes:

- `/animations` — lists registered reusable capabilities
- `/animations/[animationId]` — opens a selected capability

The host component is:

- `src/components/AnimationPlayground.tsx`

Its responsibilities are deliberately narrow:

- own a local preview clock
- expose Play/Pause/Restart/Seek
- pass the selected time into `AnimationStage`
- render preview metadata.

It must not own:

- lesson sequence
- curriculum bindings
- learner progress
- assessment state
- PodcastCoach audio
- production voice timing.

Preview fixtures live in `src/animations/previewCues.ts`. They are development/demo timing fixtures, not curriculum bindings.

The production lesson path remains authoritative through the actual PodcastCoach audio clock and the curriculum illustration-binding layer.

The standalone route fails closed for unknown animation IDs.

Current validation for this slice:
- branch head: `7d9330dfb81ffdacb96440421c36038de87df9bf`
- full programme gate: run `36089003221`, completed successfully
- 44 test files
- 310 tests
- TypeScript typecheck
- Next.js production build.

Browser visual validation is still separate and is not claimed without an accessible preview.


## 2026-09-25 post-merge main evidence

PR #22 is merged into `main` at `d6f659e174af388dc11d8e43a56dd40dda722945`.

Post-merge main validation:
- workflow `36089271904`
- full-programme-gate: success
- 44 test files
- 310 tests
- TypeScript typecheck
- Next.js production build.

The standalone routes and preview host are therefore part of the current main architecture.

Browser visual validation is still a separate, not-yet-validated evidence category.
