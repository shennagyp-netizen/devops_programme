import type { Lesson } from "./curriculum";
import type { CourseLevel, PlatformId } from "./programme";
import { lessons as intermediateCore } from "./curriculum";

export type CourseLesson = Lesson & {
  course: CourseLevel;
  sectionId: string;
  projectId: string;
  kind: "foundation" | "application";
  humanExample: string;
  podcastStatus: "ready" | "authoring";
  platformCommands: Partial<Record<PlatformId, string>>;
};

const withIntermediateMetadata = (lesson: Lesson): CourseLesson => ({
  ...lesson,
  course: "intermediate",
  sectionId: sectionForIntermediate(lesson.id),
  projectId: projectForIntermediate(lesson.id),
  kind: foundationIntermediate(lesson.id) ? "foundation" : "application",
  humanExample: exampleForIntermediate(lesson.id),
  podcastStatus: "ready",
  platformCommands: {
    macos: lesson.lab.command,
    linux: lesson.lab.command,
    windows: "Use the Windows adapter for the same observation."
  }
});

function sectionForIntermediate(id: string) {
  if (id === "D1.1" || id === "D1.2" || id === "D1.3") return "I-F1";
  if (id === "D1.4" || id === "D1.5" || id === "D1.6" || id.startsWith("D2.")) return "I-F2";
  if (["D2.3", "D2.4"].includes(id)) return "I-F2";
  if (["D2.5", "D2.6", "D2.7"].includes(id)) return "I-A1";
  if (id === "D3.1") return "I-A2";
  if (id === "D3.2" || id === "D3.3") return "I-A3";
  if (id === "D3.4" || id === "D3.5") return "I-A2";
  if (["D4.1", "D4.2", "D4.3", "D4.4", "D4.5", "D4.6"].includes(id)) return "I-A4";
  if (["D5.5", "D5.8"].includes(id)) return "I-A5";
  return "I-A6";
}

function projectForIntermediate(id: string) {
  if (id.startsWith("D1.") || ["D2.1", "D2.2", "D2.3", "D2.4", "D2.5", "D2.6", "D2.7"].includes(id)) return "I1";
  if (id.startsWith("D3.") || id.startsWith("D4.")) return id.startsWith("D3.") ? "I1" : "I2";
  return "I3";
}

function foundationIntermediate(id: string) {
  return ["D1.1", "D1.2", "D1.3", "D1.4", "D1.5", "D1.6", "D2.1", "D2.2"].includes(id);
}

function exampleForIntermediate(id: string) {
  const examples: Record<string, string> = {
    "D1.1": "A workshop can be busy because one worker has too much work, not because the whole building is broken.",
    "D1.2": "A good tool belt helps you inspect the right part before you start changing things.",
    "D1.3": "A locked room is not the same problem as a broken machine. The evidence is different.",
    "D1.4": "A delivery still needs a local street and building path before it can reach the right address.",
    "D1.5": "A city can have many streets, but an address still tells you which local area to search.",
    "D1.6": "A driver can have the right address but still take the wrong road.",
    "D2.1": "A phone call can be refused, never reach the other side, or connect and then break.",
    "D2.2": "A name can point to an old address when a cache has not expired yet.",
    "D2.3": "A receptionist can answer the phone but still return the wrong service response.",
    "D2.4": "A badge can prove who you are before a secure door lets you in.",
    "D2.5": "Separate kitchens can share one building without sharing every tool and process.",
    "D2.6": "Two rooms can share a building but still need clear doors and storage rules.",
    "D2.7": "When a kitchen cannot reach its storage room, adding more cooks does not fix the door.",
    "D3.1": "A hotel keeps trying to bring the number of ready rooms back to the target.",
    "D3.2": "A hospital desk routes visitors without telling them the exact bed number first.",
    "D3.3": "A warehouse needs both a location for data and rules for who may use it.",
    "D3.4": "Opening more checkout lanes helps only until the payment system becomes the bottleneck.",
    "D3.5": "A replacement worker may arrive and still fail because the same bad condition remains.",
    "D4.1": "A signed contract has a clear version. 'The latest one' is not enough during an incident.",
    "D4.2": "A factory has checks before a product reaches the customer.",
    "D4.3": "A written recipe lets another shift repeat the same process.",
    "D4.4": "A plan for a building is useful because workers can inspect what changed before they build it.",
    "D4.5": "A shared change log prevents two people from quietly changing the same plan in different ways.",
    "D4.6": "A building needs power, roads, storage and access control; cloud systems also need several basic services.",
    "D5.1": "More checkout lanes can move the queue to the payment desk instead.",
    "D5.2": "Several warehouses can hold stock closer to customers, but now the stock counts must agree.",
    "D5.3": "One branch can keep working while another branch is down, but they may no longer see the same state.",
    "D5.4": "Calling the same broken number again and again can make the phone system even busier.",
    "D5.5": "A maintenance team needs clear signals about which machine or service is actually failing.",
    "D5.6": "A spare key is useful only if you tested that it opens the replacement door.",
    "D5.7": "Moving customers to another city only helps if that city has capacity and the data it needs.",
    "D5.8": "During a real incident, the first job is to make the situation safer while you keep learning what happened."
  };
  return examples[id] ?? "Use a familiar real-life situation to make the system behavior easy to remember.";
}

