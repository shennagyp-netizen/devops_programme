# Podcast Audio and React Synchronization

## Non-negotiable rule

React must never estimate spoken position from:
- character count
- word count
- average speaking speed
- paragraph length
- turn count

Those are too unstable for real voice.

## Synchronization contract

Every generated audio episode has:

1. the original script revision
2. a stable episode ID
3. a stable turn ID for every dialogue turn
4. audio duration
5. timestamp cues for learning events

Turn IDs follow:

`<episodeId>.T001`, `<episodeId>.T002`, ...

Example:

`D2.2.T014`

The audio alignment manifest maps those IDs to milliseconds.

## Learning cues

Supported cue types:

- `prediction`
- `lab`
- `recall`
- `transition`

When the audio clock reaches a prediction cue, React pauses the audio and opens the prediction interaction.

When it reaches a lab cue, React transfers control to the hands-on lab.

When it reaches a recall cue, React opens retrieval.

## Why this is safer

The voice can breathe, speed up, slow down, pause, restart a sentence, or use a different TTS voice without breaking React. The alignment data remains authoritative.

The app can also fall back to guided transcript mode when audio has not yet been aligned.

## Audio generation workflow

1. Freeze the episode script revision.
2. Generate the voice recording.
3. Align the recording to the transcript.
4. Produce `audioUrl`, `durationMs`, and cue timestamps.
5. Store the manifest.
6. Verify every cue by listening at its timestamp.
7. Only then mark the episode voice-synced.

Changing the spoken script invalidates the alignment manifest.

Changing only UI wording does not.

## Current status

The synchronization engine is implemented in React, but no production audio manifests have been committed yet. Until they exist, the UI intentionally uses the safe guided-transcript fallback.
