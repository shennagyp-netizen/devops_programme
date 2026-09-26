# Podcast Prompt Library

This directory is the reusable AI prompt library for the podcast/co-teacher system.

The prompts are intentionally specific. They are not generic "write a podcast" prompts. Each prompt tells an AI agent:

- what the product invariant is
- which repository contracts are authoritative
- what it must inspect before acting
- what it may change
- what it must never change
- what tests and red-team checks are required
- what artifacts it must return
- how to report uncertainty
- how to distinguish implemented behavior from planned behavior.

## Authoritative repository documents

Before using a prompt, the AI agent should read the repository documents that are relevant to the task.

The most important podcast contracts are:

- `docs/curriculum/PODCAST_TTS_ARCHITECTURE_V2.md`
- `docs/curriculum/PODCAST_AUDIO_SYNC.md`
- `docs/curriculum/COURSE_DESIGN_STANDARDS.md`
- `docs/curriculum/HUMAN_CONTENT_CONTRACT.md`
- `docs/TESTING_ARCHITECTURE.md`
- `docs/CONTINUATION_HANDOFF_CURRENT.md`

The repository itself is the source of truth for current implementation details. Do not assume that an example in a prompt still matches the code. Inspect the code and tests.

## Prompt index

### Architecture and engineering

| Prompt | Purpose |
|---|---|
| `01_MASTER_PODCAST_AGENT.md` | Full operating contract for an AI engineer working on the podcast system |
| `02_ENGINEERING_IMPLEMENTATION.md` | Implement or extend a podcast feature with TDD and red-team validation |
| `03_ARCHITECTURE_REVIEW.md` | Review an existing implementation for architectural drift and unnecessary complexity |
| `04_TEST_AND_REDTEAM.md` | Build or strengthen unit, integration, mutation, and red-team coverage |
| `15_CHANGE_CONTROL_AND_MAINTENANCE.md` | Safely modify the podcast system after it is already established |

### Content architecture and generation

| Prompt | Purpose |
|---|---|
| `05_CURRICULUM_ANALYSIS.md` | Convert curriculum requirements into a canonical podcast teaching contract |
| `06_KNOWLEDGE_MAP_GENERATOR.md` | Build the canonical information-unit map before script writing |
| `07_GENERAL_PODCAST_GENERATOR.md` | Generate one complete lesson podcast for any subject |
| `08_FOUR_LEVEL_EXPLANATION_GENERATOR.md` | Generate the four equivalent explanation levels |
| `09_SCRIPT_ILLUSTRATION_COAUTHOR.md` | Co-author spoken script and visual/interactive teaching behavior |
| `10_BATCH_PROGRAMME_GENERATOR.md` | Generate podcast content systematically across a course or programme |

### Quality and runtime

| Prompt | Purpose |
|---|---|
| `11_SEMANTIC_EQUIVALENCE_REVIEW.md` | Review whether four scripts really teach the same information |
| `12_SPOKEN_LANGUAGE_AND_TTS_QA.md` | Make scripts sound natural and safe for browser TTS |
| `13_TTS_RUNTIME_QA.md` | Review browser TTS behavior, speed controls, state, fallback, and synchronization |
| `14_AI_TUTOR_SEPARATION.md` | Design and review the separation between fixed podcast content and private LLM tutoring |
| `16_RELEASE_GATE.md` | Execute the final content + engineering + red-team release gate |

## Required working method

Do not start by editing JSX or rewriting scripts.

Use this order whenever the task is substantial:

1. Read the relevant authoritative documents.
2. Inspect the actual implementation and content.
3. State the product invariant that is being protected.
4. Identify the owning layer.
5. Add or adjust tests before implementation when behavior changes.
6. Add negative/red-team tests for corruption modes.
7. Implement the smallest coherent change.
8. Run targeted tests.
9. Run the full programme gate.
10. Update documentation and handoff if the architecture changed.
11. Report exactly what was verified.

## Core podcast invariant

One lesson has one podcast subject and four complete explanations of the same information:

1. Very simple
2. Simple technical
3. Professional
4. Expert

Speech rate is a separate presentation control:

- 1x
- 1.25x
- 1.5x
- 2x

Speech rate may change only how quickly the selected authored explanation is spoken. It must not select, remove, summarize, reorder, or regenerate learning content.

## Source-of-truth rules

The following hierarchy is mandatory:

Curriculum requirement
-> canonical knowledge model
-> authored explanation scripts
-> parser
-> TTS runtime
-> learner UI

For visuals:

Curriculum
-> ordered lesson content
-> illustration binding
-> reusable animation capability
-> runtime renderer

For private tutoring:

Curriculum + lesson context
-> private tutor conversation

The private tutor is not an authoring source for the fixed podcast.

## Failure philosophy

When information required for safe operation is missing or contradictory, fail closed.

Never silently:

- invent a script
- choose another explanation
- shorten content to hide an error
- infer timing
- accept malformed metadata
- fall back to a generic visual
- allow the AI tutor to rewrite the authored lesson.

## Content generation rule

Never write four scripts independently and compare them afterward.

The preferred authoring pipeline is:

curriculum
-> knowledge map
-> explanation 1
-> explanation 2
-> explanation 3
-> explanation 4
-> structural equivalence
-> semantic equivalence
-> spoken-language QA
-> TTS QA
-> publication.

## Output discipline

Every AI agent using these prompts must distinguish:

- implemented
- tested
- manually reviewed
- proposed
- blocked
- unknown

Do not report a proposal as implemented.

Do not report a passing unit test as browser visual verification.

Do not report structural @knowledge equivalence as complete semantic equivalence.

## Recommended prompt order

For creating a new lesson from nothing:

`05 -> 06 -> 07 -> 08 -> 09 -> 11 -> 12 -> 16`

For changing the runtime:

`01 -> 02 -> 04 -> 13 -> 16`

For reviewing an existing lesson:

`05 -> 11 -> 12 -> 09 -> 16`

For changing tutor behavior:

`14 -> 04 -> 13 -> 16`

For maintaining a mature system:

`15 -> 04 -> 16`