const beginner: CourseLesson[] = [
  lesson({
    id: "B1.1",
    title: "The App Is Slow — Where Do We Look?",
    domain: "beginner-foundation",
    sectionId: "B-F1",
    projectId: "B1",
    kind: "foundation",
    objective: "Learn to separate an application symptom from CPU, memory, process, file and network causes.",
    example: "A clinic says the lab system is slow. Before restarting it, ask which part is slow and which evidence can separate the possible causes.",
    command: "ps aux | head && lsof -i -P -n | head",
    challenge: "Pick one process, predict what will change if it stops, then observe and explain the result.",
    recall: ["What is a process?", "What does the kernel manage?", "Why is a CPU graph not a full diagnosis?", "What evidence would you collect first?", "Where would this appear in B1?"]
  }),
  lesson({
    id: "B1.2",
    title: "How Does a Request Find a Service?",
    domain: "beginner-foundation",
    sectionId: "B-F2",
    projectId: "B1",
    kind: "foundation",
    objective: "Build the basic path from a name to an IP address, route, port and application response.",
    example: "A delivery needs a name, an address and a route. A network request needs matching information at several layers too.",
    command: "dig example.com && curl -I https://example.com",
    challenge: "Explain which layer you would check after a DNS lookup works but the connection still times out.",
    recall: ["What does DNS give you?", "What does an IP address identify?", "What is a port?", "What is a route?", "What evidence separates timeout from refusal?"]
  }),
  lesson({
    id: "B1.3",
    title: "Why the Application Needs HTTP, TLS and DNS",
    domain: "beginner-application",
    sectionId: "B-A1",
    projectId: "B1",
    kind: "application",
    objective: "Connect naming, transport, security and application requests into one request path.",
    example: "Calling a business can fail because the number is wrong, the line cannot be reached, the call is rejected, or the person answers but cannot help.",
    command: "curl -v https://example.com",
    challenge: "Create two different failure cases and explain why the error is not simply 'the network is broken'.",
    recall: ["Why does DNS come before the connection?", "What does TLS add?", "What is an HTTP status?", "What is a timeout?", "How would B1 use these ideas?"]
  }),
  lesson({
    id: "B1.4",
    title: "Why Containers Exist",
    domain: "beginner-application",
    sectionId: "B-A2",
    projectId: "B1",
    kind: "application",
    objective: "See the problem that containers solve: repeatable application environments with process and filesystem isolation.",
    example: "Two kitchens can share one building without sharing every tool, ingredient and work rule.",
    command: "docker run --rm nginx:alpine nginx -t",
    challenge: "Run a container, inspect it, change one environment value, and explain what belongs to the image and what belongs to the running container.",
    recall: ["What is an image?", "What is a container?", "What does isolation mean here?", "Where does container state live?", "Why does B1 need a repeatable environment?"]
  }),
  lesson({
    id: "B1.5",
    title: "Make the App Repeatable",
    domain: "beginner-application",
    sectionId: "B-A2",
    projectId: "B1",
    kind: "application",
    objective: "Turn the application into a repeatable local service with clear startup, configuration and health checks.",
    example: "A restaurant works better when every shift knows the same setup instead of asking how to start the kitchen.",
    command: "docker ps && docker inspect $(docker ps -q | head -1)",
    challenge: "Break one configuration value, observe the failure, then restore the known-good state.",
    recall: ["What should be repeatable?", "What is configuration?", "What is a health check?", "What evidence shows the container is healthy?", "What changes should be recorded?"]
  }),
  lesson({
    id: "B2.1",
    title: "From Code Change to Safe Delivery",
    domain: "beginner-application",
    sectionId: "B-A3",
    projectId: "B2",
    kind: "application",
    objective: "Understand how a commit becomes a checked artifact and then a controlled deployment.",
    example: "An airport has checks before a person reaches the runway. Production should have checks before software reaches users.",
    command: "git status && git log --oneline -5",
    challenge: "Create a small change, trace it from commit to artifact, and write the rollback path before deployment.",
    recall: ["Why keep a release identity?", "What does CI check?", "Why build an artifact?", "What makes rollback possible?", "What evidence should a deployment leave?"]
  }),
  lesson({
    id: "B2.2",
    title: "When 'Everything Is Slow' Is Not Enough",
    domain: "beginner-application",
    sectionId: "B-A4",
    projectId: "B2",
    kind: "application",
    objective: "Use logs, metrics and health checks to turn a vague report into a testable failure.",
    example: "A clinic cannot fix 'the lab is slow' until it knows whether the delay is at reception, the analyzer, the database or the network.",
    command: "curl -I https://example.com",
    challenge: "Given three possible causes, choose the first observation that separates them and explain why.",
    recall: ["What is a symptom?", "What is evidence?", "Why do health checks help?", "What is the first signal you would inspect?", "How does this help B2?"]
  }),
  lesson({
    id: "B2.3",
    title: "Backups Are Not the Same as Recovery",
    domain: "beginner-application",
    sectionId: "B-A4",
    projectId: "B2",
    kind: "application",
    objective: "Understand backup, restore, recovery time and recovery point as operational tasks.",
    example: "A spare key is only useful if it opens the replacement door.",
    command: "tar -czf backup-demo.tgz ./project-data && tar -tzf backup-demo.tgz | head",
    challenge: "Make a small backup, restore it to a new location, and verify the restored data.",
    recall: ["What is a backup?", "What is restore?", "Why test recovery?", "What does RPO describe?", "What does RTO describe?"]
  }),
  lesson({
    id: "B3.1",
    title: "Why Use a Queue?",
    domain: "beginner-application",
    sectionId: "B-A5",
    projectId: "B3",
    kind: "application",
    objective: "Understand asynchronous work, consumers, retries and why queues protect a system from bursts.",
    example: "A restaurant queue lets the kitchen work at its own rate instead of every customer blocking the kitchen at once.",
    command: "docker ps",
    challenge: "Draw the producer, queue and consumer path. Add a slow consumer and explain what changes.",
    recall: ["Why add a queue?", "What happens when a consumer is slow?", "What is a retry?", "What is idempotency?", "Where can B3 fail?"]
  }),
  lesson({
    id: "B3.2",
    title: "The First Real Incident",
    domain: "beginner-application",
    sectionId: "B-A5",
    projectId: "B3",
    kind: "application",
    objective: "Use evidence to find, reduce and repair a real failure instead of guessing.",
    example: "When a shop cannot take orders, the first job is to keep customers moving while you find the broken step.",
    command: "curl -v http://localhost:8080/health",
    challenge: "Write the first ten minutes of your incident: observation, hypothesis, safe action, evidence and recovery check.",
    recall: ["What did you observe?", "What was your first hypothesis?", "What action was safest?", "How did you verify recovery?", "What should change after the incident?"]
  })
];

