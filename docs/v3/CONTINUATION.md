# V3 Continuation Handoff

## Current branch

```text
v3/learning-framework
```

Base:

```text
main
```

V3 is intentionally additive. Main has not been replaced.

## Completed in this branch

- Established v3 learning-framework framing.
- Added a reusable framework contract layer.
- Added the first pure learning-authority policy seam.
- Added TDD coverage for:
  - client-declared completion rejection
  - learner/evidence ownership mismatch
  - learning-item/evidence mismatch
  - successful authoritative evidence transition
- Documented framework/programme/adapter boundaries.
- Documented the trust model and future attestation direction.

## Important architectural decision

Do not immediately rewrite existing progress code.

First create the authoritative policy boundary, then migrate current persistence and UI flows behind it.

## Immediate next work

### A. Server authority

Introduce a server-side transition service that:

1. authenticates the learner
2. resolves the authoritative learning item
3. resolves evidence references from the database
4. evaluates the v3 policy
5. performs the state transition transactionally

### B. Evidence authority

Introduce:

```text
EvidenceRecord
VerificationAttempt
VerificationProvider
Attestation
```

Keep browser evidence and verified evidence as separate concepts.

### C. Completion migration

Replace the current direct completion action with a v3 transition request.

The request should contain references, not client claims of truth.

### D. Mastery migration

Move mastery attempt counting and mastery state behind the same authority.

The browser may retain temporary remediation UX state, but authoritative attempt numbering comes from the server.

### E. Assessment migration

Create a server-owned assessment instance and attempt model.

Do not expose authoritative answer keys through client runtime data for operational assessments.

### F. Tutor migration

Reconstruct assistant history server-side or mark client-supplied assistant text as untrusted.

Add shared distributed rate limiting.

### G. Verification providers

Start with:

1. structured human evidence
2. local terminal agent
3. SSH
4. managed runtime as a future provider

Local-agent and SSH evidence must use server-verifiable provenance before they can unlock authoritative completion.

## V3 quality gate

A feature is not complete until:

```text
TDD
+
security red-team
+
server-authority test
+
integration test
+
documentation
```

For security-sensitive transitions, browser-only tests are insufficient.

## Deliberate non-goals

Do not:

- split repositories
- introduce microservices
- publish packages prematurely
- rewrite all UI components
- replace working DevOps content
- treat localStorage as authoritative learner state

## Exit criterion for v3 foundation

The framework foundation is ready for broader migration when:

- completion cannot be forged through a browser payload
- evidence provenance is server-verifiable
- assessment state is authoritative
- mastery state is authoritative
- tutor requests cannot manufacture authoritative conversation state
- shared rate limiting protects expensive endpoints
- existing DevOps content continues to pass its programme gates
