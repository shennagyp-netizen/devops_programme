# Podcast TTS and Cognitive-Level Synchronization

## Product model

The podcast is fixed authored curriculum content.

One lesson has one podcast concept with four authored cognitive versions. Each version is a complete speech about the same lesson:

| Level | Cognitive purpose |
| --- | --- |
| 1 — Foundation | Build the basic mental model |
| 2 — Mechanism | Explain how the system works |
| 3 — Diagnosis | Reason from failures and evidence |
| 4 — Design & transfer | Apply the model to new system designs |

These are four distinct podcasts in the learner experience.

They are not four audio recordings, four audio chunks, four versions made by changing TTS speed, or four LLM-generated conversations.

The podcast scripts are authored curriculum. TTS is the speech renderer.

## TTS contract

The source of truth is the cognitive script.

For every published cognitive version:

1. the script is fixed and versioned
2. the cognitive level is explicit
3. the script is sent to the TTS engine
4. the TTS engine speaks the script
5. the transcript remains visible beside the speech
6. learner controls can pause and resume the TTS session

No MP3, WAV, recording manifest, or pre-recorded speech asset is required.

The repository therefore stores authored text, not recorded audio.

## Cognitive level is not playback speed

There is no cognitive-level control that changes speech synthesis rate.

Level 1 is cognitively simpler because the authored explanation is simpler.

Level 2 increases mechanism and causal detail.

Level 3 asks the learner to reason through failure and evidence.

Level 4 requires design, trade-off reasoning and transfer.

A learner changing from Level 1 to Level 4 therefore receives a different authored speech, not the same speech spoken faster.

## Runtime synchronization

TTS timing is runtime behavior, not a pre-recorded timeline.

The browser speech engine provides runtime events such as onstart, onend, and onboundary when supported by the browser.

The application may use those runtime events to highlight the currently spoken authored turn and to publish the current TTS voice state.

The application must not invent exact speech timing from word count, character count, average speaking rate, paragraph length, a guessed duration, or the cognitive level.

When a browser does not provide a useful boundary event, the safe synchronization unit is the current authored speech turn. The application must not pretend to have millisecond-accurate recorded-audio timing.

## Learner-action boundaries

Prediction, lab, recall and transition boundaries are authored against the script.

The TTS player can stop after the relevant authored turn, hand control to the learner, and resume from the next turn.

The private tutor is separate from this mechanism.

The tutor may discuss the learner's reasoning but it cannot rewrite the fixed podcast script or become its timing authority.

## Fallback

When browser TTS is unavailable, blocked, or fails:

- the authored cognitive script remains visible
- the learner can still read the complete speech
- the application does not fabricate audio timing
- no silent recording asset is assumed to exist

## B1.4 cognitive authoring

B1.4 now has four authored script files:

- B1.4.cognitive-1.txt
- B1.4.cognitive-2.txt
- B1.4.cognitive-3.txt
- B1.4.cognitive-4.txt

These are four complete explanations of the same lesson at increasing cognitive depth.

The production system should generate their speech through TTS at runtime or through a future TTS caching layer. Such caching is an optimization, not a curriculum dependency.
