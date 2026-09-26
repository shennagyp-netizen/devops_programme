# Learning Framework — MVP Boundary

## Status

**MVP boundary is established and green.**

The Learning Framework is a standalone product boundary **inside this repository**. It is not a DevOps subsystem and it is not allowed to depend on the existing DevOps application.

The implementation lives under:

```
framework/
```

The framework has its own React application, package metadata, Vite build, TypeScript configuration, tests, and GitHub Actions workflow.

Current independent CI result: the latest framework workflow completed successfully with:

- unit + boundary tests: PASS
- TypeScript typecheck: PASS
- production React build: PASS

## Product definition

The framework is the reusable learning system.

It provides:

- generic learning contracts;
- learner-state semantics;
- progression derivation;
- evidence semantics;
- completion policy;
- assessment semantics;
- learning/session intents;
- control policy;
- provider interfaces;
- a reusable React learning application.

The framework does **not** provide a specific subject curriculum.

## Dependency direction

```
Domain Programme
      │
      │ programme definitions
      ▼
Learning Framework React App
      │
      ▼
Learning Experience Runtime
      │
      ▼
Framework Core Authority
      │
      ▼
Generic Provider Interfaces
      │
      ├── content provider
      ├── evidence provider
      ├── assessment provider
      └── tutor provider
```

The direction is intentionally one-way:

**programme → framework**

Never:

**framework → DevOps programme**

## MVP implementation boundary

### Framework owns

```
framework/src/core/
framework/src/runtime/
framework/src/react/
framework/src/index.ts
```

Core:

- `LearningProgramme`
- `LearningCourse`
- `LearningSection`
- `LearningItem`
- `LearnerState`
- evidence records
- assessment pass semantics
- completion evaluation
- progression derivation
- provider interfaces

Runtime:

- session state
- learner intents
- control derivation
- local framework demo transitions

React:

- complete reusable learning shell
- navigation
- progress
- mode presentation
- authority-driven controls
- remediation surface

### Framework explicitly does not own

- DevOps curriculum;
- Linux, Docker, Kubernetes or networking concepts;
- domain assessment banks;
- authentication;
- PostgreSQL/Drizzle;
- Next.js request handlers;
- Vercel-specific runtime code;
- terminal/SSH implementations;
- AI vendor SDKs;
- domain-specific prompts;
- domain-specific media.

## Demo programme

The MVP contains one intentionally neutral demonstration programme.

Its purpose is architectural proof:

> the React learning application can run from a generic programme definition without importing DevOps content or DevOps infrastructure.

The demo is not the framework's permanent curriculum.

## Existing DevOps application

The existing `app/` remains the reference DevOps application.

Its previous `app/src/framework/` implementation is now treated as a **compatibility/transition implementation**, not as the canonical standalone framework.

Do not add new generic framework features there.

Future work should move generic capabilities toward `framework/` and make DevOps consume them through explicit adapters.

## Integration strategy

Do **not** migrate the DevOps application wholesale during framework MVP.

Use this order:

1. stabilize framework contracts;
2. stabilize framework React experience;
3. define programme/provider adapters;
4. make one small DevOps learning flow consume the framework;
5. expand integration only after the vertical slice is green.

This keeps framework development independent from DevOps complexity.

## Non-goals for the MVP

Do not add:

- a new database;
- a framework-specific backend;
- microservices;
- event buses;
- plugin marketplaces;
- package publishing infrastructure;
- authentication;
- multi-tenant billing;
- domain-specific assessment implementation;
- DevOps-specific provider code.

The objective is a **small reusable learning product**, not an enterprise platform.

## Quality gate

The framework MVP is accepted only when:

```
framework TDD
+
framework boundary test
+
framework typecheck
+
framework production build
=
GREEN
```

The latest independent workflow satisfies this gate.
