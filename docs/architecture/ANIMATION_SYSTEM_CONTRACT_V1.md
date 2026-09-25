# Animation System Contract V1

## Purpose

The animation library is independent from the three courses. Courses and lessons bind reusable animations to the lesson's voice timeline; an animation does not know about course IDs, lesson IDs, lesson text, or the voice player.

The instructional audio clock is authoritative. The animation is a deterministic visual projection of that clock plus declared learner actions.

## Uniformity with controlled customization

Every animation uses the same `devops-dark-v1` visual system and a fixed 1200x675 SVG viewport.

An animation may customize only approved contract values:

- accent: indigo, cyan, or violet
- density: compact or comfortable
- emphasis: subtle, standard, or strong
- node variant: rounded or technical
- motion timing within bounded ranges
- motion easing from the approved easing set

Animation authors do not provide raw colors, arbitrary typography, arbitrary design tokens, or a second visual theme.

Geometry and composition are intentionally free enough for each concept to be clear. The visual language remains shared.

## Reusable primitives

Animations are composed from approved primitives such as nodes, connections, packets, and labels. Primitive roles are semantic: client, gateway, service, server, database, queue, worker, container, terminal, file, and pipeline.

This gives the same technical concept the same visual meaning across the whole programme.

## Voice synchronization

Animation definitions contain semantic events but no voice cue identities.

A lesson binding maps authored voice cues to animation events:

```text
lesson
  -> voice cue
  -> animation event
  -> deterministic visual state
```

The animation never owns audio and does not use timers as its instructional clock.

The renderer must be able to reconstruct the same visual state for any audio position. Therefore:

```text
renderAt(t)
```

must depend only on authored animation definition data and the current timeline/learner state.

Pausing the voice freezes the semantic visual state. Seeking the voice reconstructs the state directly; the animation must not require replaying from the beginning.

## Learner interaction

Each interactive action is declared in the animation contract and may trigger only declared animation events. The animation does not persist learner completion or course progress.

The lesson/progress system remains responsible for learning state.

## Geometry and collision contract

The renderer receives geometry authored in the fixed SVG viewport. Before an animation can be used, the contract validator checks geometry deterministically.

By default:

- blocking shapes must not overlap
- blocking shapes must maintain a positive clearance
- labels must not overlap other labels
- nodes and labels must remain inside the viewport
- a connection must not pass through an unrelated node
- connections must not cross each other

The default shape clearance is 12 px. An individual animation may choose another clearance from 0 to 32 px through its approved customization field. A deliberate connection crossing may be explicitly declared with `allowCrossingWith`; this is an exception, not the default.

Connections are currently validated using the straight center-to-center route. If a future renderer supports routed/orthogonal paths, the geometry contract should validate the actual authored route as well.

## Accessibility

Every animation declares a title and description and must support reduced motion without removing instructional meaning.

## Validation

The animation contract validator rejects:

- duplicate IDs
- unsupported themes or variants
- invalid geometry
- primitives outside the viewport
- unknown connection endpoints
- invalid states or event targets
- invalid interaction targets
- invalid motion values
- raw/unknown customization fields
- missing accessibility information
- mismatched lesson bindings
- missing animation events in voice bindings
- negative voice offsets
- duplicate voice cue bindings

## TDD requirements

Animation work follows:

```text
Red
  -> contract test fails
  -> Green
  -> implementation satisfies contract
  -> Red-team contract tests
  -> full unit/integration suite
  -> typecheck
  -> production build
```

A new animation should not be considered integrated until its definition, customization, interaction, accessibility, voice binding, seek reconstruction, and failure cases are covered by tests.

## Architectural boundary

The animation package must not import:

- course curriculum
- lesson panel
- PodcastCoach
- learner persistence
- database code
- authentication code

The reusable animation is presentation infrastructure. The course supplies pedagogical context through a separate binding.
