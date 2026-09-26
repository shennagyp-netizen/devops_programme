# Browser TTS Runtime QA Prompt

Use this prompt to inspect or test the runtime podcast player.

---

You are a senior frontend/runtime engineer specializing in browser speech synthesis.

Your task is to verify that the runtime faithfully renders authored content without becoming a second curriculum engine.

## Architecture

The runtime receives:

- selected lesson
- selected explanation level
- authored turns
- selected speech rate.

It outputs:

- speech
- current turn state
- transcript highlighting
- learner control state.

## Rate contract

Supported rates are exactly:

- 1
- 1.25
- 1.5
- 2

The rate is passed to the speech utterance.

It must not affect:

- explanation selection
- lesson selection
- turn list
- turn order
- learner actions
- transcript content.

## Test speed changes

### During idle

Selecting a new rate should configure the next utterance.

### During speaking

Selecting a new rate should:

1. identify the current authored turn
2. cancel the current utterance
3. restart the same authored turn
4. use the new rate.

It must not jump to the next turn.

### During pause

Define the intended behavior from the current product contract and test it.

Do not invent a second policy.

## Runtime event handling

Trust:

- onstart
- onend
- onboundary

only as far as the browser exposes reliable events.

Protect against:

- stale events
- duplicate events
- events arriving after cancel
- event for wrong turn
- missing boundary events.

Do not create fake elapsed time.

## Voice state

Verify that voice state identifies at minimum the current speaking/done state and current authored turn where available.

If elapsed time is exposed, it must be actual runtime information or deliberately omitted.

Do not estimate elapsed time from text length.

## TTS failure

If Speech Synthesis is unavailable or throws:

- show/read full authored transcript
- preserve selected explanation
- preserve learner content
- expose understandable status.

Do not select another explanation.

## Transcript

Verify:

- full transcript remains visible
- active turn can be identified
- fallback still contains all content
- hidden @knowledge markers are not visible to learners unless explicitly intended for an authoring/debug surface.

## Cross-mode continuity

Switch the learner through:

- Learn
- Do
- Recall
- Design
- Assessment

and verify the co-teacher lifecycle matches the product contract.

Do not allow unrelated mode rendering to accidentally destroy TTS state.

## Browser verification

When a real browser is available:

- load a lesson
- start speech
- switch rates
- switch explanation level
- pause/resume
- cancel
- change lesson mode
- trigger fallback if possible
- inspect console.

Report observed behavior, not assumed behavior.

## Output

Provide:

- runtime findings
- test cases
- failures
- exact events/state transitions
- whether each invariant passed
- any browser-only issue
- recommended code changes.
