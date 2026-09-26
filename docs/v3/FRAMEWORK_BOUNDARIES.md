# V3 Framework Boundaries

## Framework owns

### Curriculum mechanics
- item identity
- prerequisites
- competency relations
- learning modes
- progression policies

### Evidence
- evidence identity
- evidence lifecycle
- provenance
- verification status
- retention policy

### Authority
- transition evaluation
- completion state
- mastery state
- assessment eligibility
- learner state integrity

### Adaptation
- diagnostic interpretation contract
- remediation policy
- representation selection
- tutor context contract

### Experience contracts
- podcast synchronization
- animation selection
- interactive content contracts
- hands-on provider contracts

## DevOps programme owns

- Linux concepts
- networking concepts
- containers
- Kubernetes
- CI/CD
- infrastructure
- observability
- distributed systems
- projects
- DevOps-specific assessments
- DevOps-specific runtime tasks
- DevOps-specific scripts and examples

## Adapter layer owns

- PostgreSQL implementation
- Next.js request handling
- authentication/session storage
- local terminal service
- SSH transport
- managed runtime
- LLM provider
- browser speech APIs
- deployment platform

## Forbidden dependencies

The framework must not directly depend on:

- a specific DevOps lesson ID
- a DevOps project name
- a specific AI vendor
- a specific terminal command
- Next.js request objects
- PostgreSQL query objects
- React components

The DevOps programme may depend on framework contracts.

Adapters may implement framework provider interfaces.

## Stable v3 identifiers

The framework should eventually distinguish:

```text
programmeId
courseId
sectionId
learningItemId
competencyId
evidenceId
assessmentId
attemptId
transitionId
providerId
```

Do not use UI labels as authoritative identifiers.

## Versioning

Framework contracts and programme content should version independently.

Example:

```text
frameworkContractVersion = 3
programmeVersion = devops-1.x
contentRevision = lesson-specific
```

A content correction should not require a framework migration unless its contract changes.
