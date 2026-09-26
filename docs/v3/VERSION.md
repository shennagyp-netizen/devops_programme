
# Learning Framework V3

- **Milestone:** Standalone Learning Framework MVP
- **Branch:** v3/learning-framework
- **Baseline:** main
- **Canonical framework:** framework/
- **First consumer:** DevOps Programme
- **Status:** MVP boundary green

## Architectural meaning

V3 is no longer a DevOps refactor pretending to be a framework.

The framework is a separate product boundary inside the repository.

It contains:

- generic learning core;
- experience runtime;
- provider interfaces;
- complete reusable React learning application;
- neutral demo programme.

DevOps will consume it later.

## Green gate

The independent framework workflow verifies:

- unit tests;
- framework dependency-boundary tests;
- TypeScript typecheck;
- production React build.

The latest framework workflow is green.

## Framework boundary

Framework source must not depend on:

- DevOps;
- Docker/Kubernetes;
- databases;
- Next.js;
- Vercel;
- domain assessment banks;
- terminal/SSH implementations;
- AI vendors.

## Compatibility code

app/src/framework/ is transitional DevOps application code.

It is not the canonical reusable framework.

Do not continue genericizing it.

## Next milestone

**Framework MVP refinement**

Focus on:

- deterministic runtime;
- view-model contracts;
- provider registration;
- async/error states;
- accessibility;
- responsive behavior;
- second neutral programme fixture;
- API stability.

Then integrate DevOps through adapters.

## Merge rule

A green framework is not sufficient reason to merge to main.

Before merge, prove:

1. framework remains independent;
2. DevOps adapter works;
3. existing DevOps application remains green;
4. no framework → DevOps dependency has appeared.
