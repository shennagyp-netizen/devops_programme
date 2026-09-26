# Podcast TTS and Four Explanation Levels

## Core product contract

One lesson contains one podcast with four complete explanations of the same information.

The four explanations do not represent four different lessons, four different knowledge scopes, or four different mental models.

They represent four ways of explaining the same information to learners with different prior knowledge.

| Explanation | Style |
| --- | --- |
| 1 — Very simple | Very explicit everyday language, analogies, little assumed background |
| 2 — Simple technical | Clear technical language with terminology explained naturally |
| 3 — Professional | Normal DevOps language and professional compression |
| 4 — Expert | Compact expert explanation with high assumed prior knowledge |

The invariant is:

Information is the same. Explanation is different.

Every explanation must cover the same information units in the same order. The automated equivalence gate verifies those coverage markers.

## TTS contract

The scripts are the curriculum source of truth.

TTS is only the speech renderer.

The repository stores authored text scripts. It does not require human recordings, MP3 files, WAV files, or a recording manifest.

For the selected explanation:

1. load the authored script
2. parse its authored turns
3. send each turn to the browser TTS engine
4. keep the complete transcript visible
5. use runtime TTS events to track the currently spoken turn
6. pause at authored learner-action boundaries when required
7. continue with the next complete authored turn

The private LLM tutor is a separate system. It never rewrites or regenerates these podcast scripts.

## Speech speed contract

Speech speed is independent from explanation level.

The learner may choose 1×, 1.25×, 1.5×, or 2×.

Changing speed must never change the selected explanation, remove information, skip a turn, change turn order, change learner-action boundaries, shorten the authored script, or replace the script with a different explanation.

The same selected script must be spoken completely at all three rates.

When the learner changes speed while TTS is speaking, the player restarts the current authored turn at the new rate. This can repeat part of the current turn, but it must never skip forward.

Therefore, 1×, 1.5×, and 2× are presentation-speed choices, not content choices.

## Information-equivalence contract

B1.4 has 12 required information units.

Each of the four explanation scripts declares all 12 units with hidden @knowledge authoring markers.

The build gate verifies:
- exactly four explanation scripts
- the same 12 unit IDs in every script
- no duplicate unit IDs
- no unknown unit IDs
- identical unit order across all four scripts

The checker does not claim that machine-readable markers alone prove semantic equivalence. The markers establish the structural contract; instructional review remains responsible for verifying that each marked section communicates the same information.

## Runtime synchronization

TTS timing is runtime behavior.

The browser may provide onstart, onend, and onboundary where supported.

These events can identify the active authored turn.

The application must not invent millisecond timing from word count, character count, average speaking speed, paragraph length, or the selected speed.

The speed value changes TTS speech rate only. It does not become a timing model for the curriculum.

## Fallback

If TTS is unavailable or fails:
- the complete selected authored explanation remains visible
- the learner can read the same information
- the application does not fabricate audio timing
- the application does not silently select a different explanation

## B1.4 authoring

B1.4 currently has:
- B1.4.cognitive-1.txt — Very simple
- B1.4.cognitive-2.txt — Simple technical
- B1.4.cognitive-3.txt — Professional
- B1.4.cognitive-4.txt — Expert
- B1.4.equivalence.json — the 12 information-unit contract

The filenames retain the cognitive-N suffix for continuity, but the product terminology is Explanation Level.
