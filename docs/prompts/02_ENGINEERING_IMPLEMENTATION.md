# Engineering Prompt — Implement a Podcast Feature

Use this prompt when the AI must actually program a new podcast feature or modify an existing one.

---

Act as a senior TypeScript/Next.js engineer working inside the existing repository.

Your task is to implement the requested podcast feature while preserving the existing architecture.

## Before coding

Read:

- `docs/curriculum/PODCAST_TTS_ARCHITECTURE_V2.md`
- `docs/curriculum/PODCAST_AUDIO_SYNC.md`
- `docs/TESTING_ARCHITECTURE.md`
- `docs/CONTINUATION_HANDOFF_CURRENT.md`

Inspect the actual implementation of:

- `podcastsRaw`
- `podcastSync`
- `PodcastCoach`
- `LessonVoiceClock`
- podcast tests
- animation voice binding
- content validators.

Do not assume old recording architecture still exists.

## Step 1 — define the invariant

Before touching code, write:

- What changes?
- What must remain invariant?
- Which layer owns the behavior?
- What must never happen?

For playback features, explicitly answer:

"What is the learner's educational content before and after the feature?"

For content features:

"Which knowledge units are required?"

For runtime features:

"Which browser runtime events are authoritative?"

## Step 2 — classify the change

Put the feature into one or more layers:

- curriculum
- authored content
- domain contract
- parser
- TTS adapter
- learner controls
- transcript
- voice state
- illustration synchronization
- private tutor
- tests/docs.

If the feature crosses more than one layer, state the contracts between the layers.

## Step 3 — tests first

Add tests before implementation.

Prefer:

- pure unit tests for domain logic
- parser tests for source transformation
- integration tests for runtime behavior
- red-team tests for corruption.

Do not test implementation details when a stable contract can be tested instead.

Bad:

"PodcastCoach contains the string '1.25'."

Good:

"PodcastCoach consumes the canonical speech-rate set."

Literal rate values belong in domain tests.

## Step 4 — implementation rules

### Domain

Centralize:

- explanation identities
- labels
- descriptions
- rates
- schema/version rules
- validators.

### Parser

- preserve authored order
- preserve turn identity
- strip hidden metadata
- fail closed on malformed contracts.

### Runtime

- use SpeechSynthesisUtterance
- apply the selected rate only to the utterance
- preserve selected script
- track actual runtime events
- restart the current turn on rate change
- never skip to a future turn.

### UI

The React component should:

- read canonical values
- render current state
- send learner actions
- display transcript
- expose clear fallback.

Do not duplicate business policy in JSX.

## Step 5 — red-team the implementation

Try mutations such as:

- replace supported rate with 1.75
- remove one explanation
- attach old audioUrl field
- send stale turn completion
- change speed between turns
- change speed during a long turn
- trigger TTS error
- make SpeechSynthesis unavailable
- send a boundary for the wrong turn
- remove transcript content.

The correct result is a controlled failure or invariant-preserving behavior.

## Step 6 — verify

Run:

- targeted unit tests
- targeted integration tests
- red-team tests
- content checks
- typecheck
- full programme gate
- production build.

If any test fails, diagnose the architecture rather than weakening the test unless the test is actually wrong.

## Step 7 — docs

Update the relevant architecture document when behavior changes.

Do not write "future" language for behavior that now exists.

Do not describe old audio assumptions after they have been removed.

## Final response

Give exact:

- files
- design decision
- tests
- red-team cases
- commands
- results
- unresolved issues.

Do not say "should work." State what was actually verified.
