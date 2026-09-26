# V3 Trust Model

## Principle

Learning state is security-sensitive application state.

A learner may control the interface but must not control the truth that the interface represents.

## Authoritative objects

The server is authoritative for:

- authenticated learner identity
- programme and learning-item definitions
- prerequisite relationships
- completion policies
- assessment definitions and scoring
- verified evidence records
- mastery state
- completion history
- eligibility transitions

## Client-submitted objects

Client data is always treated as claims:

- selected lesson
- selected mode
- evidence text
- evidence references
- assessment answers
- tutor messages
- local timestamps
- machine-verification envelopes
- imported verification files

The server must validate every claim against authoritative context.

## Security consequences

### Completion

Never accept a request equivalent to:

```text
completed=true
verificationLevel=machine-verified
```

as sufficient proof.

Instead:

```text
completion request
    + authoritative item
    + authoritative learner
    + authoritative evidence
    → policy decision
```

### Machine verification

Never trust an arbitrary JSON envelope simply because its fields match a schema.

A real verifier must establish provenance and freshness.

The future attestation flow is:

```text
server challenge
      ↓
verifier / agent
      ↓
signed or otherwise authenticated proof
      ↓
server verification
      ↓
verified evidence record
```

Replay protection should be based on challenge identity and expiry.

### Assessment

Question content may be public; authoritative answer keys and scoring decisions should not be client-controlled.

### AI tutor

The client may provide user messages. Assistant history that affects model semantics should be reconstructed from server state or clearly marked as untrusted context.

## Security invariant

A useful v3 review question is:

> Could a learner edit the browser payload and create a state transition they could not legitimately obtain?

If yes, the boundary is incomplete.

## Abuse controls

The framework should provide shared controls for:

- login attempts
- registration attempts
- tutor calls
- assessment submissions
- evidence submissions
- verification requests
- resource-intensive provider execution

Rate limiting must not depend solely on process-local memory in a horizontally scaled deployment.
