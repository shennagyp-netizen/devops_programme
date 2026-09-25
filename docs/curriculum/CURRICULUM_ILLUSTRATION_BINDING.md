# Curriculum–Illustration Binding Standard

## Status

**Normative design decision — 2026-09-25**

The curriculum is the authoritative source for instructional order and intent.

The animation library is a reusable implementation library. It provides visual capabilities but does not decide what a lesson teaches, when an illustration appears, which interaction comes next, or how a lesson progresses.

The required ownership chain is:

Curriculum
  -> ordered lesson content
  -> illustration binding
  -> animation capability
  -> deterministic animation runtime
  -> visual renderer

## 1. Curriculum owns instructional order

A lesson content stream is an ordered teaching sequence.

The curriculum explicitly determines:

- which text appears
- which illustration appears
- which interactive illustration appears
- which video appears
- when a learner prediction occurs
- when a learner action occurs
- when a recall/design/assessment step occurs
- the relationship between these items.

Array/order position in the lesson content stream is authoritative unless a future contract explicitly introduces a different ordering rule.

The animation library must never infer or invent lesson sequence.

## 2. Illustrations are referenced, not embedded

A lesson should reference a reusable illustration capability through a stable binding identity.

Conceptually:

~~~ts
type IllustrationBlock = {
  id: string;
  type: "illustration";
  illustrationBindingId: string;
};

type InteractiveIllustrationBlock = {
  id: string;
  type: "interactive-illustration";
  illustrationBindingId: string;
  interactionSteps: string[];
};
~~~

The exact implementation contract may evolve, but the ownership rule is fixed:

- curriculum owns the binding
- animation library owns the reusable capability
- runtime owns deterministic projection
- renderer owns presentation.

Do not copy SVG/React implementation into curriculum files.

## 3. Binding is the strict integration boundary

A lesson illustration binding connects curriculum intent to a reusable animation definition.

The binding must be able to declare, at minimum:

- binding identity
- referenced animation identity
- voice-cue-to-animation-event mappings
- ordered learner interaction steps where applicable
- required completion steps
- success/completion conditions.

The curriculum therefore describes not only **what** animation is shown, but **how that animation participates in the lesson**.

## 4. Voice synchronization

The actual aligned audio clock remains authoritative.

The required runtime chain is:

Podcast audio clock
  -> authored curriculum voice cue
  -> illustration binding
  -> animation event
  -> deterministic visual state

An animation definition may expose event capabilities such as:

- request-send
- request-receive
- forward
- failure
- recovery
- highlight
- state transition.

It must not decide when those events occur in a lesson.

The lesson binding decides which authored voice cue activates which animation event.

Animation timing must never be derived from word count, estimated speech duration, or a separate animation timer.

## 5. Interactive illustrations

Interactive illustrations must be curriculum-driven.

A curriculum may define an ordered interaction sequence such as:

1. select DNS
2. select route
3. select port
4. diagnose timeout
5. verify recovery

Each required step must have:

- stable identity
- explicit order
- a prompt/instruction
- an animation interaction capability
- a success condition or success event.

Unless the curriculum explicitly declares free-order behavior, a learner must not be able to advance to a later required step by bypassing earlier required steps.

The animation library supplies interaction capabilities. The curriculum defines the instructional sequence.

## 6. Fail closed

Curriculum validation must reject:

- missing animation binding
- unknown animation ID
- unknown voice cue ID
- unknown animation event ID
- unknown interaction ID
- duplicate binding identity
- duplicate interaction order
- missing required success condition
- impossible or unreachable required interaction
- interactive content with no declared interaction sequence
- required animation event not reachable from the lesson's authored cue graph.

Do not silently substitute a generic illustration when an authored binding is invalid.

Invalid authored curriculum must fail the content/programme gate.

## 7. Reuse without curriculum coupling

Animation definitions must remain curriculum-independent.

Good:

~~~text
animationId = "http-request"
~~~

Curriculum-specific usage belongs in the binding:

~~~text
B1.2 -> binding -> "http-request"
D2.3 -> another binding -> "http-request"
~~~

Do not put lesson IDs into reusable animation definition IDs.

The same capability may therefore support beginner, intermediate and advanced lessons with different voice bindings, interaction order, complexity and visual emphasis.

## 8. Capability versus teaching sequence

The animation library answers:

> What can this visual scenario represent?

The curriculum binding answers:

> How does this lesson use it?

The ordered lesson stream answers:

> When does the learner encounter it?

This distinction is mandatory.

The library must not ask:

- what should the learner see next?
- what lesson comes next?
- which educational step should follow this event?
- which assessment should be triggered?

Those decisions belong to curriculum/application orchestration.

## 9. Testing requirements

Every binding feature must be developed with invariant-based TDD.

Minimum test layers:

1. **Unit tests**
   - binding schema
   - ID validation
   - ordering rules
   - cue/event references
   - interaction contracts.

2. **Integration tests**
   - real lesson -> binding -> animation lookup
   - real voice cue -> event mapping
   - ordered content stream -> ordered interaction sequence
   - completion requirements.

3. **Red-team tests**
   - missing animation
   - stale binding
   - duplicated steps
   - reordered steps
   - unknown events
   - unknown cues
   - impossible transitions
   - bypassed required step
   - silent fallback attempts
   - animation capability that is valid in isolation but invalid for the bound lesson.

4. **Programme completeness**
   - every authored illustration reference resolves
   - every interactive illustration resolves
   - every binding resolves
   - every referenced cue/event/interaction resolves
   - no orphaned required binding
   - no duplicate instructional identity.

5. **Visual/browser validation**
   - rendering correctness
   - accessibility
   - reduced motion
   - actual voice-clock synchronization.

Browser visual validation remains a separate evidence category and must not be claimed merely because contract tests pass.

## 10. Implementation direction

Before adding a large catalogue of scenarios, strengthen the current animation system with:

- strict lesson-binding contracts
- explicit ordered interaction steps
- routed/orthogonal path support
- route-aware geometry validation
- curriculum completeness validation
- integration with the existing continuous PodcastCoach audio clock.

Then add reusable canonical scenarios such as:

- HTTP request
- DNS resolution
- HTTPS/TLS
- load balancing
- container lifecycle
- CI/CD pipeline
- deployment/rollback
- queues/workers
- service failure/recovery
- observability/tracing.

These scenarios are library capabilities. Their appearance and instructional order are decided by curriculum bindings.

## 11. Source-of-truth rule

The source of truth is:

Curriculum content
    -> binding
    -> animation capability
    -> runtime projection

Not:

animation library
    -> decides curriculum behavior

Any future feature that weakens this separation is an architectural regression.

## 12. Standalone preview host is not curriculum

The animation library now has a standalone preview surface for development, visual inspection and reusable-capability demonstrations.

Routes:

- `/animations`
- `/animations/[animationId]`

The preview host is intentionally outside the curriculum path. It may own a local preview clock and preview cue fixture so a reusable animation can be played, paused, restarted and sought without a lesson session.

This does **not** change production timing ownership.

Production curriculum timing remains:

PodcastCoach actual audio clock
  -> authored lesson cue
  -> curriculum illustration binding
  -> animation event
  -> deterministic runtime
  -> renderer

Preview cue fixtures are not curriculum content, are not learner evidence, and are not a substitute for actual aligned audio.

The standalone routes must not require:

- Clerk learner authentication
- learner completion/progress state
- lesson selection
- curriculum content
- PodcastCoach ownership.

The reusable animation definition and deterministic runtime therefore remain independently usable, while the curriculum remains the only authority for instructional use inside lessons.
