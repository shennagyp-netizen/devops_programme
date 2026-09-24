import type { CourseLesson } from "./courseLessons";

export type VerificationLevel =
  | "self-report"
  | "structured"
  | "machine-verified";

export type HandsOnEvidenceField = {
  id: string;
  label: string;
  kind: "observation" | "change" | "failure" | "recovery";
  required: boolean;
  minLength?: number;
};

export type HandsOnTask = {
  id: string;
  lessonId: string;
  title: string;
  objective: string;
  steps: string[];
  evidenceFields: HandsOnEvidenceField[];
  successCriteria: string[];
  verificationLevel: VerificationLevel;
  verificationNote: string;
};

const defaultFields: HandsOnEvidenceField[] = [
  {
    id: "observation",
    label: "What did you observe before changing anything?",
    kind: "observation",
    required: true,
    minLength: 20
  },
  {
    id: "change",
    label: "What controlled change did you make?",
    kind: "change",
    required: true,
    minLength: 20
  },
  {
    id: "failure",
    label: "What failure signal did the system produce?",
    kind: "failure",
    required: true,
    minLength: 20
  },
  {
    id: "recovery",
    label: "How did you restore the known-good state, and what proved recovery?",
    kind: "recovery",
    required: true,
    minLength: 20
  }
];

