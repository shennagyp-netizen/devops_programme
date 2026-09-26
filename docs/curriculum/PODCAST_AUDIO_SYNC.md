# Podcast Audio and React Synchronization

## Product model

The podcast is fixed authored curriculum content. The private LLM tutor is a separate learner-specific conversation and never rewrites, regenerates, or controls the podcast.

For the cognitive-podcast model, one lesson has four complete fixed podcast files. Each file is one authored speech for the same lesson at a different cognitive level:

| Level | Authored purpose |
| --- | --- |
| 1 — Foundation | Simple mental model and purpose |
| 2 — Mechanism | Internal mechanism and precise boundaries |
| 3 — Diagnosis | Failure analysis and evidence |
| 4 — Design & transfer | System design and transfer to new cases |

These are not four playback speeds of one recording.

Changing level changes the explanation itself: information density, abstraction, causal depth, failure reasoning and transfer demands. The browser must not implement these levels by changing HTMLAudioElement.playbackRate.

A separate ordinary playback-rate control is not part of this cognitive-level contract.

## Fixed speech contract

Every published cognitive speech has:

1. a stable episode ID
2. a cognitive level from 1 through 4
3. a stable level identity (`foundation`, `mechanism`, `diagnosis`, `design`)
4. a fixed audio URL
5. the exact script revision used to author the speech
6. the real audio duration
7. transcript turn timings
8. optional authored learner-action cues

The episode bundle is valid only when all four cognitive levels are present exactly once.

## Synchronization contract

The browser uses the actual selected recording as the authoritative clock.

1. audio playback time is authoritative
2. React locates the current authored transcript section from that clock
3. React pauses only at authored learning cues
4. learner interaction may occur
5. React resumes the same fixed speech

React must never estimate spoken position from:

- character count
- word count
- average speaking speed
- paragraph length
- cognitive level
- the number of transcript sections

The cognitive level changes the authored speech. It does not create timing.

## Script/audio identity

Each cognitive speech has its own `scriptVersion`.

Changing one cognitive speech invalidates only that level's audio.

A level-2 script change must not silently invalidate level 1, 3 or 4.

This is why the build manifest records cognitive-level script hashes independently.

## Fallback

If a selected recording is missing, invalid, stale, or cannot be played, the application keeps the selected authored speech available as transcript content.

The UI must not claim that the transcript is synchronized to audio when the audio is unavailable.

A media load/playback failure is therefore a normal fail-closed path, not a reason to synthesize timing.

## Current B1.4 authoring target

B1.4 now has four authored speech sources:

- `B1.4.cognitive-1.txt`
- `B1.4.cognitive-2.txt`
- `B1.4.cognitive-3.txt`
- `B1.4.cognitive-4.txt`

The corresponding four MP3 recordings were generated as local MVP assets at the same nominal speech rate. Their pedagogical difference comes from the authored speech content, not TTS rate manipulation.

The binary recordings are currently distributed as a local MVP asset package rather than committed to the production Git tree. The production audio manifest therefore remains fail-closed until those exact binaries are published.

## Private tutor boundary

The LLM tutor is separate.

It may:

- discuss the learner's current confusion
- ask follow-up questions
- rephrase a concept conversationally
- inspect learner reasoning
- help diagnose an answer

It may not:

- rewrite a podcast speech
- regenerate a podcast
- select a different authored cognitive speech based on hidden model preference
- modify podcast timing
- become the source of podcast synchronization

The fixed podcast is curriculum. The private tutor is adaptive conversation.
