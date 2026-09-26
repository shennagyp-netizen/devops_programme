
# Learning Framework Architecture

## Goal

The framework is a reusable learning product, not a DevOps abstraction layer.

It consists of a generic learning core plus a complete React learning application. A consuming programme supplies curriculum and provider implementations.

## Layers

### Core

framework/src/core/

Owns learning semantics:

- programme/course/section/item contracts;
- learner state;
- completion rules;
- evidence semantics;
- assessment-pass semantics;
- progression;
- generic provider interfaces.

### Experience Runtime

framework/src/runtime/

Owns:

- session state;
- learner intents;
- control policy;
- current learning item;
- remediation state;
- framework view state.

### React Application

framework/src/react/

Owns:

- navigation;
- progress presentation;
- learning-mode presentation;
- controls;
- remediation surface;
- responsive/accessibility behavior.

### Consuming programme and adapters

Outside the framework.

They own:

- curriculum;
- domain content;
- domain assessment;
- evidence implementations;
- authentication;
- persistence;
- deployment;
- AI;
- terminal/SSH.

## Dependency direction

~~~text
Programme
   ↓
Framework React App
   ↓
Experience Runtime
   ↓
Framework Core
   ↓
Provider Interfaces
   ↓
Consumer-specific implementations
~~~

The framework must never import the DevOps application.

## Why the React app belongs to the framework

Without a reusable React application, every programme would rebuild:

- navigation;
- progress;
- control states;
- learning modes;
- remediation presentation;
- evidence actions;
- assessment entry.

The framework therefore owns a complete generic learning surface.

## MVP discipline

Do not add:

- framework database;
- framework authentication;
- microservices;
- event buses;
- vendor SDKs;
- domain-specific providers;
- package publishing infrastructure.

The consuming application provides these later.

## Abstraction test

Before putting a feature in framework core, ask:

> Would this concept still exist if the programme were medicine, mathematics, language learning, cybersecurity, or employee training?

If not, it belongs outside framework.
