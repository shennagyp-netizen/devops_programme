# Mastery and Remediation Contract

> **V3 MVP security boundary:** mastery is an instructional, browser-local state, not a trusted credential.

The remediation system follows the same educational contract below, but all attempt counts and evidence are stored locally in the learner's browser.



## Product standard

The programme is not considered premium instructional content because it contains many lessons or hours of audio. A learner must be able to reach understanding through more than one representation and must receive a different teaching strategy after failure.

The target loop is:

Explain -> See -> Predict -> Operate -> Fail safely -> Diagnose -> Recover -> Prove mastery

The first pass uses at least three representations:
1. plain-language explanation
2. analogy or human model
3. visual/system representation

A hands-on assignment then provides the operational proof.

## Failure rule

An assignment failure must not immediately return the learner to the same assignment with the same explanation.

The remediation engine advances through stages:

1. Foundation reteach
   - plain language
   - analogy
   - visual explanation
   - micro-check
   - smaller guided retry

2. Mechanism reteach
   - causal mechanism
   - worked example
   - visual/analogy bridge
   - micro-check
   - guided evidence chain

3. Guided practice
   - solved example
   - controlled failure
   - smaller micro-assignment
   - evidence at each step

4. Prerequisite rewind
   - revisit the prerequisite
   - reconnect the mechanism
   - rebuild the system picture
   - return to the assignment only after the prerequisite proof

Further failure must create another coaching session rather than silently repeating the same material.

## Assignment state machine

The intended state machine is:

ready -> attempt -> failure -> remediation -> micro-check -> guided retry -> attempt

or:

ready -> attempt -> success -> mastery

A failed attempt is recorded as a distinct evidence event.

A successful mastery attempt is also recorded.

## Persistence

Mastery attempts are stored in browser `localStorage`.

The browser is allowed to decide its own instructional state because V3 does not claim:

- certification
- secure transcripts
- paid entitlement
- cross-device continuity
- tamper-resistant mastery records.

A learner who edits local storage can alter local mastery state. This is an accepted MVP limitation, not a hidden trust boundary.

The server does not receive a learner mastery result.

## Assessment philosophy

Difficulty must come from the engineering situation, not difficult English.

A strong assignment can contain:
- incomplete evidence
- misleading healthy signals
- interacting failures
- changing bottlenecks
- recovery constraints
- a need to defend the chosen diagnosis.

The learner should not be punished for weak English comprehension.

## $2,000-level quality gate

The programme should not be described as a premium certification product merely because it contains many lessons or hours of audio.

The premium learning proposition must come from:

- multiple representations of the same mechanism
- failure-triggered alternative teaching paths
- controlled failure and recovery labs
- progressive remediation
- project-level transfer
- evidence-oriented learning.

For V3 MVP, learner state is intentionally local and non-authoritative.

## Current implementation boundary

Implemented in this slice:
- three-way first-pass teaching preview
- adaptive remediation stages
- micro-checks
- guided retry tasks
- distinct failure evidence entries
- authenticated mastery-attempt persistence
- integration invariant covering all authored lessons.

Still required before claiming complete premium mastery:
- server-loaded historical mastery state in the initial lesson session
- lesson-specific authored remediation explanations for every concept
- machine-verified failure/recovery coverage across the hands-on catalogue
- deeper assessment failure explanations and alternate question forms
- production analytics for mastery progression
- final visual/browser validation.