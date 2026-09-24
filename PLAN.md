# DevOps Programme Mission Plan

## Mission

Build a multi-course learning system that converts strong application/software knowledge into demonstrated DevOps competence, then scales the same learning architecture toward large distributed-system operations.

## Course architecture

The programme is intentionally split into three distinct courses:

- Beginner — DevOps Through Problems
- Intermediate — DevOps Engineering
- Advanced — Large-Scale Distributed Systems

Foundations are reusable competency nodes rather than one giant prerequisite block.

## Learner adaptation

The learner chooses an environment profile first:
- macOS
- Linux
- Windows

The target learning architecture uses diagnostics to determine what introductory theory can be skipped. In the current MVP, course and platform selection and prerequisite diagnostics for the authored sections are implemented; full automatic remediation routing across the whole programme remains planned.

Rules:
- known theory may be skipped when diagnostic evidence supports it
- exercises may never be skipped
- failed exercises should trigger targeted remediation
- projects continuously carry the learner forward

## Continuous projects

Each course has three major projects:

Beginner:
- B1 containerized application
- B2 productionized service
- B3 distributed service

Intermediate:
- I1 production Kubernetes platform
- I2 infrastructure + observability
- I3 integrated production platform

Advanced:
- A1 global distributed platform
- A2 failure engineering platform
- A3 massive-scale service

An external learner project uses the same project-instance architecture.

## Assessment architecture

Every section has:
- conceptual assessment
- diagnostic assessment
- hands-on assessment

Each assessment form varies difficulty while preserving a controlled blueprint.

The assessment engine separates:
- learning adaptation
- exam difficulty
- accessibility accommodation
- competency standardization

Observed item performance will be recorded once assessment delivery and evidence capture are implemented. The first implementation uses blueprint-controlled forms; computerized adaptive testing is deferred until the item pool is empirically calibrated.

Assessment quality is designed around internationally recognized assessment principles including validity, reliability, fairness and standardization. This repository does not claim certification or formal compliance.

## Product architecture milestones

M0 Foundation
M1 Curriculum Architecture
M2 Content / Podcast Library
M3 Interactive Learning Engine
M4 Hands-on Engine
M5 Motion Systems
M6 Assessment Engine
M7 Release / Validation

Existing five-day content remains useful as the initial intermediate core while the programme is expanded into the three-course architecture.

## Current implementation boundary

The curriculum model, course-aware lesson routing, prerequisite diagnostics for Beginner B-F1/B-F2/B-A1, Intermediate I-F1/I-F2, and Advanced A-F1, assessment blueprints, pilot item banks, podcast scripts and safe audio-sync architecture are implemented on the clearance branch.

Prerequisite diagnostics are implemented for Beginner B-F1/B-F2/B-A1, Intermediate I-F1/I-F2, and Advanced A-F1. Broader section coverage, richer diagnostic item banks, and full automatic remediation routing remain incomplete. A complete Windows command adapter, production voice timing manifests, and calibrated/operational assessment pools are also not yet complete.

## Quality gate

A feature is not considered complete merely because content exists. Acceptance requires the corresponding structure, executable behavior where applicable, and evidence that the learner can demonstrate the intended competency.
