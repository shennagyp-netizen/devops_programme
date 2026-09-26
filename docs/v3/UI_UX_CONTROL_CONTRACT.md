
# Learning Framework UI/UX Control Contract

## Principle

A control is a projection of framework policy.

A control is never the authority itself.

## MVP control model

Current control state categories:

~~~text
enabled
locked
disabled
~~~

Keep the model small until more states have real semantics.

## Learner clarity

Every primary learning surface should make these visible:

1. Where am I?
2. What am I learning?
3. What can I do?
4. What is blocked?
5. Why is it blocked?

## Completion UX

~~~text
Evidence missing
→ locked

Evidence satisfied
→ enabled

Completed
→ disabled
~~~

The UI does not decide evidence validity.

## Assessment UX

The framework may present assessment interaction.

It must not embed domain answer keys or domain scoring logic.

An AssessmentProvider owns assessment delivery and scoring.

## Evidence UX

The framework owns generic evidence concepts.

The programme/provider supplies collection instructions and actual verification.

## Remediation

Framework:

- owns remediation session state.

Programme:

- owns remediation material.

## Responsive behavior

Responsive presentation may vary.

Learning intent semantics do not.

~~~text
desktop → rail/tabs
tablet  → segmented control
mobile  → compact menu
~~~

## Accessibility

Important state must be expressed through semantic text/native control state.

Do not rely only on:

- color;
- icons;
- animation.

## MVP product quality

The framework React app should feel like a real learning product:

- clear hierarchy;
- obvious current activity;
- persistent progress;
- clear blocked/enabled states;
- responsive navigation;
- accessible controls.

Domain branding belongs to the consuming programme.
