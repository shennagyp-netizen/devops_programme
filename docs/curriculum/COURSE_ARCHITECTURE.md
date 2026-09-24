# Course Architecture

## Three-course model

The programme is three related courses rather than one difficulty-scaled course.

### Beginner — DevOps Through Problems

Audience:
- strong software/application fundamentals
- limited operational practice
- unfamiliar or partially familiar DevOps tooling

Teaching strategy:
- start from a distributed-system problem
- introduce each tool as a solution to a concrete problem
- keep theory concise initially
- require hands-on proof
- continuously evolve one project

Target capabilities:
- operate Linux/terminal basics
- explain network flow
- containerize and operate a service
- perform basic CI/CD
- identify and repair common failures
- understand why orchestration and infrastructure automation exist

### Intermediate — DevOps Engineering

Audience:
- software engineers who can already work with basic development tooling
- learner must become independently capable of designing and operating production systems

Teaching strategy:
- deep theory
- visual stories and animations
- real failure mechanisms
- long-form projects
- increasingly ambiguous diagnosis
- explicit trade-off analysis

Target capabilities:
- production Kubernetes
- infrastructure as code
- observability
- reliability engineering
- distributed-system behavior
- database scaling/recovery
- incident response
- production architecture

### Advanced — Large-Scale Distributed Systems

Audience:
- engineers who already operate normal production systems

Teaching strategy:
- scale and failure become the central teaching device
- capacity, global traffic, partitioning and failure domains
- controlled fault injection
- large blast-radius reasoning
- multi-region and disaster recovery design
- cost/performance/reliability trade-offs

Target capabilities:
- design systems for very large populations
- reason about partial failure
- operate across failure domains
- design global traffic and data strategies
- perform incident command and recovery
- build resilience and disaster-recovery mechanisms

"Amazon-level" in this programme means the scale and depth of engineering problems, not reproduction of any company's confidential internal systems.

## Foundations

Foundations are reusable competency nodes, not a mandatory one-time block.

Catalog:
- Linux
- operating systems
- networking
- protocols
- databases
- distributed systems
- reliability

A learner may skip introductory theory when diagnostic evidence shows knowledge, but required exercises remain mandatory.

## Continuous projects

Every course has three major projects.

A project starts before all theory is known and evolves through the course. The learner repeatedly:
- makes a change
- predicts consequences
- operates
- breaks a dependency
- diagnoses from evidence
- repairs
- records evidence
- redesigns

## Section contract

A section contains:
- objectives
- foundation links
- teaching assets
- mandatory exercises
- deliberate failure
- project connection
- recall
- design transfer
- conceptual assessment
- diagnostic assessment
- hands-on assessment

## External project mode

A learner's real external project is represented as another project instance using:
- environment adapter
- project milestones
- competency gates
- evidence ledger
- incident records
- assessment mapping

It is not a separate learning architecture.
