# DevOps Programme Mission Plan

## V3 architecture direction

**Branch:** `v3/learning-framework`

V3 reframes this repository as a reusable learning framework with DevOps as the reference programme.

The three architectural layers are:

```text
Framework mechanics
    ↓
Programme definitions
    ↓
Experience + runtime adapters
```

The framework must remain domain-neutral. DevOps curriculum data must not become the framework's architecture.

## Framework responsibilities

- learning-item identity
- competency and prerequisite graph
- progression policies
- evidence lifecycle
- verification provider contracts
- server-authoritative transitions
- assessment state and scoring authority
- mastery and remediation state
- tutor policy
- reusable media and interactive-content contracts

## Programme responsibilities

- DevOps curriculum
- course/section/lesson definitions
- DevOps projects
- DevOps competencies
- DevOps diagnostic banks
- DevOps assessment content
- DevOps podcasts
- DevOps animations
- DevOps runtime tasks

## Adapter responsibilities

- authentication and session storage
- PostgreSQL
- AI gateway/provider
- local terminal execution
- SSH execution
- managed runtime/sandbox
- browser voice APIs
- deployment/runtime infrastructure

## V3 trust model

The browser is not authoritative for learning state.

A completion transition is:

```text
authenticated learner
      +
authoritative learning item
      +
authoritative verified evidence / assessment result
      ↓
framework policy
      ↓
learner-state transition
```

A client assertion such as `completed=true` or `verificationLevel=machine-verified` is never sufficient on its own.

## V3 foundation already implemented on branch

- Framework learning contracts
- Pure learning-authority decision function
- TDD coverage for:
  - client completion forgery rejection
  - learner/evidence ownership mismatch
  - learning-item/evidence mismatch
  - successful authoritative evidence transition
- V3 architecture documentation
- V3 trust model
- V3 framework/programme/adapter boundaries
- V3 continuation handoff

## Existing course architecture

The programme remains intentionally split into:

- Beginner — DevOps Through Problems
- Intermediate — DevOps Engineering
- Advanced — Large-Scale Distributed Systems

Foundations are reusable competency nodes rather than a single academic prerequisite block.

Each course has three continuous projects.

## Learning adaptation

The learner chooses:

- macOS
- Linux
- Windows

Diagnostics can determine what theory can be condensed or skipped. Required demonstrations remain governed by learning-item completion policies.

## Assessment architecture

Each section continues toward:

- conceptual assessment
- diagnostic assessment
- hands-on assessment

V3 adds an authority boundary between assessment presentation and authoritative assessment state.

Operational assessment answer keys and scoring decisions must not be controlled by client state.

## Mastery architecture

V3 treats mastery as a competency state rather than a UI flag:

```text
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
  ↓
mastery transition
```

The framework owns this lifecycle; DevOps owns the domain-specific representations.

## AI tutor

The tutor is a coach, not an authority.

It may explain, question, compare representations and guide diagnosis.

It may not independently grant:

- mastery
- completion
- assessment pass
- verified evidence

## Migration strategy

Do not rewrite the repository wholesale.

Migrate by trust boundary:

1. framework contracts
2. policy tests
3. server-side transition service
4. authoritative evidence records
5. completion migration
6. mastery migration
7. assessment migration
8. tutor conversation/state migration
9. verification-provider migration
10. UI simplification around the new authority

## V3 exit criteria

V3 foundation is complete when:

- browser payloads cannot forge completion
- machine evidence has verifiable provenance
- assessment state is authoritative
- mastery state is authoritative
- tutor cannot manufacture authoritative assistant state
- expensive endpoints have shared abuse controls
- existing DevOps content and quality gates remain green
