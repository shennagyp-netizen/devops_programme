# Podcast Audio and React Synchronization

## Non-negotiable rule

React must never estimate spoken position from:
- character count
- word count
- average speaking speed
- paragraph length
- number of turns

Those values vary with speaker, voice, pauses, pronunciation and recording style.

## Synchronization contract

Every generated audio episode has:

1. the exact source script revision
2. a stable episode ID
3. a stable turn ID for every dialogue turn
4. a timing range for every dialogue turn
5. audio duration
6. timestamp cues for learner-control events

Turn IDs follow:

`<episodeId>.T001`, `<episodeId>.T002`, ...

Example:

`D2.2.T014`

The manifest therefore has two timing layers.

### Layer 1 — spoken turn timing

Every dialogue turn has:

`turnId + startMs + endMs`

React uses this layer to keep the visible transcript aligned to the voice.

### Layer 2 — learning cues

Important interactions have:

`turnId + kind + startMs + optional endMs`

Supported cue types:
- `prediction`
- `lab`
- `recall`
- `transition`

React uses this layer to pause the voice and hand control to the learner.

## Why the layers are separate

A turn is a speech unit.

A cue is an instructional event.

They are not the same thing.

For example, Speaker A can say:

"Okay, make a prediction. If the DNS record is stale, what would you expect?"

That sentence is one spoken turn with one turn timing range. The prediction cue can point into that turn at the moment where the learner should stop.

## Synchronization behavior

When aligned audio is available:

1. audio playback time is authoritative
2. React displays the turn containing that time
3. React pauses when it crosses an authored learning cue
4. learner performs the interaction
5. React resumes the same audio position
6. the next turn/cue continues naturally

React does not attempt to predict where the voice should be.

## Audio generation workflow

1. Freeze the episode script revision.
2. Generate the voice recording.
3. Align the recording to the transcript.
4. Produce `audioUrl`, `durationMs`, all turn timings, and learning cues.
5. Store the manifest.
6. Listen through every pause and verify the cue lands at the intended spoken moment.
7. Only then mark the episode voice-synced.

Changing the spoken script invalidates its audio manifest.

Changing only React UI text does not.

## Fallback

Until aligned audio exists, the application deliberately uses guided transcript mode.

It must not fake synchronization by estimating timing.

## Current status

The synchronization engine and manifest schema are implemented in React. Production audio manifests are not committed yet, so current episodes intentionally use the safe guided-transcript fallback.
