
# V3 Continuation Handoff

## Branch

~~~text
v3/learning-framework
~~~

## Baseline

~~~text
main
~~~

main remains stable. No merge is implied by framework MVP completion.

## Critical direction

The Learning Framework is now decoupled from DevOps.

The canonical reusable framework is:

~~~text
framework/
~~~

It is a complete React learning application plus generic learning core, runtime, and provider contracts.

The DevOps application is a consumer of the framework, not the framework itself.

## Current green framework MVP

The standalone framework contains:

- generic learning contracts;
- completion/evidence semantics;
- assessment-pass semantics;
- learner-state representation;
- progression;
- learning intents;
- control policy;
- in-memory runtime;
- generic provider interfaces;
- reusable React application shell;
- neutral demo programme;
- framework unit tests;
- dependency-boundary tests;
- independent GitHub Actions workflow.

Latest independent workflow is green for:

- tests;
- boundary isolation;
- typecheck;
- production React build.

## Canonical structure

~~~text
framework/
├── src/core/
├── src/runtime/
├── src/react/
├── src/demo/
├── src/main.tsx
├── tests/
├── package.json
├── vite.config.ts
└── tsconfig*.json
~~~

## Framework owns

- learning semantics;
- learner state;
- progression;
- evidence semantics;
- assessment semantics;
- completion policy;
- intents;
- control policy;
- reusable React learning experience;
- provider interfaces.

## Framework does NOT own

- DevOps curriculum;
- DevOps assessment banks;
- PostgreSQL/Drizzle;
- Next.js/Vercel;
- authentication;
- terminal/SSH;
- AI vendors;
- podcast/audio providers;
- domain-specific content;
- domain-specific infrastructure.

## Transitional DevOps implementation

~~~text
app/src/framework/
~~~

is now compatibility/transition code inside the existing DevOps application.

Do not make it a second generic framework.

New generic framework work belongs only in:

~~~text
framework/
~~~

## Next work

Stay framework-only first.

1. make runtime transitions deterministic and fully tested;
2. stabilize public view-model contracts;
3. add generic provider registration/selection semantics;
4. model async/busy/error states;
5. expand accessibility and responsive tests;
6. add a second neutral programme fixture;
7. keep framework CI independently green.

After the framework MVP is stable, create the first DevOps consuming vertical slice through explicit adapters.

## TDD rule

~~~text
RED
→ implementation
→ GREEN
→ boundary/red-team review
→ documentation
~~~

The framework boundary test remains mandatory.

## Red-team focus

Attack:

- DevOps/domain dependency leakage;
- database/framework coupling;
- UI components deciding authority;
- provider implementations leaking into core;
- demo-specific assumptions;
- runtime transitions bypassing policy;
- domain-specific identifiers becoming framework contracts.

DevOps infrastructure vulnerabilities are application concerns unless they cross the framework boundary.

## Non-goals

Do not:

- split repositories;
- build microservices;
- add a framework database;
- publish packages yet;
- build framework billing/auth;
- migrate all DevOps UI;
- import DevOps assessment/terminal implementations into framework core.

## Acceptance gate

Framework MVP is complete only when:

~~~text
framework TDD
+
boundary isolation
+
typecheck
+
production build
+
documentation
=
GREEN
~~~

Only then start the first DevOps consuming vertical slice.
