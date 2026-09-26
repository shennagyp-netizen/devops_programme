
# V3 Framework Boundaries

## Canonical boundary

The canonical framework is:

~~~text
framework/
~~~

It is a domain-neutral React learning application and reusable learning core.

## Framework owns

### Learning semantics

- programme/course/section/item contracts;
- learning modes;
- completion rules;
- evidence requirements;
- assessment-pass semantics;
- learner-state representation;
- progression derivation.

### Experience semantics

- learner intents;
- learning session state;
- control policy;
- remediation state;
- reusable React interaction patterns.

### Provider contracts

- evidence provider interface;
- assessment provider interface;
- content provider interface;
- tutor provider interface.

The framework defines what a provider can do. It does not implement the provider.

## Programme owns

A consuming programme owns:

- curriculum;
- domain concepts;
- domain terminology;
- domain competency definitions;
- domain learning activities;
- domain assessment content;
- domain provider configuration.

For the first consumer, that programme is DevOps.

## Adapter/application owns

The consuming application owns:

- authentication;
- authorization transport;
- database;
- server actions/API;
- deployment;
- browser-specific integrations;
- AI vendor integration;
- audio;
- terminal/SSH;
- managed execution;
- domain persistence.

## Explicit dependency rule

Allowed:

~~~text
programme → framework
adapter → framework
application → framework
~~~

Forbidden:

~~~text
framework → DevOps
framework → database
framework → Next.js
framework → Vercel
framework → terminal implementation
framework → AI vendor
~~~

## React rule

React is part of the framework product.

The framework includes the reusable React application surface.

What is not part of the framework React layer:

- DevOps branding;
- DevOps lesson text;
- DevOps tool instructions;
- DevOps runtime controls;
- domain-specific assessment UI.

## Transitional code

~~~text
app/src/framework/
~~~

is compatibility implementation inside the current DevOps application.

It is not a second framework.

Canonical generic evolution happens only in:

~~~text
framework/
~~~

## Versioning

Framework and programme versions evolve independently.

Example:

~~~text
frameworkContractVersion = 0.1
programmeVersion = devops-1.x
contentRevision = lesson-specific
~~~

A DevOps content correction should not require a framework change.

A framework contract change should be explicit and versioned.

## Abstraction test

Before adding a feature to framework, ask:

> Does this concept exist independent of the subject being taught?

If not, keep it outside the framework.
