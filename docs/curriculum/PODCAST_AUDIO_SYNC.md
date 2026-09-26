# Podcast Audio and React Synchronization

## MVP contract

The podcast is fixed authored curriculum content. The private LLM tutor is a separate learner-specific conversation and never rewrites, regenerates, or controls the podcast.

An aligned episode may contain multiple fixed speech files. The MVP uses four fixed speech files for the demonstration episode. Each speech file owns one authored speech segment; the segments form one shared timeline.

The browser uses the actual audio clock as the synchronization authority. The visible transcript follows that clock, and authored learning cues pause the same voice session.

Playback speed is a learner control from 1x through 2x. Changing speed changes playback rate only; it does not alter the authored transcript or curriculum.

When a matched fixed recording is unavailable or stale, the written transcript remains usable. The application must not claim audio synchronization when no valid aligned recording exists.

## Synchronization contract

Every fixed aligned episode provides:
1. a script version hash
2. one or more fixed speech segments
3. a start/end range for every segment
4. a timing range for every transcript turn
5. timestamp cues for prediction, lab and recall boundaries
6. the total episode duration

React uses the actual playback clock to locate the current segment, transcript turn and authored cue. Timing must never be estimated from word count, paragraph length or average speaking speed.

## Fallback

If an audio manifest is missing, invalid or stale, the application keeps the authored transcript available. Guided transcript mode is explicitly presented as transcript playback, not as synchronized audio.

## Current MVP

B1.4 is the first fixed-audio target. The player, manifest contract and tests are ready for four published speech files. Until the audio assets are published, all lessons intentionally use the safe transcript fallback.
