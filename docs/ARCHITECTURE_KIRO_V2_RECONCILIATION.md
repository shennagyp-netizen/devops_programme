# Kiro → Podcast V2 Reconciliation

## Status
Kiro is treated as implementation evidence and feature inventory, not as an authority over architecture. Any Kiro requirement that conflicts with Podcast V2 is replaced by the V2 rule.

## Reused capabilities
- Persistent lesson-aware AI tutor.
- Text and browser voice input.
- Browser speech output for tutor responses.
- Responsive desktop/tablet/mobile learning shell.
- Mobile lesson-navigation toggle.
- Machine verification for B1.1 and B1.3.
- DNS interactive animation.
- CI validation workflow.

## Explicit V2 corrections
Kiro's human-recording/audio-manifest podcast milestone is not carried forward. Fixed podcast content remains:
four authored explanation levels → one selected transcript → browser TTS → runtime browser speech events.

Speech rates remain exactly 1×, 1.25×, 1.5×, and 2×. No static timing, guided timer, word-count timing, or speed-based duration inference is permitted.

The tutor never rewrites or regenerates the fixed podcast.

## Tutor boundary
The tutor receives an authenticated learner's lesson ID and bounded conversation history. The server rehydrates authoritative lesson context from the curriculum before calling the LLM Gateway. The browser never provides authoritative lesson text as a trusted system prompt.

Tutor responses are not persisted in the programme database. Offline retry stores only the pending question and lesson ID in browser storage.

## Responsive shell
Mantine AppShell is the UI-system boundary:
- <768px: one-column lesson with collapsible navigation.
- 768–1199px: navigation plus lesson.
- >=1200px: navigation + lesson + learning-tools aside.

## Verification and animation
B1.1 and B1.3 use the existing non-destructive machine verification envelope. DNS resolution is a contract-validated animation bound to D2.2. Voice-linked animation remains fail-closed until a real runtime boundary adapter exists.
