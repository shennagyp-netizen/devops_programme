
# V3 Learning Experience Runtime

## Purpose

The Learning Experience Runtime is the framework's interaction layer between React, framework authority, and programme/provider adapters.

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
~~~

## Runtime owns

- current course/section/item;
- learning mode;
- learner intents;
- control availability;
- progression view;
- remediation session state.

## React owns

- presentation;
- layout;
- responsive presentation;
- ephemeral UI state;
- accessibility interaction;
- dispatching semantic intents.

React does not own:

- authoritative completion;
- authoritative progress;
- assessment scoring;
- evidence trust;
- provider implementation.

## Current MVP

The standalone framework uses an in-memory runtime.

That is deliberate.

The framework first proves state, intent, control, and UI semantics.

Persistence/authentication/server transport belong to consuming applications.

## Current intents

~~~text
SELECT_COURSE
SELECT_SECTION
SELECT_ITEM
SELECT_MODE
REQUEST_EVIDENCE
SUBMIT_ASSESSMENT
COMPLETE_ITEM
OPEN_REMEDIATION
~~~

These are learner-semantic events, not HTTP/database/vendor payloads.

## View model

The runtime currently exposes:

~~~text
ExperienceView
 ├── session
 ├── currentItem
 ├── controls
 └── progress
~~~

Next framework work should stabilize this as a public view-model contract.

## Provider boundary

The runtime does not implement evidence verification or assessment delivery.

It uses provider interfaces.

A consuming application may implement them using local, remote, human, managed, or AI-backed capabilities.

## Future runtime work

After the MVP stabilizes:

- deterministic reducer/transition tests;
- stable public view-model contracts;
- provider registration/selection;
- async/busy/error semantics;
- offline draft support;
- accessibility state mapping.

Do not introduce a state-machine library until the transition graph requires it.