const overrides: Record<string, Omit<HandsOnTask, "id" | "lessonId">> = {
  "B1.1": {
    title: "Prove the process before restarting it",
    objective: "Inspect a live process and its sockets, make one controlled process change, and document recovery.",
    steps: [
      "Identify one relevant process and record its PID.",
      "Inspect its network sockets before changing anything.",
      "Stop or isolate only the chosen process in a disposable environment.",
      "Verify the expected failure signal.",
      "Restore the process and verify the expected state."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The PID and socket observation are recorded.",
      "The failure is tied to the controlled process change.",
      "Recovery is verified after the process returns."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app validates evidence structure and completeness; it does not prove that the command was executed on the learner's machine."
  },
  "B1.2": {
    title: "Prove the request path",
    objective: "Separate name resolution from the later connection path.",
    steps: [
      "Resolve the service name.",
      "Record the returned address information.",
      "Test the service connection from the same machine.",
      "Introduce or observe one safe path failure.",
      "Restore the path and record the recovery signal."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "DNS evidence is recorded separately from connection evidence.",
      "The failure is assigned to the smallest supported layer.",
      "Recovery is verified from the same source host."
    ],
    verificationLevel: "structured",
    verificationNote: "Structured validation checks that the learner supplied separate evidence for each stage; it is not host-level execution verification."
  },
  "B1.3": {
    title: "Prove an application-layer failure",
    objective: "Distinguish DNS, transport, TLS and HTTP evidence during one controlled failure.",
    steps: [
      "Capture the normal request path.",
      "Change one safe application-layer condition.",
      "Collect the failing request evidence.",
      "Explain why lower layers may still be healthy.",
      "Restore the condition and verify the response."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The evidence identifies the highest failing layer supported by the observation.",
      "Recovery returns the expected application response."
    ],
    verificationLevel: "structured",
    verificationNote: "The app validates the evidence structure; it does not independently observe the network stack."
  },
  "B1.4": {
    title: "Prove container isolation",
    objective: "Run, inspect and deliberately alter a container without confusing image state with runtime state.",
    steps: [
      "Run the container from the known image.",
      "Inspect the running container.",
      "Make one disposable runtime/configuration change.",
      "Record the resulting behavior.",
      "Remove the container and recreate it from the known image."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "Image identity and runtime state are distinguished.",
      "Recreation returns the known-good baseline."
    ],
    verificationLevel: "structured",
    verificationNote: "The current validator checks that the evidence describes the required lifecycle; future container adapters can replace this with machine verification."
  },
  "B2.3": {
    title: "Prove restore, not just backup",
    objective: "Create a backup, restore it elsewhere and verify the restored data.",
    steps: [
      "Create a small disposable data set.",
      "Create the backup.",
      "Restore into a different location.",
      "Compare the restored result with the original.",
      "Record what proves recovery."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The backup artifact is identified.",
      "The restore location is identified.",
      "The restored data is explicitly verified."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app validates the evidence record but does not directly inspect filesystem state."
  },
  "D2.7": {
    title: "Break and repair Docker networking",
    objective: "Introduce a controlled Docker networking failure and diagnose it from evidence.",
    steps: [
      "Record the container and network membership.",
      "Make one reversible network change.",
      "Capture the failing request or connection evidence.",
      "Restore the network configuration.",
      "Verify the request succeeds again."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The failure is linked to the network change.",
      "The original network state is restored.",
      "Recovery is verified from the affected container."
    ],
    verificationLevel: "structured",
    verificationNote: "A future Docker adapter can execute and verify the task directly; the current app only validates evidence structure."
  },
  "D3.5": {
    title: "Diagnose a Kubernetes failure",
    objective: "Break a disposable workload and localize the failure using Kubernetes state.",
    steps: [
      "Record pod and service state before the change.",
      "Introduce one controlled failure.",
      "Inspect the resulting pod/service state.",
      "Identify the smallest configuration or runtime cause supported by evidence.",
      "Restore the workload and verify readiness."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "Before and after state are both recorded.",
      "The diagnosis matches the observed Kubernetes state.",
      "Readiness is verified after recovery."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app does not have a Kubernetes execution bridge; this is a structured evidence contract."
  },
  "D4.4": {
    title: "Prove an infrastructure plan",
    objective: "Review a Terraform plan, make one controlled change and preserve the plan evidence.",
    steps: [
      "Run the plan from a clean working state.",
      "Record the planned change.",
      "Make one controlled configuration change.",
      "Run the plan again and compare the result.",
      "Record the reason for accepting or rejecting the change."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The before and after plan states are distinguishable.",
      "The change has an explicit rationale.",
      "No unreviewed apply is claimed as evidence."
    ],
    verificationLevel: "structured",
    verificationNote: "Plan text can later be machine-parsed; the current stage checks only evidence completeness."
  },
  "D5.8": {
    title: "Run the incident loop",
    objective: "Capture observation, hypothesis, mitigation, recovery and prevention in order.",
    steps: [
      "Record the first reliable symptom.",
      "State the first testable hypothesis.",
      "Apply the safest useful mitigation.",
      "Verify service recovery.",
      "Record the prevention or redesign action."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "Observation and hypothesis are distinct.",
      "Mitigation precedes deeper redesign.",
      "Recovery has explicit verification evidence."
    ],
    verificationLevel: "structured",
    verificationNote: "Incident evidence is currently learner-entered but schema-validated; later runtime telemetry can provide machine verification."
  },
  "B1.5": {
    title: "Prove the application is repeatable",
    objective: "Start the same local service from a known configuration, create one controlled configuration failure, and restore the known-good state.",
    steps: [
      "Start the service from the documented known-good configuration.",
      "Record the configuration and health evidence that proves the baseline.",
      "Change one disposable configuration value that the service depends on.",
      "Capture the failure without changing anything else.",
      "Restore the original configuration and verify the service is healthy again."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The baseline configuration and health state are recorded.",
      "The failure is caused by one explicit configuration change.",
      "Restoration returns the service to the documented baseline."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app validates the learner evidence; direct service execution verification is not yet implemented."
  },

  "B2.1": {
    title: "Prove a safe delivery path",
    objective: "Trace one change from commit through a repeatable check and define the rollback identity before any deployment.",
    steps: [
      "Create one small, reversible repository change.",
      "Record the commit or release identity.",
      "Run the required automated checks and record their result.",
      "Identify the exact artifact or build output that would be promoted.",
      "Write the rollback target and verify that the known-good identity is unambiguous."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The change, checks, artifact identity and rollback target are all explicit.",
      "The learner can explain how the same change would be promoted safely.",
      "No production change is claimed without evidence of the delivery stage reached."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app validates delivery evidence structure; it does not independently deploy the learner's artifact."
  },

  "B2.2": {
    title: "Prove observability can reduce uncertainty",
    objective: "Turn a vague performance report into a bounded investigation using a small set of useful signals.",
    steps: [
      "State the exact symptom, affected scope and time window.",
      "Choose three observations that can separate the top competing causes.",
      "Collect the observations without changing the system.",
      "State which hypothesis is now best supported and what evidence would falsify it.",
      "Choose one safe next action and define the recovery check."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The investigation starts from a precise symptom rather than a vague label.",
      "Each observation has a reason tied to a competing hypothesis.",
      "The next action and recovery check are explicit."
    ],
    verificationLevel: "structured",
    verificationNote: "The current stage verifies the investigation evidence; it does not automatically collect production telemetry."
  },

  "B3.1": {
    title: "Prove queue protection",
    objective: "Model a producer, queue and consumer, then observe how a slow consumer changes backlog and retry behavior.",
    steps: [
      "Draw the producer, queue and consumer path.",
      "Record the normal arrival and processing behavior.",
      "Make the consumer slower in a disposable scenario.",
      "Record queue depth or queue age and explain the change.",
      "Restore the consumer rate and verify the backlog begins to recover."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The queue's protective role is explained using observed or modeled behavior.",
      "Slow consumption is distinguished from producer failure.",
      "Recovery shows the backlog moving toward the known-good state."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app validates queue reasoning evidence; a machine queue adapter is still required for execution verification."
  },

  "B3.2": {
    title: "Run the first incident",
    objective: "Lead a small distributed-service incident from detection through safe mitigation, repair and verification.",
    steps: [
      "State the incident symptom and affected scope.",
      "Record the first observations before changing anything.",
      "Write two competing hypotheses and one discriminating test.",
      "Choose the safest mitigation supported by the evidence.",
      "Repair the failure, verify recovery and write the incident timeline."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The incident timeline separates observation, hypothesis, action and verification.",
      "The mitigation is justified by evidence.",
      "Recovery is verified and the next prevention step is recorded."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app validates incident evidence structure; direct fault-injection and recovery adapters are not yet implemented."
  },

  "A1.1": {
    title: "Prove the first bottleneck",
    objective: "Model a workload and show which resource saturates first as demand increases.",
    steps: [
      "Choose a measurable workload rate.",
      "Record current throughput and latency assumptions.",
      "Double the workload in the model or controlled test.",
      "Identify the first saturated resource.",
      "Record the headroom implication."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The workload unit is explicit.",
      "The first bottleneck is supported by measured or stated assumptions.",
      "Headroom is quantified or bounded."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app validates the modeling evidence but does not execute load tests."
  },
  "A1.3": {
    title: "Prove a stale-read boundary",
    objective: "Show where replicated state can become stale and why the read can or cannot tolerate it.",
    steps: [
      "Choose a value with a known write and read path.",
      "Record the expected freshness requirement.",
      "Create or observe a delayed replica/cache state.",
      "Capture the stale read evidence.",
      "Restore synchronization and verify the current value."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The read path and freshness requirement are explicit.",
      "Staleness is distinguished from missing data.",
      "Recovery is verified."
    ],
    verificationLevel: "structured",
    verificationNote: "Current validation is evidence-structure validation; a distributed-state adapter is required for machine verification."
  },
  "A2.2": {
    title: "Prove retry amplification",
    objective: "Demonstrate how uncontrolled retries increase load and how bounded backoff changes the behavior.",
    steps: [
      "Define the failing dependency and retry policy.",
      "Record request and retry rates.",
      "Run the failing case with the aggressive retry policy.",
      "Change to bounded backoff with jitter.",
      "Compare the resulting pressure."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "Original and bounded retry behavior are distinguishable.",
      "The pressure effect is explained using observed or modeled rates.",
      "The safer retry policy is explicit."
    ],
    verificationLevel: "structured",
    verificationNote: "The current app checks the evidence record; a runtime traffic adapter is needed for machine verification."
  },
  "A3.1": {
    title: "Prove the capacity bottleneck",
    objective: "Build a large-traffic model and defend the first bottleneck with explicit assumptions.",
    steps: [
      "Choose a traffic target and request mix.",
      "Record capacity assumptions for each major dependency.",
      "Increase demand until one assumption becomes limiting.",
      "Identify the bottleneck and its evidence.",
      "Record the next bottleneck after mitigation."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "Traffic assumptions are explicit.",
      "The first bottleneck is quantified.",
      "Moving the bottleneck is explained."
    ],
    verificationLevel: "structured",
    verificationNote: "The current stage verifies evidence structure; machine verification requires a load-test or simulation adapter."
  }
};

export function getHandsOnTask(lesson: CourseLesson): HandsOnTask {
  const override = overrides[lesson.id];
  if (override) {
    return {
      ...override,
      id: `hands-on-${lesson.id}`,
      lessonId: lesson.id
    };
  }

  return {
    id: `hands-on-${lesson.id}`,
    lessonId: lesson.id,
    title: lesson.title,
    objective: lesson.lab.objective,
    steps: [
      lesson.lab.challenge,
      "Capture the strongest observation before changing anything.",
      "Make one reversible change in the disposable environment.",
      "Record the resulting failure or state change.",
      "Restore the known-good state and verify recovery."
    ],
    evidenceFields: defaultFields,
    successCriteria: [
      "The before state is recorded.",
      "The controlled change is explicit.",
      "The resulting behavior is recorded.",
      "Recovery is explicitly verified."
    ],
    verificationLevel: "structured",
    verificationNote: "Default task coverage uses structured evidence validation. It does not claim direct execution verification."
  };
}

export function validateHandsOnEvidence(
  task: HandsOnTask,
  evidence: Record<string, string>
) {
  const failures: string[] = [];

  for (const field of task.evidenceFields) {
    const value = evidence[field.id]?.trim() ?? "";
    if (field.required && !value) {
      failures.push(`Missing required evidence: ${field.label}`);
      continue;
    }
    if (value && field.minLength && value.length < field.minLength) {
      failures.push(
        `Evidence for "${field.label}" is too short; provide at least ${field.minLength} characters.`
      );
    }
  }

  return {
    valid: failures.length === 0,
    failures
  };
}
