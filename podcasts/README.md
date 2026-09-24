# Podcast Library

Five normal-text files contain all 32 episode scripts, grouped by day. Stable episode IDs are preserved.

## How the podcast works

These are written as spoken conversations between two engineers, not as textbook narration.

The target balance is roughly:
- 75% technical reasoning, troubleshooting, architecture and retrieval.
- 25% real-life situations, familiar stories, analogies and short jokes.

The dialogue deliberately uses interruptions, disagreement, contractions, short turns, corrections and natural transitions. The listener should feel like two engineers are working through a problem together.

Every episode should move through the same learning rhythm without announcing it as a formal lecture:

problem -> mental model -> real-life example -> prediction -> failure -> diagnosis -> Mac lab -> recall -> production transfer

## React co-teacher

The React app wraps the spoken lesson in an active-learning loop:

1. Make a prediction before listening.
2. Listen to the episode in your audio player.
3. Pause when the speaker asks for a prediction.
4. Use the in-app transcript only when a spoken section was unclear.
5. Run the Mac lab.
6. Complete retrieval questions without notes.

The app stores learner answers and mastery locally in the browser. No podcast database is required.

The current co-teacher uses manual audio synchronization: the learner controls the external audio and advances the transcript/exercise cards in the React app.

## Audio generation

Use prompts/google_ai_studio_podcast_prompt.txt when generating the spoken version. The prompt is specifically written to make the delivery sound like natural conversation rather than AI-style narration.

The text files remain the source scripts. Audio is a derived presentation format.