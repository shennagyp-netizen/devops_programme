# Assessment Item Schema

## Core metadata

Every item defines:

```
id
course_id
section_id
competency_id
objective_id
assessment_family
item_type
difficulty
cognitive_level
expected_minutes
prerequisites
status
version
```

## Learner-facing content

Items also define:

```
prompt
options
correct_option
expected_elements
scoring
```

Use the fields that match the item type.

The assessment question must be clear enough that the learner is not being tested on difficult English.

Technical difficulty belongs in:
- the system behavior
- the evidence
- the diagnosis
- the trade-off
- the hands-on task

It should not come from complex wording.

## Hands-on items

Hands-on items additionally define:

```
environment
initial_state
allowed_operations
success
evidence
failure_conditions
recovery_requirements
reset_strategy
```

The environment must be disposable or resettable.

A final state alone is not enough. The rubric can require:
- commands or actions taken
- observations
- diagnosis
- safe mitigation
- repair
- verification

## Item states

Recommended lifecycle:

```
authoring
-> technical-review
-> language-review
-> fairness-review
-> pilot
-> calibrated
-> operational
-> retired
```

An item must not enter an operational exam pool before its required reviews are complete.

## Difficulty

`difficulty` is an authoring target at first.

Observed difficulty is stored separately after pilot use. It may later replace the initial estimate when enough evidence exists.

The four current authoring bands are:

- foundation
- applied
- difficult
- challenge

## Pilot example

The repository currently contains a 40-item pilot bank for section `B-F1`.

It uses:
- 20 conceptual items
- 12 diagnostic items
- 8 hands-on items

and follows the target difficulty mix:
15% / 35% / 35% / 15%.

That pilot bank is not yet a certification pool.
