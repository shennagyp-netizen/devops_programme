# Learning Framework v3

**Branch:** `v3/learning-framework`  
**Reference programme:** DevOps Programme  
**Status:** Architecture and contract foundation in progress

## 1. Purpose

Version 3 reframes the repository from a DevOps application into a reusable **learning framework** with DevOps as its first complete programme.

The framework answers:

- how learning content is represented
- how competencies and prerequisites are modeled
- how a learner progresses
- how evidence is produced and verified
- how assessments become authoritative
- how mastery and remediation work
- how tutoring adapts presentation without becoming an authority
- how media, podcast, animation and hands-on capabilities plug into learning items

The DevOps programme answers a different question:

> What should this particular learner learn and demonstrate about DevOps?

The application answers a third question:

> How should the learner experience the framework?

## 2. Core architectural statement

> **The client is an interaction surface. The framework authority is the source of truth for learning state.**

The browser can:

- render content
- collect learner input
- request transitions
- display evidence
- call approved verification providers
- request tutoring
- store temporary offline UI state

The browser cannot authoritatively decide:

- that a learning item is complete
- that an assessment is passed
- that machine execution occurred
- that evidence is valid
- that mastery has been achieved
- that a prerequisite has been satisfied

## 3. Three-layer product model

### Framework

Reusable learning mechanics:

```text
learning-framework
├── curriculum model
├── competency model
├── learning-item contracts
├── progression authority
├── evidence contracts
├── verification provider SPI
├── assessment authority
├── mastery/remediation
├── tutoring policy
├── media/animation contracts
└── learner-state model
```

### Programme

Domain-specific teaching:

```text
programmes/devops
├── courses
├── sections
├── lessons
├── projects
├── competencies
├── assessment banks
├── diagnostics
├── runtime tasks
├── podcasts
└── illustrations
```

### Experience / adapters

Runtime implementations:

```text
application
├── web learner UI
├── audio / speech
├── local terminal adapter
├── SSH adapter
├── managed sandbox adapter
├── AI provider
├── database
└── deployment
```

Dependency direction is intentional:

```text
Experience / adapters
        ↓
Programme definitions
        ↓
Learning framework contracts
```

The framework must not import DevOps lesson data.

## 4. Learning item abstraction

Everything the learner can meaningfully complete is modeled as a learning item.

Supported kinds:

- lesson
- assignment
- question
- project
- assessment

A learning item contains stable identity, programme ownership, competency relationships, prerequisites and a completion policy.

The completion policy is declarative. It says what evidence or assessment result is required without embedding implementation details.

## 5. Evidence abstraction

Evidence is separate from completion.

An evidence record answers:

> What happened, where did it happen, which learner does it belong to, and which verifier established it?

A verified evidence record therefore has:

```text
Evidence
├── identity
├── learner identity
├── learning item
├── evidence kind
├── verifier identity
├── verification reference
└── verification timestamp
```

A client assertion is not verified evidence.

The v3 authority must resolve evidence from a server-controlled evidence store or a server-verifiable attestation provider.

## 6. Verification provider abstraction

Verification is a provider capability, not a DevOps-specific implementation.

Target SPI:

```text
VerificationProvider
├── capability declaration
├── execution / observation
├── evidence production
└── server-side verification
```

Initial provider families:

- human/self-report
- structured evidence
- local machine
- SSH machine
- managed sandbox
- deterministic simulation
- future specialized providers

A provider may be trusted for observation without being trusted for completion. The framework makes that distinction explicit.

## 7. Learning authority

The authority evaluates a transition request against authoritative definitions and server-known evidence.

Conceptually:

```text
Transition Request
      ↓
Resolve authoritative learning item
      ↓
Resolve learner identity from session
      ↓
Resolve referenced evidence
      ↓
Verify learner ownership
      ↓
Verify item ownership
      ↓
Check completion policy
      ↓
Commit learner-state transition
```

The first v3 code seam is implemented in:

```text
app/src/framework/contracts.ts
app/src/framework/authority.ts
app/tests/unit/framework-authority.test.mjs
```

It is deliberately pure and dependency-light so policy can be tested independently of PostgreSQL, Next.js and browser state.

## 8. Assessment authority

Assessment has four different objects:

```text
Assessment Definition
        ↓
Assessment Instance
        ↓
Learner Attempt
        ↓
Scoring / Evidence
        ↓
Mastery or completion transition
```

The browser can render a question. It cannot own the answer key or final result.

Future assessment work must keep scoring and eligibility server-authoritative.

## 9. Mastery abstraction

Mastery is a competency state, not merely a UI button.

The framework should support:

```text
competency
   ↓
evidence
   ↓
diagnosis
   ↓
representation selection
   ↓
remediation
   ↓
retry
   ↓
new evidence
```

Representation choices remain reusable framework capabilities:

- plain language
- mechanism
- analogy
- visual
- worked example
- controlled failure
- guided practice

A DevOps programme supplies the domain-specific explanations.

## 10. Tutor boundary

The AI tutor is a coach.

It may:

- explain
- ask questions
- compare representations
- suggest observations
- interpret learner-provided evidence
- adapt difficulty and language

It may not:

- grant mastery
- create authoritative assessment results
- fabricate verified evidence
- modify learner progress directly
- bypass completion policies

The tutor receives framework context rather than owning framework state.

## 11. Media and presentation

Podcast, voice synchronization and animation are presentation capabilities attached to learning definitions.

A lesson can select:

```text
content representation
audio representation
visual representation
interactive representation
hands-on representation
assessment representation
```

The learning framework owns the contracts.

The programme chooses the concrete assets.

## 12. Trust zones

### Zone A — Untrusted client

Includes:

- browser state
- localStorage
- query parameters
- submitted evidence text
- client-selected IDs
- client-reported completion
- client-generated timestamps
- imported JSON

### Zone B — Server policy

Includes:

- authenticated learner identity
- programme definitions
- learning-item definitions
- completion policies
- assessment rules
- authoritative learner state

### Zone C — Verified external execution

Includes:

- authenticated local-agent attestations
- verified SSH execution
- managed sandbox results
- other provider-specific proofs

Crossing from Zone A to Zone B requires server validation.

Crossing from Zone C to Zone B requires provider verification.

## 13. V3 migration rule

Do not perform a large rewrite merely to rename folders.

Migrate by replacing trust boundaries first:

1. define contracts
2. add policy tests
3. introduce authoritative server decisions
4. move evidence creation behind provider boundaries
5. migrate assessment state
6. migrate mastery state
7. migrate tutor state
8. only then simplify the UI/application structure

The current DevOps UI remains usable during migration.

## 14. Non-goals for the initial v3 branch

- splitting into multiple repositories
- publishing framework packages
- replacing the existing content model immediately
- rebuilding every React component
- implementing every verification provider
- introducing a distributed event bus
- adding unnecessary microservices

V3 is an abstraction and trust-model evolution, not a technology rewrite.
