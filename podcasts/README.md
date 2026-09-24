# Podcast Library

The library contains 37 normal-text episode scripts: five original day-grouped files, ten Beginner lessons, and eleven Advanced lessons. Stable episode IDs are preserved.

## Human speech is a hard requirement

These are not narrated lessons and not "two AI voices taking turns."

The intended sound is two competent engineers sitting together with the problem in front of them. They interrupt naturally, disagree sometimes, change their minds when evidence appears, finish each other's thought occasionally, and use ordinary spoken language.

The dialogue must feel comfortable when spoken aloud at normal speed.

A good episode should pass these checks:

- Does it sound believable when read aloud?
- Would a real engineer actually say these sentences this way?
- Are the speakers recognisably different people?
- Do they sometimes disagree or correct themselves?
- Is the conversation driven by the actual problem rather than by lecture structure?
- Does the learner get invited to predict, act, diagnose and explain?
- Are analogies brief and followed by the literal technical mechanism?
- Is humour occasional rather than manufactured?

Bad signs:
- perfect A/B alternation
- "great question" after every question
- corporate transitions
- textbook definitions appearing as dialogue
- constant agreement
- generic motivational statements
- excessive filler
- a speaker who sounds like a professor or voice-over narrator

## Learning rhythm

problem -> competing hypotheses -> mental model -> prediction -> operation -> failure -> evidence -> diagnosis -> repair -> recall -> production transfer -> challenge

The rhythm should be felt, not announced.

## Technical / human balance

The target is roughly:
- 75% technical reasoning, troubleshooting, architecture and retrieval
- 25% familiar real-life situations, workplace moments, analogies and short observational jokes

The percentages are design targets, not a mechanical requirement for every episode.

## React co-teacher

The React app wraps the spoken lesson in active learning:

1. Make a prediction before listening.
2. Listen to the episode.
3. Pause at spoken prediction cues.
4. Use the transcript only when needed.
5. Run the platform-specific lab.
6. Complete retrieval.
7. Carry the result back into the project.

The podcast teaches through conversation. The React app provides the interactive control layer.

## Audio generation

Use `prompts/google_ai_studio_podcast_prompt.txt`.

The text scripts are the source. Audio is a derived presentation format.
