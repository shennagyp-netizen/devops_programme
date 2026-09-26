# Learning Framework V3

## Purpose

V3 establishes a reusable Learning Framework with DevOps as its first intended consumer.

The framework is a product boundary, not a namespace inside the DevOps application.

Canonical implementation:

~~~text
framework/
~~~

## Product shape

The framework is both:

1. a reusable learning core/runtime;
2. a complete React learning application.

The React application renders generic programme data and framework policy.

## Architecture

~~~text
Programme definition
       ↓
Framework React application
       ↓
Learning Experience Runtime
       ↓
Framework Core Authority
       ↓
Generic Provider Interfaces
       ↓
Programme-specific provider implementations
~~~

## Core concepts

The framework models:

- programmes;
- courses;
- sections;
- learning items;
- learning modes;
- completion rules;
- evidence;
- assessment passes;
- learner state;
- progression;
- learning intents;
- control policy;
- provider contracts.

## Core implementation

~~~text
framework/src/core/
~~~

This layer must remain free of:

- domain content;
- persistence;
- authentication;
- Next.js;
- Vercel;
- AI vendors;
- terminal/SSH;
- DevOps-specific APIs.

## Runtime

~~~text
framework/src/runtime/
~~~

The runtime owns:

- session state;
- item selection;
- mode selection;
- intent handling;
- control derivation;
- progression view;
- remediation state.

The runtime does not implement domain providers.

## React application

~~~text
framework/src/react/
~~~

The React application provides reusable:

- programme navigation;
- current-item presentation;
- learning modes;
- controls;
- progress;
- remediation;
- responsive presentation.

The application is intentionally neutral.

## Programme boundary

A consuming programme supplies:

- curriculum;
- content;
- domain semantics;
- domain assessment content;
- provider configuration.

The framework should not know whether the programme is DevOps, medicine, mathematics, language learning, cybersecurity, or anything else.

## Provider boundary

Provider implementations are outside framework core.

Examples:

~~~text
EvidenceProvider
AssessmentProvider
ContentProvider
TutorProvider
~~~

The framework defines contracts; the consuming application supplies implementations.

## Current MVP

The MVP uses:

- a neutral demonstration programme;
- in-memory learner state;
- generic completion/evidence semantics;
- assessment-pass semantics;
- a complete React application;
- standalone tests;
- dependency-boundary tests;
- independent CI.

This is intentional. Persistence/authentication/server integration are not required to prove the framework abstraction.

## DevOps relationship

DevOps remains the first intended consumer.

Existing DevOps implementation under:

~~~text
app/src/framework/
~~~

is transitional compatibility code.

It is not the canonical framework.

Do not continue building two generic frameworks in parallel.

## Integration plan

After the framework MVP is stable:

1. define a DevOps programme adapter;
2. map DevOps courses/sections/items into framework contracts;
3. wrap existing evidence/assessment/tutor/runtime systems behind provider contracts;
4. replace one Learning Gateway vertical slice;
5. keep the old path until the adapter slice is green;
6. expand incrementally.

## Non-goals

Do not add to framework MVP:

- database;
- auth;
- microservices;
- event bus;
- package publishing;
- billing;
- domain-specific infrastructure;
- domain-specific UI;
- vendor SDKs.

## Quality rule

Every framework change must pass:

~~~text
TDD
+
boundary test
+
typecheck
+
production build
+
documentation
~~~

## Architectural litmus test

Before adding any framework feature:

> Would this feature still make sense for a completely different learning domain?

If not, it belongs in the programme or adapter.
