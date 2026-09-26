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

- Established the reusable v3 learning-framework framing.
- Added the framework authority contracts and pure policy.
- Added a strict completion command boundary with browser trust fields rejected.
- Added a shared immutable programme registry with explicit evidence completion policies.
- Added server-owned verified evidence persistence with attestation-digest validation.
- Added transactional completion authority with proof links and legacy-row normalization.
- Removed the legacy direct completion writer from the progress service.
- Filtered progress reads to authoritative completions only.
- Gated the UI completion control on server-verified evidence.
- Added TDD and red-team coverage for the new trust boundary.
- Full GitHub Actions gate is green for the current branch state.


## Important architectural decision

Do not immediately rewrite existing progress code.

First create the authoritative policy boundary, then migrate current persistence and UI flows behind it.

## Latest TDD and red-team work

The completion-authority migration is complete for this slice. The remaining trust gap is now explicitly the **verification-provider attestation boundary**, not the completion persistence path.

### Immediate next work

### A. Verification-provider authority

Formalize the provider SPI:

```text
VerificationProvider
  -> challenge
  -> provider execution
  -> attestation
  -> server verification
  -> VerifiedEvidenceRecord
```

The browser may request verification, but it must never be able to mint the resulting `VerifiedEvidenceRecord`.

### B. Machine verification migration

Move local-agent and SSH execution behind the provider boundary.

The server must verify:

- task identity and contract version
- learner binding
- challenge/reference identity
- attestation digest
- issued-at / expiry / replay protection
- provider identity
- execution-mode constraints

### C. Mastery migration

Move mastery outcome semantics behind the same authority.

### D. Assessment migration

Issue server-owned assessment instances and score them against server-owned keys/rubrics.

### E. Tutor migration

Reconstruct trusted assistant history server-side and add shared distributed rate limiting.

### F. Quality hardening

Add a security regression gate that proves:

- authoritative completion requires an evidence proof link;
- browser/localStorage evidence cannot become server-authoritative;
- old forged metadata is normalized or ignored;
- new migrations preserve referential integrity.

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
+
CI green
```


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

## Exit criterion for the current V3.1 slice

This slice is complete when:

- browser completion payloads cannot mint completion;
- completion requires server-verified evidence;
- legacy completion metadata is not trusted as authoritative;
- evidence proof links are transactional;
- programme metadata is server/registry authoritative;
- TDD, red-team, typecheck, and production build are green.

## Exit criterion for the broader V3 foundation

The broader framework is ready for broader migration when:

- completion cannot be forged through a browser payload
- evidence provenance is server-verifiable
- assessment state is authoritative
- mastery state is authoritative
- tutor requests cannot manufacture authoritative conversation state
- shared rate limiting protects expensive endpoints
- existing DevOps content continues to pass its programme gates