const advanced: CourseLesson[] = [
  lesson({
    id: "A1.1",
    title: "Capacity Is a System Problem",
    domain: "advanced-foundation",
    sectionId: "A-F1",
    projectId: "A1",
    kind: "foundation",
    objective: "Reason about throughput, latency, concurrency, saturation and headroom.",
    example: "Opening more checkout lanes can move the queue to the payment system instead.",
    command: "curl -I https://example.com",
    challenge: "Draw the request path and mark the first component that will saturate as traffic doubles.",
    recall: ["What is throughput?", "What is latency?", "What is saturation?", "Why keep headroom?", "What moves the bottleneck?"]
  }),
  lesson({
    id: "A1.2",
    title: "Queues and Backpressure",
    domain: "advanced-foundation",
    sectionId: "A-F1",
    projectId: "A1",
    kind: "foundation",
    objective: "Use queue depth, service rate and backpressure to explain overload.",
    example: "A clinic can keep taking new patients, but if the lab cannot process them, the waiting room just grows.",
    command: "docker stats --no-stream",
    challenge: "Model a producer that is faster than its consumer and show where backpressure must appear.",
    recall: ["What makes a queue grow?", "What is backpressure?", "What happens when the queue is full?", "What signal shows overload?", "How can load move between components?"]
  }),
  lesson({
    id: "A1.3",
    title: "Replicas Create New Rules",
    domain: "advanced-foundation",
    sectionId: "A-F2",
    projectId: "A1",
    kind: "foundation",
    objective: "Understand replication, stale reads, conflicts and the cost of keeping multiple copies.",
    example: "Several warehouses can hold the same stock data, but now their numbers must stay close enough to be useful.",
    command: "curl -I https://example.com",
    challenge: "Choose a read that can tolerate stale data and one that cannot. Explain the reason.",
    recall: ["Why replicate data?", "What is stale data?", "What is a conflict?", "Why can more copies make a system harder?", "Where does locality help?"]
  }),
  lesson({
    id: "A1.4",
    title: "Failure Domains",
    domain: "advanced-foundation",
    sectionId: "A-F3",
    projectId: "A2",
    kind: "foundation",
    objective: "Separate process, host, zone and region failures and size the blast radius of each.",
    example: "One room closing is a small problem. The whole building closing is a different failure.",
    command: "kubectl get nodes",
    challenge: "Take one service and list what happens when one process, one host, one zone and one region fail.",
    recall: ["What is a failure domain?", "Why separate zones?", "What is blast radius?", "What should fail together?", "How does this change recovery?"]
  }),
  lesson({
    id: "A1.5",
    title: "Global Traffic Without Magic",
    domain: "advanced-application",
    sectionId: "A-A1",
    projectId: "A1",
    kind: "application",
    objective: "Design global traffic routing with health, latency, capacity and regional failure in mind.",
    example: "Sending customers to another city does not help if that city has no staff or stock.",
    command: "curl -I https://example.com",
    challenge: "Design a two-region traffic policy and state what happens when one region becomes unhealthy.",
    recall: ["What decides traffic placement?", "Why does health matter?", "Why does latency matter?", "What if the backup region is full?", "How does DNS fit?"]
  }),
  lesson({
    id: "A1.6",
    title: "Data Locality and the Real Cost of Distance",
    domain: "advanced-application",
    sectionId: "A-A1",
    projectId: "A1",
    kind: "application",
    objective: "Reason about latency, data location, cross-region traffic and consistency trade-offs.",
    example: "Moving a customer to a closer shop helps only if the shop has the information and stock needed for the visit.",
    command: "curl -I https://example.com",
    challenge: "Pick one write path and one read path. Decide where their data should live and why.",
    recall: ["Why does distance matter?", "What is data locality?", "When is cross-region access acceptable?", "What consistency cost appears?", "What does the user feel?"]
  }),
  lesson({
    id: "A2.1",
    title: "Break One Dependency",
    domain: "advanced-application",
    sectionId: "A-A2",
    projectId: "A2",
    kind: "application",
    objective: "Use controlled failure to see which dependencies are required and which can be bypassed.",
    example: "One blocked door can become a building-wide problem when every route depends on it.",
    command: "kubectl get pods,svc -A",
    challenge: "Disable one non-core dependency in a safe lab and record the first visible signal.",
    recall: ["What failed first?", "Which requests were affected?", "What kept working?", "What evidence showed the dependency?", "What fallback would help?"]
  }),
  lesson({
    id: "A2.2",
    title: "Retry Storms",
    domain: "advanced-application",
    sectionId: "A-A2",
    projectId: "A2",
    kind: "application",
    objective: "Understand how retries can turn a small failure into a larger overload event.",
    example: "Calling a busy phone line every two seconds does not make the line less busy.",
    command: "curl -I https://example.com",
    challenge: "Model a service that retries too fast and add backoff and jitter.",
    recall: ["Why retry?", "Why can retrying make things worse?", "What is backoff?", "What is jitter?", "When should a request not be retried?"]
  }),
  lesson({
    id: "A2.3",
    title: "Partial Network Failure",
    domain: "advanced-application",
    sectionId: "A-A2",
    projectId: "A2",
    kind: "application",
    objective: "Diagnose a system where some paths work while others fail.",
    example: "Two branches can still talk to their local teams while the line between the branches is down.",
    command: "curl -v https://example.com",
    challenge: "Given two working paths and one failing path, identify the smallest failure area that explains the evidence.",
    recall: ["What does partial failure mean?", "Why is it hard?", "What paths still work?", "What evidence narrows the failure?", "What is the safest response?"]
  }),
  lesson({
    id: "A3.1",
    title: "Design for Very Large Traffic",
    domain: "advanced-application",
    sectionId: "A-A3",
    projectId: "A3",
    kind: "application",
    objective: "Build a capacity model for a service with very large traffic and clear bottleneck assumptions.",
    example: "At very high volume, a small extra cost per request becomes a large monthly cost.",
    command: "curl -I https://example.com",
    challenge: "Choose a target traffic level and estimate which resource becomes the first bottleneck.",
    recall: ["What is the traffic unit?", "What resource saturates first?", "What can be cached?", "What can be asynchronous?", "What cost grows with traffic?"]
  }),
  lesson({
    id: "A3.2",
    title: "The Trade-off Review",
    domain: "advanced-application",
    sectionId: "A-A3",
    projectId: "A3",
    kind: "application",
    objective: "Make explicit trade-offs among latency, consistency, availability, cost and operational complexity.",
    example: "A faster shop is not useful if it gives every customer the wrong stock count.",
    command: "kubectl get pods,svc -A",
    challenge: "Review your A3 design and write one case where improving one target makes another worse.",
    recall: ["What are the main trade-offs?", "Which target matters most here?", "What did you give up?", "What failure became more likely?", "How will you measure the choice?"]
  })
];

type LessonAuthoringInput = {
  id: string;
  title: string;
  domain: string;
  sectionId: string;
  projectId: string;
  kind: "foundation" | "application";
  objective: string;
  example: string;
  command: string;
  challenge: string;
  recall: string[];
};

function lesson(input: LessonAuthoringInput): CourseLesson {
  return {
    ...input,
    course: input.id.startsWith("B") ? "beginner" : "advanced",
    podcast: input.id.startsWith("B")
      ? `podcasts/beginner/${input.id}.txt`
      : `podcasts/advanced/${input.id}.txt`,
    podcastStatus: "authoring",
    platformCommands: {
      macos: input.command,
      linux: input.command,
      windows: "Use the Windows adapter for the same observation."
    },
    lab: {
      objective: input.objective,
      command: input.command,
      challenge: input.challenge
    }
  };
}

export const courseLessons: CourseLesson[] = [
  ...beginner,
  ...intermediateCore.map(withIntermediateMetadata),
  ...advanced
];

export const lessonsByCourse: Record<CourseLevel, CourseLesson[]> = {
  beginner: beginner,
  intermediate: intermediateCore.map(withIntermediateMetadata),
  advanced: advanced
};
