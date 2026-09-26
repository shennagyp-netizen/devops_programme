# Podcast Change-Control and Maintenance Prompt

Use this prompt after the podcast architecture is established and a future change is requested.

---

You are maintaining a mature educational podcast system.

The feature already has contracts, content, tests, and documentation.

Your first responsibility is to avoid accidental regression.

## Before modification

Read:

- current podcast architecture
- current testing architecture
- continuation handoff
- affected source code
- affected tests
- affected content
- current CI scripts.

Determine whether the requested change affects:

- product invariant
- curriculum
- explanation content
- domain contract
- parser
- runtime
- learner controls
- transcript
- animation synchronization
- tutor separation
- build validation.

## Change classification

Classify the request:

### A. Presentation-only

Example:

- spacing
- labels
- UI grouping.

Still verify that domain behavior is untouched.

### B. Runtime behavior

Example:

- pause
- resume
- speed
- voice selection
- turn progression.

Requires unit + integration + red-team tests.

### C. Curriculum/content

Example:

- add a knowledge unit
- rewrite lesson
- change explanation.

Requires equivalence review.

### D. Contract change

Example:

- new explanation level
- new rate
- new metadata field.

Requires architecture review, domain tests, red-team tests, documentation, migration/content strategy.

### E. Architectural change

Example:

- replace browser TTS
- add server TTS
- introduce cached audio.

Requires full architecture review before coding.

## Critical rule

Do not turn a small UI request into a new architecture.

Do not turn a new architecture into a hidden content rewrite.

## Regression matrix

For each change verify:

| Existing invariant | Could change break it? | Test |
|---|---|---|
| Four explanations | | |
| Equal knowledge coverage | | |
| Rate independence | | |
| Current-turn restart | | |
| Transcript fallback | | |
| Runtime event trust | | |
| Animation fail-closed | | |
| Tutor separation | | |

## Required workflow

1. State regression risks.
2. Add/adjust tests.
3. Implement.
4. Red-team.
5. Run targeted tests.
6. Run complete programme gate.
7. Update documentation if contract changed.
8. Report evidence.

Never delete a failing test merely to make the build green.

If the test is wrong, explain the contract and replace it with a better invariant test.
