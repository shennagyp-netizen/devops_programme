# DevOps Programme — Learning Framework V3

The DevOps Programme is the first reference programme implemented on a reusable, evidence-driven learning framework.

> **V3 branch:** `v3/learning-framework`  
> **Stable baseline:** `main`

## V3 direction

V3 reframes the product architecture from:

```text
DevOps course application
```

to:

```text
Learning Framework
    ↓
DevOps Programme
    ↓
Learner Experience / Runtime Adapters
```

The framework owns learning mechanics and authority. The DevOps programme owns domain curriculum. Runtime adapters own infrastructure integrations such as PostgreSQL, AI providers, local execution and SSH.

### Core principle

**The browser is an interaction surface, not the authority for learner state.**

Client state can request transitions and present evidence. Server-side framework policy decides whether a transition is valid.

## V3 framework capabilities

- Curriculum and learning-item contracts
- Competency and prerequisite relationships
- Server-authoritative learner-state transitions
- Evidence and verification contracts
- Pluggable verification providers
- Assessment authority
- Mastery and remediation
- AI tutor policy boundaries
- Podcast / voice contracts
- Reusable animation and interactive-content contracts

The first framework authority seam is now present at:

```text
app/src/framework/contracts.ts
app/src/framework/authority.ts
app/tests/unit/framework-authority.test.mjs
```

## Repository content

### Programme

- `courses/` — course-facing authored material
- `foundations/` — reusable competency material
- `projects/` — continuous project definitions
- `exams/` — assessment material
- `podcasts/` — spoken learning scripts
- `platforms/` — learner environment profiles

### Application

- `app/` — learner experience and framework integration
- `app/src/framework/` — reusable framework contracts and authority policy
- `app/src/components/` — presentation components
- `app/src/animations/` — reusable visual capabilities
- `app/tests/` — TDD, integration and security coverage

### V3 architecture documentation

- `docs/v3/LEARNING_FRAMEWORK_V3.md`
- `docs/v3/TRUST_MODEL.md`
- `docs/v3/FRAMEWORK_BOUNDARIES.md`
- `docs/v3/CONTINUATION.md`

## Existing DevOps learning model

The reference programme continues to use:

**Understand → Predict → Operate → Break → Diagnose → Repair → Recall → Design → Coach**

Diagnostics may reduce repeated explanation when evidence supports prior knowledge. Required competency demonstrations remain governed by the framework's completion policy.

## Development standard

V3 continues the repository's TDD and security-first discipline:

1. Write the invariant or contract test.
2. Implement the smallest abstraction that satisfies it.
3. Integrate it behind a server authority boundary.
4. Red-team the transition and evidence paths.
5. Preserve existing programme gates and content contracts.
6. Update the continuation handoff and architecture documentation.

## Security direction

V3 explicitly treats learning state as security-sensitive state.

The framework must prevent browser payloads from independently creating:

- completion
- mastery
- assessment results
- verified machine evidence
- eligibility transitions

See `docs/v3/TRUST_MODEL.md` for the authoritative trust model.
