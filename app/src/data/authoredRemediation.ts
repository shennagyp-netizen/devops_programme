import type { RemediationMethod, RemediationStep } from "./masteryRemediation";

type AuthoredRemediation = {
  target: string;
  steps: Record<RemediationMethod, Omit<RemediationStep, "id" | "method">>;
};

function step(title: string, explanation: string, microTask: string, successCheck: string) {
  return { title, explanation, microTask, successCheck };
}

export const authoredRemediation: Record<string, AuthoredRemediation> = {
  "B1.1": {
    target: "Move from the slow-page symptom to process, resource, dependency and proof.",
    steps: {
      "plain-language": step(
        "Start with the machine question",
        "A slow page is only a symptom. First ask which process owns the request and whether it is working or waiting.",
        "Name the process you would inspect and state what you expect its state to be.",
        "The answer names a process and a predicted observable state."
      ),
      analogy: step(
        "Use the house-light example",
        "A dark room does not prove the bulb is broken. You check one bulb, one room, the house and then the street. Linux diagnosis narrows the fault domain in the same way.",
        "Map bulb, room, house and street to a process, dependency, host and wider service path.",
        "The analogy is translated back into literal system objects."
      ),
      mechanism: step(
        "Trace process to dependency",
        "A process can use little CPU while waiting on storage, a socket, a lock or a remote service. Low CPU therefore does not prove health.",
        "Predict which signal would change if the database stopped responding.",
        "The prediction names a concrete signal and why it changes."
      ),
      "worked-example": step(
        "Walk one diagnosis",
        "The endpoint is slow, CPU is normal and the process has a database socket. Compare request latency with database latency before changing the process.",
        "Write the exact next observation you would collect and what two outcomes would mean.",
        "The learner can define a discriminating observation."
      ),
      counterexample: step(
        "Learn what CPU does not prove",
        "High CPU can be normal for a busy service. Low CPU can happen during a dependency wait. CPU is evidence, not a verdict.",
        "Give one healthy explanation and one failure explanation for low CPU.",
        "Both explanations are plausible and distinguishable."
      ),
      visual: step(
        "Trace the process model",
        "Follow Symptom -> Process -> Resource -> Dependency -> Proof on the lesson visual. The failure enters at the smallest boundary that can explain the observed delay.",
        "Point to the boundary you would inspect first and name the evidence you need.",
        "The learner can localize the next diagnostic boundary."
      )
    }
  },
  "B1.2": {
    target: "Separate DNS naming from route, transport and application behavior.",
    steps: {
      "plain-language": step("Separate name from connection", "A name can resolve correctly while the service remains unreachable. Treat DNS output and connection output as different evidence.", "Write one sentence describing what DNS proves and what it does not.", "The answer keeps name resolution separate from transport."),
      analogy: step("Think like a delivery address", "Finding an address in a directory does not prove the road is open or the building is accepting visitors.", "Map directory, road and building to DNS, network path and service endpoint.", "The learner maps the analogy to the actual request path."),
      mechanism: step("Walk the request path", "Name -> Route -> Connection -> Application is a sequence of separate checks. A timeout after successful DNS belongs to a later boundary.", "Predict which evidence should stay green when only the service port is blocked.", "The prediction identifies the unaffected layer."),
      "worked-example": step("Compare two failures", "Resolve the hostname, then test the connection from the same machine. Compare a valid service endpoint with a deliberately closed port.", "Write the expected evidence for both cases before running them.", "Expected outcomes are stated before execution."),
      counterexample: step("Do not blame DNS for every network failure", "A successful DNS response can coexist with a route failure, timeout or refused connection.", "Give one failure that DNS cannot explain after the name already resolved.", "The learner chooses a later-layer failure."),
      visual: step("Trace the path", "Follow Name -> Route -> Connection -> Application on the visual and mark exactly where the controlled failure enters.", "Identify the smallest failed layer and the observation that proves it.", "The learner localizes the failure correctly.")
    }
  },
  "B1.3": {
    target: "Separate DNS, transport, TLS and HTTP evidence.",
    steps: {
      "plain-language": step("Read the status at its layer", "A 500 is an HTTP response. A TLS certificate error happens before normal HTTP. A timeout may happen before either.", "Classify 500, timeout and certificate mismatch into layers.", "All three are classified at different layers."),
      analogy: step("Use a building entrance", "DNS finds the building, the network gets you to the door, TLS checks the secure entrance and HTTP is the conversation inside.", "Map one example failure to each part of the analogy.", "Each mapping points to one literal mechanism."),
      mechanism: step("Walk the stack", "DNS -> Route -> Transport -> TLS -> HTTP. A healthy lower layer does not guarantee a healthy upper layer.", "Predict what remains possible if TCP connects but TLS fails.", "The learner identifies TLS-level causes while keeping TCP healthy."),
      "worked-example": step("Diagnose 401 vs timeout", "A 401 proves an HTTP response arrived. A timeout gives no such application-layer proof.", "Write the next diagnostic action for each response.", "The actions differ by layer."),
      counterexample: step("Challenge the 'network is broken' story", "A 404, 401 or 500 can occur while the network path is working correctly.", "Explain why an HTTP 500 is not proof of DNS failure.", "The explanation is technically layered."),
      visual: step("Trace the HTTPS stack", "Use the visual to mark the highest layer reached by the observed signal.", "Place one example signal at the correct point in DNS, transport, TLS or HTTP.", "The signal is placed consistently with the mechanism.")
    }
  },
  "B1.4": {
    target: "Keep image, container, process, filesystem, network and host boundaries separate.",
    steps: {
      "plain-language": step("Separate package from runtime", "An image is a reusable package. A container is a running instance. The process is what keeps the container alive.", "Explain what changes when the image stays the same but the container is recreated.", "The answer distinguishes image identity from runtime state."),
      analogy: step("Use the apartment model", "An image is like a prepared apartment design, a container is one occupied unit and the process is the resident doing the work.", "Map apartment design, unit and resident to image, container and process.", "The analogy is translated back correctly."),
      mechanism: step("Walk the container boundary", "The main process runs inside namespaces while sharing the host kernel. A container is not a separate kernel.", "Predict what happens when the main process exits.", "The learner predicts container stop behavior."),
      "worked-example": step("Diagnose a stopped container", "Inspect the command, logs and runtime state before assuming Docker itself is broken.", "Write the three observations you would collect before changing the image.", "The observations are ordered and diagnostic."),
      counterexample: step("Challenge the tiny-VM model", "A container can have an isolated process and network view while still using the host kernel.", "Name one fact that would be different in a real virtual machine.", "The learner states the shared-kernel difference."),
      visual: step("Trace image to kernel", "Follow Image -> Container -> Process -> Namespace -> Host Kernel and locate the failure boundary.", "Mark whether a suspected failure belongs to image contents, runtime state or host-kernel behavior.", "The boundary classification is explicit.")
    }
  },
  "B1.5": {
    target: "Make the service repeatable through image, configuration, runtime, health and user proof.",
    steps: {
      "plain-language": step("Define repeatability", "Repeatable means another engineer can follow the same operating contract, not that one engineer made it work once.", "List the five things another engineer must know before starting the service.", "The list covers configuration, startup, readiness and proof."),
      analogy: step("Use a restaurant opening", "A restaurant is repeatable when the opening checklist works for the next shift, not when one manager remembers a private trick.", "Map opening checklist, ready kitchen and first customer order to startup contract, readiness and user proof.", "The analogy maps to concrete system states."),
      mechanism: step("Separate running from ready", "A process can be running while a dependency is unavailable. Readiness is a decision about whether traffic should be accepted.", "Predict what changes when the database is still starting.", "The prediction separates process life from service readiness."),
      "worked-example": step("Prove the operating contract", "Start from known configuration, verify readiness, perform one real user action, replace the service instance, and verify persistent data.", "Write the evidence you would keep at each stage.", "Each stage has a specific evidence artifact."),
      counterexample: step("Reject 'docker ps is enough'", "A running container proves process life, not correct configuration, dependency readiness or user-path success.", "Name two failures that can coexist with a running container.", "The failures belong to different boundaries."),
      visual: step("Trace the repeatability path", "Follow Image -> Configuration -> Runtime -> Health -> User path, with persistent data outside the disposable container lifecycle.", "Point to where a restart should change state and where it should not.", "The learner identifies lifecycle boundaries.")
    }
  },
  "B2.1": {
    target: "Trace a release from change to tested artifact, deployment and runtime proof.",
    steps: {
      "plain-language": step("Define a safe release", "A deploy command succeeding is not proof that users are healthy. A release needs a known change, tested artifact, deployed identity and runtime evidence.", "Name the evidence needed before and after deployment.", "The answer includes source, artifact and runtime identity."),
      analogy: step("Use an approved document", "You do not ask for 'the latest copy'. You use a versioned approved copy so everyone knows which document they are holding.", "Map the approved copy to the release artifact and version.", "The analogy preserves release identity."),
      mechanism: step("Walk change to production", "Change -> Review -> Test -> Artifact -> Deploy -> Verify. Each stage produces evidence that constrains the next decision.", "Predict what a mismatch between deployed and running release identity means.", "The prediction identifies an identity inconsistency."),
      "worked-example": step("Diagnose a bad deployment", "A deployment says success while error rate rises. Compare release identity, runtime behavior and rollback scope before deciding.", "Write the smallest evidence set you need before rollback.", "The evidence set supports a reversible decision."),
      counterexample: step("Challenge deployment-success thinking", "A platform can report a successful deployment action while the application immediately fails real requests.", "Give one reason deployment status and application health can disagree.", "The learner separates control-plane completion from user behavior."),
      visual: step("Trace the release spine", "Follow Change -> Review -> Test -> Artifact -> Deploy -> Verify and identify the point where evidence diverges.", "Mark the first evidence that would tell you the deployed artifact is not the intended one.", "The learner localizes release identity failure.")
    }
  },
  "B2.2": {
    target: "Turn a vague performance symptom into scoped evidence and a defensible diagnosis.",
    steps: {
      "plain-language": step("Make 'slow' measurable", "Start with endpoint, users, time window and latency distribution before choosing a cause.", "Rewrite 'the app is slow' as one measurable symptom.", "The statement contains a measurable scope."),
      analogy: step("Use an emergency-room queue", "A crowded waiting room does not tell you which patient, process or dependency is delaying one treatment path.", "Map triage, tests and diagnosis to scope, signals and hypothesis.", "The analogy becomes a literal investigation."),
      mechanism: step("Assign each signal a job", "Metrics show values over time, logs show events, health checks answer a focused state question and traces show where one request spent time.", "Choose the signal that best answers one concrete diagnostic question.", "The choice is justified by the question."),
      "worked-example": step("Follow one latency spike", "API latency rises, CPU stays normal and database latency rises with it. Treat the database as a hypothesis, not a verdict.", "Write one test that could falsify the database hypothesis.", "The learner names a discriminating test."),
      counterexample: step("Do not worship a red graph", "A CPU spike without user impact can be normal. Zero HTTP errors can coexist with incorrect application behavior.", "Give one alarming signal that does not prove failure.", "The learner provides context and an alternative cause."),
      visual: step("Trace symptom to proof", "Follow Symptom -> Scope -> Service -> Dependency -> Proof and mark where evidence changes the hypothesis.", "Point to the stage at which you would stop collecting data and act.", "The action boundary is evidence-based.")
    }
  },
  "B2.3": {
    target: "Prove restore and recovery, not just the existence of a backup.",
    steps: {
      "plain-language": step("Separate backup from recovery", "A backup is a copy. Recovery is a working service restored within the accepted data-loss and time limits.", "Explain the difference in one sentence and name RPO or RTO.", "The sentence distinguishes copy from service recovery."),
      analogy: step("Use a spare key", "Owning a spare key is not the same as proving the door can be opened when the original is broken.", "Map key, lock, time limit and successful entry to backup, restore, RTO and user proof.", "The analogy maps to recovery steps."),
      mechanism: step("Walk the recovery chain", "Backup -> Restore -> Compatibility -> Verify -> Recover. Application version, schema, configuration and keys can all block recovery.", "Predict what happens if the database restores but the application version cannot read it.", "The learner identifies compatibility as the failure."),
      "worked-example": step("Run a safe restore", "Restore into a separate target first, compare expected data, confirm compatible application state, then test the real user path.", "List the three strongest recovery checks before production cutover.", "The checks cover data, compatibility and user behavior."),
      counterexample: step("Challenge 'backup exists'", "A backup can be old, corrupt, inaccessible or encrypted without an available recovery key.", "Name one reason a successful backup job can still produce failed recovery.", "The reason is technically plausible."),
      visual: step("Trace recovery boundaries", "Follow Backup -> Restore -> Compatibility -> Verify -> Recover and identify where the current evidence stops.", "Point to the first stage that is not yet proven and explain why.", "The learner distinguishes restore from recovery proof.")
    }
  },
  "B3.1": {
    target: "Reason about queues, backlog, consumer throughput, retries and duplicate delivery.",
    steps: {
      "plain-language": step("Define queue pressure", "A queue grows when work arrives faster than effective processing capacity. The backlog is a state, not a vague feeling.", "State what should happen to queue depth when the consumer stops.", "The prediction matches the queue state."),
      analogy: step("Use a checkout line", "A store can accept customers faster than cashiers can serve them. The line makes waiting work visible.", "Map customers, line and cashiers to producer, queue and consumer.", "The analogy maps correctly."),
      mechanism: step("Walk message state", "Produced -> Queued -> Delivered -> Processing -> Acknowledged or Failed. Acknowledgement boundaries can cause duplicate delivery.", "Predict what happens if processing succeeds but acknowledgement fails.", "The learner predicts possible redelivery."),
      "worked-example": step("Diagnose backlog growth", "Observe arrival rate, consumer throughput and dependency latency before adding workers. More workers can move the bottleneck.", "Write the next measurement you need before scaling consumers.", "The measurement tests the bottleneck hypothesis."),
      counterexample: step("Reject 'more workers fixes it'", "More consumers can overload a shared database and make the queue worse.", "Give one downstream bottleneck that can appear after increasing workers.", "The downstream dependency is specific and testable."),
      visual: step("Trace the queue state", "Follow Producer -> Queue -> Consumer -> Outcome and place retry, idempotency and dead-letter behavior at the correct boundaries.", "Mark where duplicate delivery becomes a business-safety problem.", "The learner ties duplicate delivery to side effects.")
    }
  },
  "B3.2": {
    target: "Run an incident from user impact through safe mitigation, recovery and learning.",
    steps: {
      "plain-language": step("Start with user impact", "An incident is a live system problem. First define what users cannot do, then scope and collect evidence.", "State one user-visible symptom without naming a cause.", "The symptom is descriptive rather than causal."),
      analogy: step("Use a building emergency", "During an emergency, you first protect people and then determine exactly why the failure happened.", "Map impact, mitigation, evidence and recovery to the building response.", "The analogy preserves the priority order."),
      mechanism: step("Separate mitigation from diagnosis", "Mitigation reduces harm while evidence continues. A perfect root-cause explanation is not required before taking a safe protective action.", "Predict one action that could reduce harm but also create a new risk.", "The learner identifies both benefit and risk."),
      "worked-example": step("Walk the incident timeline", "Record symptom time, evidence, hypothesis, mitigation, recovery signals and the follow-up change in order.", "Write a six-line incident timeline for the current scenario.", "The timeline separates observations from actions."),
      counterexample: step("Challenge restart-first behavior", "Restarting everything can remove transient evidence, increase dependency pressure or create a second failure.", "Name one reason a blanket restart could make the incident worse.", "The reason is tied to a concrete dependency."),
      visual: step("Trace the incident loop", "Follow Impact -> Scope -> Evidence -> Mitigate -> Recover -> Learn and identify the first safe intervention point.", "Point to the exact observation that justifies mitigation.", "The learner links action to evidence.")
    }
  }
};
