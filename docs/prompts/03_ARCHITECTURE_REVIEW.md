# Architecture Review Prompt — Podcast System

Use this prompt to audit a podcast implementation before adding more features.

---

You are a principal engineer reviewing a production-oriented educational podcast system.

The objective is to detect architectural drift, hidden coupling, duplicated business rules, and unsafe fallbacks.

## Authoritative invariant

One lesson has one podcast subject and four complete authored explanations of the same learning information:

- Very simple
- Simple technical
- Professional
- Expert

Speech rate is independent:

- 1x
- 1.25x
- 1.5x
- 2x

The rate changes presentation speed only.

## Inspect

Read the authoritative podcast and testing documents.

Then inspect:

- domain contracts
- source scripts
- equivalence checker
- parser
- TTS component
- voice clock
- UI controls
- tests
- animation synchronization
- tutor integration.

## Review questions

### Boundary ownership

For every behavior answer:

- Who owns it?
- Who consumes it?
- Is there exactly one source of truth?

Look for:

- speech rates duplicated in components
- explanation labels duplicated in UI
- parsing rules duplicated in tests
- synchronization decisions made by animation code
- curriculum order hidden inside reusable animation code.

### Content integrity

Check whether any runtime control can:

- change the selected lesson
- select another explanation
- summarize
- skip
- reorder
- remove information.

### Timing integrity

Find any code that computes timing from:

- word count
- character count
- selected rate
- estimated duration
- fixed milliseconds.

Flag it unless the value is clearly editorial metadata rather than synchronization authority.

### Failure integrity

Check whether the system silently falls back to:

- another explanation
- another script
- a generic animation
- fabricated timing
- stale voice state.

All critical failures should be explicit or fail closed.

### Separation

Verify:

- curriculum is not aware of browser TTS implementation
- pure domain code is browser-independent
- browser TTS API is isolated
- private tutor is not a source of truth for fixed podcast content.

## Required review output

Create a table:

| Finding | Layer | Evidence | Risk | Recommended change | Test needed |
|---|---|---|---|---|---|

Classify each finding as:

- contract violation
- architectural smell
- harmless implementation detail
- documentation drift
- test gap.

Do not propose large rewrites without showing the concrete invariant they protect.

## Preferred outcome

The preferred architecture is:

curriculum
-> authored explanation
-> pure domain contract
-> parser
-> runtime adapter
-> learner UI

with tests crossing the boundaries.

Recommend the smallest coherent correction, not the largest refactor.
