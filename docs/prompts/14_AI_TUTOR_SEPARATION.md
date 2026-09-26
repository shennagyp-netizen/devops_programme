# AI Tutor Separation Prompt

Use this prompt when integrating an LLM tutor with the fixed educational podcast.

---

You are designing an AI tutor for a structured learning platform.

The key requirement is that the private tutor must add conversational help without becoming the source of truth for the fixed podcast.

## Two distinct products

### Fixed podcast

Authored by curriculum/content authors.

Its content is versioned and validated.

It is the stable instructional sequence.

### Private tutor

Generated dynamically by an LLM.

It responds to the learner's questions and reasoning.

It is conversational and adaptive.

These systems must remain separate.

## Tutor may do

The tutor may:

- explain a concept in another way
- answer "why?"
- answer "what if?"
- examine learner reasoning
- challenge an incorrect prediction
- give hints
- provide additional examples
- explain an error
- connect the current lesson to previous knowledge
- suggest what evidence the learner should inspect.

## Tutor must not do

The tutor must not silently:

- rewrite the authored podcast
- replace podcast turns
- change the selected explanation level
- alter speech rate
- become the animation timing authority
- mutate canonical knowledge units
- create a new official lesson version
- store its answer as the official spoken script without a separate authoring workflow.

## Context boundary

The tutor may receive structured lesson context such as:

- lesson ID
- objective
- selected explanation level
- current turn ID
- knowledge unit ID
- learner action
- observed result
- assessment state.

Only send data necessary for the task.

Do not expose internal identifiers unless required.

## Truth hierarchy

When answering:

1. authored curriculum facts are authoritative
2. verified runtime evidence is authoritative for current system state
3. tutor reasoning is explanatory
4. uncertainty must be stated.

The tutor must not manufacture runtime evidence.

## Handling disagreement

If the learner says:

"The podcast says X, but I think Y."

The tutor should:

- identify the exact claim
- explain what the authored curriculum says
- distinguish that from the learner's interpretation
- use evidence where available
- tell the learner when the authored material itself needs review.

Do not silently rewrite the lesson.

## Product separation

The UI should make the distinction clear:

AUTHORED PODCAST
versus
PRIVATE AI TUTOR.

The learner should know when a response is generated dynamically.

## Security and data

Review:

- prompt injection from learner content
- attempts to get the tutor to mutate the curriculum
- attempts to reveal hidden system instructions
- cross-learner data leakage
- unauthorized lesson context access
- storage of generated content as authoritative content.

## Testing

Test:

- tutor cannot mutate podcast source
- tutor cannot change explanation level
- tutor cannot change speech rate
- tutor output is labeled as generated
- tutor receives only approved lesson context
- malicious learner instructions do not change content source of truth.

## Output

Return:

1. boundary design
2. data passed into tutor
3. data not passed
4. tool permissions
5. prompt rules
6. UI separation
7. security threats
8. tests
9. failure behavior
10. human-review questions.
