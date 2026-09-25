# Animation Library

This package contains reusable DevOps SVG/React presentations.

## Boundaries

Animations are independent from courses. A reusable animation definition contains:

- semantic SVG primitives
- deterministic states
- declared animation events
- declared learner interactions
- accessibility metadata
- approved visual customization

A lesson does not copy SVG implementation. It supplies a separate voice-timeline binding.

## Runtime

The voice clock is authoritative.

The host passes the current voice position to:

```ts
animationTimelineAt(definition, cues, currentTimeMs)
```

The returned projection is deterministic. The same definition, cue schedule and time must always produce the same visual state.

The runtime does not create audio, timers, persistence or course dependencies.

## Authoring rules

Start with tests.

1. Write geometry/collision tests.
2. Write contract tests for the scenario.
3. Write timeline tests for exact cue boundaries.
4. Implement the scenario.
5. Run red-team tests.
6. Run the full programme gate.

Use approved visual tokens. Customize an animation only through contract fields.

Never solve visual differences by inserting arbitrary colors or a second design language.

## First reference scenario

`http-request` demonstrates a multi-hop request:

```text
Browser -> API Gateway -> API -> Database
```

The request animation uses two packet hops so the visual model cannot incorrectly draw a request directly through the gateway.

`examples/httpRequestPlayback.ts` is a standalone synchronization fixture. It is not course content.
