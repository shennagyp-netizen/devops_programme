# Human Content Contract

Human-friendliness is part of curriculum correctness.

## Target mix

Across a normal spoken lesson, target approximately:

- 70–80% technical mechanism, diagnosis, operation, retrieval and design
- 20–30% human context

Human context includes:
- concrete real-life examples
- workplace situations
- memorable analogies
- short observational humour
- conversational disagreement and correction

The 20–30% is **not a comedy quota**.

A lesson fails the contract when humour or storytelling displaces the technical mechanism.

## Example requirement

Each normal spoken episode should contain at least:
1. one concrete everyday/workplace example
2. one direct mapping back from the example to the literal technical mechanism
3. one situation that exposes a common misconception

Longer episodes may contain several examples.

Examples should be specific enough to remember:
- a queue at a clinic reception
- a delivery address changing while an order is in transit
- a shop opening another checkout lane
- a team deploying a change just before a busy period
- a machine that appears healthy while one dependency is failing

Do not turn examples into long stories. Their job is to make the mechanism easier to retrieve.

## Humour requirement

Humour should be:
- occasional
- observational
- technical
- natural to the speakers
- never inserted on a timer

Good humour is a side effect of two engineers noticing something absurd in a system.

Bad humour is a scripted punchline every few paragraphs.

## Conversation requirement

The speakers should not agree automatically.

Use natural moments such as:
- one speaker proposes the wrong layer
- the other asks for evidence
- one speaker corrects themselves
- both discover that two explanations are still possible
- a familiar example exposes a hidden assumption

## Review questions

Before publishing an episode, ask:

- Does it sound natural when spoken aloud?
- Is there a concrete human example?
- Is the analogy followed by the literal mechanism?
- Is there at least one memorable human moment?
- Is the technical mechanism still dominant?
- Does humour feel earned?
- Do the speakers sound like people rather than a lecturer and a student?
- Are prediction and hands-on moments active rather than rhetorical?

## Important

The percentages are curriculum design targets, not a mechanical word-count requirement for every episode. Quality and technical usefulness take priority.


# Language Style Contract

## Goal

Teach real DevOps engineering in **simple, natural English**.

The learner may know software engineering well but may not be a native English speaker. Technical depth must come from the ideas, system behavior, evidence and exercises — not from difficult English.

## Spoken English level

Target roughly **B1–B2 general English** for the spoken teaching layer.

This is a style target, not a test of the learner's English.

Use:
- short, clear sentences
- common everyday words
- direct questions
- normal contractions
- simple connectors: "so", "but", "because", "then", "now", "if"
- one new idea at a time

Technical terms are allowed and should stay exact:
- TCP
- DNS
- CIDR
- Kubernetes
- reconciliation
- idempotency
- replication
- backpressure
- observability
- etc.

When a technical term is not obvious, explain it in plain words the first time.

## Avoid advanced general English

Do not use difficult general-English words just to sound professional.

Prefer:

| Avoid | Prefer |
|---|---|
| facilitate | help |
| utilize | use |
| commence | start |
| subsequently | later |
| demonstrate | show |
| approximately | about |
| sufficient | enough |
| regarding | about |
| obtain | get |
| implement | build / add / make |
| encounter | see / run into |
| therefore | so |
| nevertheless | but / still |
| consequently | so |
| mitigate | reduce the impact / make it safer |
| ambiguity | unclear meaning |
| comprehensive | complete |
| leverage | use |
| facilitate recovery | help recovery |

Do not ban technical words just because they look advanced. The rule is: **simple English around exact technical language**.

## Sentence test

A sentence is too hard when a good software engineer could understand the technical idea but has to stop and decode the English.

Rewrite it.

## Spoken test

Read the line aloud.

It should sound like something an engineer would naturally say to another engineer.

Not:
"Consequently, the service becomes unavailable due to an interaction between..."

Better:
"So the service goes down because these two things interact..."

## Assessment language

Exam questions should test DevOps knowledge, not English vocabulary.

Use:
- direct wording
- one main task per sentence
- clear evidence
- clear success conditions
- technical difficulty in the problem, not in the grammar

The same rule applies to hints, lab instructions, feedback and error messages.
