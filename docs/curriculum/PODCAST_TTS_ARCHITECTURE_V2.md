# Podcast TTS Architecture V2

## 1. Product invariant

One lesson has one podcast subject and four complete explanations of the same information.

Explanation level changes presentation of the information:
- Very simple
- Simple technical
- Professional
- Expert

Speech speed is a separate presentation control:
- 1x
- 1.25x
- 1.5x
- 2x

The speed never changes the information selected by the learner.

## 2. Layered architecture

### Layer A — Curriculum

The lesson defines what the learner must learn.

Responsibilities:
- lesson identity
- objective
- information coverage
- learner-action boundaries
- transcript and instructional sequence references

Curriculum does not know about browser TTS implementation details.

### Layer B — Authored explanation content

For each podcast subject, four authored scripts communicate the same information.

Responsibilities:
- explanation wording
- vocabulary and assumed prior knowledge
- examples and analogies
- explicitness and sentence density
- information-unit coverage

Every explanation must cover the same information-unit IDs in the same order.

### Layer C — Explanation metadata

`app/src/data/podcastSync.ts` is the pure domain contract for explanation identity and TTS presentation choices.

Responsibilities:
- explanation level identity
- explanation labels
- explanation descriptions
- script-version identity
- canonical speech-rate set
- fail-closed validation

No audio file is represented here.

### Layer D — TTS runtime

`PodcastCoach` is the browser runtime adapter.

Responsibilities:
- load the selected authored script
- convert authored turns to SpeechSynthesisUtterance instances
- apply only the selected speech rate
- pause/resume/cancel TTS
- stop at authored learner-action boundaries
- publish runtime voice state
- highlight the active transcript turn

The runtime must never infer curriculum meaning from speech duration.

### Layer E — Learner controls

Two controls are independent:

Explanation selector:
1. Very simple
2. Simple technical
3. Professional
4. Expert

Speech selector:
1x, 1.25x, 1.5x, 2x

Changing explanation restarts the selected script from its beginning.
Changing speech rate restarts the current authored turn at the new rate; it must not skip ahead.

### Layer F — Private tutor

The LLM tutor is separate from the fixed podcast.

It may discuss the learner's questions, reasoning, mistakes, and explanations.
It may not rewrite or regenerate the authored podcast.
It may not become the podcast timing authority.

## 3. Information-equivalence contract

Information equivalence is structural first and semantic second.

Structural gate:
- exactly four explanation files
- all required information-unit markers exist
- no duplicate markers
- no unknown markers
- identical marker order

Semantic authoring review:
- each level communicates the same facts
- each level keeps the same causal relationships
- each level keeps the same important caveats
- terminology may change
- examples may change
- sentence structure may change
- repetition may change
- assumed background may change

The build gate does not claim that marker equality alone proves semantic equivalence. Human instructional review remains required.

## 4. Speed-equivalence contract

For any selected explanation level E:

`content(E, 1x) = content(E, 1.25x) = content(E, 1.5x) = content(E, 2x)`

The only permitted difference is speech synthesis rate.

Forbidden speed-dependent behavior:
- selecting another explanation
- removing sentences
- skipping turns
- changing turn order
- skipping learner-action boundaries
- generating a shortened summary
- replacing TTS with another speech source

## 5. Synchronization contract

TTS provides runtime events such as start/end and boundary events where supported.

Those events may drive:
- active transcript highlighting
- current-turn voice state
- future runtime animation synchronization

Static timing must not be invented from word count, character count, average speaking rate, or the selected speed.

Until an explicit runtime boundary adapter exists, animation voice cues fail closed rather than pretending to be synchronized.

## 6. Data flow

`lesson -> explanation level -> authored script -> parser -> authored turns -> TTS runtime -> voice state -> transcript/UI`

Speech rate enters only at the TTS runtime boundary:

`authored turn + selected speech rate -> SpeechSynthesisUtterance.rate`

The speech rate must never flow backward into curriculum selection or content generation.

## 7. Implementation and TDD order

Every future podcast feature follows this order:

1. Define or revise the product invariant.
2. Update the pure domain contract.
3. Add unit tests.
4. Add red-team mutations.
5. Implement the runtime adapter.
6. Add integration tests.
7. Update curriculum/documentation contracts.
8. Run the full programme gate.
9. Perform browser visual validation when a real preview is available.

Do not begin with JSX or UI styling when the product invariant is still ambiguous.

## 8. Security and failure behavior

Fail closed when:
- an explanation version is missing
- explanation identities are duplicated or mismatched
- a script version is missing
- legacy audio fields appear in TTS metadata
- browser TTS is unavailable
- a runtime boundary cannot be trusted

When TTS fails, the complete authored transcript remains usable.

## 9. Current B1.4 implementation

B1.4 contains four complete explanation scripts and a 12-unit information-equivalence contract.

The production architecture requires text-authored scripts only. TTS caching may be added later as an optimization, but it must not become a new curriculum source of truth.
