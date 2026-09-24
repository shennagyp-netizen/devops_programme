import type { CourseLevel } from "./programme";

export type DiagnosticRecommendation =
  | "remediate"
  | "condense-theory"
  | "skip-theory";

export type DiagnosticQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correctOption: number;
};

export type DiagnosticDefinition = {
  sectionId: string;
  course: CourseLevel;
  title: string;
  prerequisiteLessonIds: string[];
  remediationLessonIds: string[];
  questions: DiagnosticQuestion[];
};

export const diagnosticDefinitions: DiagnosticDefinition[] = [
  {
    sectionId: "B-F1",
    course: "beginner",
    title: "Linux and Process Foundations",
    prerequisiteLessonIds: [],
    remediationLessonIds: ["B1.1"],
    questions: [
      {
        id: "BF1-P-1",
        prompt: "A process exists, but requests are slow. What does the process list prove?",
        options: [
          "That the process exists at that moment",
          "That the process is healthy",
          "That the network is healthy",
          "That its dependencies are healthy"
        ],
        correctOption: 0
      },
      {
        id: "BF1-P-2",
        prompt: "CPU is low and the service is slow. Which explanation remains plausible?",
        options: [
          "The service may be waiting on I/O or a dependency",
          "Low CPU proves there is no problem",
          "The kernel cannot schedule the process",
          "The service cannot use memory"
        ],
        correctOption: 0
      },
      {
        id: "BF1-P-3",
        prompt: "What is the safest first move when someone says 'the application is slow'?",
        options: [
          "Restart it immediately",
          "Collect evidence about scope and the slow component",
          "Increase the CPU limit",
          "Delete the logs"
        ],
        correctOption: 1
      },
      {
        id: "BF1-P-4",
        prompt: "Which evidence is most directly useful for seeing a process's open network sockets?",
        options: [
          "Git history",
          "Socket/process inspection",
          "A browser screenshot",
          "A DNS zone file"
        ],
        correctOption: 1
      }
    ]
  },
  {
    sectionId: "B-A1",
    course: "beginner",
    title: "Service Communication",
    prerequisiteLessonIds: ["B1.2"],
    remediationLessonIds: ["B1.2", "B1.3"],
    questions: [
      {
        id: "BA1-P-1",
        prompt: "DNS and TCP both succeed, but the TLS handshake fails. Which area should you inspect next?",
        options: [
          "TLS configuration or certificate behavior",
          "Subnet size",
          "Process IDs",
          "Git history"
        ],
        correctOption: 0
      },
      {
        id: "BA1-P-2",
        prompt: "An HTTPS endpoint returns HTTP 500. What does that prove?",
        options: [
          "An application-level endpoint handled the request and reported an error",
          "The database is definitely broken",
          "DNS failed",
          "The network cable is unplugged"
        ],
        correctOption: 0
      },
      {
        id: "BA1-P-3",
        prompt: "A health endpoint is 200, but a real user operation is 503. What is the useful inference?",
        options: [
          "The real operation exercises more state or dependencies than the health check",
          "The network is definitely down",
          "The health endpoint proves the whole application is healthy",
          "The DNS record must be stale"
        ],
        correctOption: 0
      },
      {
        id: "BA1-P-4",
        prompt: "Why should you avoid restarting first when an API returns intermittent 500 errors?",
        options: [
          "It can remove evidence before the failing mechanism is understood",
          "Restarting can never restore service",
          "HTTP 500 means TCP is disabled",
          "A restart changes the DNS record"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "B-F2",
    course: "beginner",
    title: "Networking Foundations",
    prerequisiteLessonIds: ["B1.1"],
    remediationLessonIds: ["B1.1", "B1.2"],
    questions: [
      {
        id: "BF2-P-1",
        prompt: "What does DNS normally give the client?",
        options: [
          "A name-to-address answer",
          "A CPU allocation",
          "An HTTP response body",
          "A TLS session"
        ],
        correctOption: 0
      },
      {
        id: "BF2-P-2",
        prompt: "What does a port identify in a network request?",
        options: [
          "The country of the server",
          "The service endpoint on the host",
          "The user's browser",
          "The DNS resolver"
        ],
        correctOption: 1
      },
      {
        id: "BF2-P-3",
        prompt: "DNS works, but the TCP connection times out. What does that tell you?",
        options: [
          "Name resolution worked, but a later network step is failing",
          "HTTP authentication failed",
          "The application is definitely healthy",
          "DNS must be broken"
        ],
        correctOption: 0
      },
      {
        id: "BF2-P-4",
        prompt: "Why is a network test best run from the location where the failure happens?",
        options: [
          "Every machine has the same network state",
          "Routes, DNS, policies and paths can differ by source",
          "The client machine changes the server's IP address",
          "It makes TCP faster"
        ],
        correctOption: 1
      }
    ]
  },
  {
    sectionId: "I-F1",
    course: "intermediate",
    title: "Linux and Operating Systems",
    prerequisiteLessonIds: [],
    remediationLessonIds: ["D1.1", "D1.3"],
    questions: [
      {
        id: "IF1-P-1",
        prompt: "A process is alive but not progressing. Which explanation remains plausible?",
        options: [
          "It may be waiting on I/O, a lock, or a dependency",
          "An alive process must be using CPU continuously",
          "The kernel cannot schedule any process",
          "The filesystem is definitely corrupt"
        ],
        correctOption: 0
      },
      {
        id: "IF1-P-2",
        prompt: "Why can low CPU still coexist with high request latency?",
        options: [
          "The service may spend time waiting on another resource",
          "Low CPU proves all dependencies are healthy",
          "CPU is unrelated to process scheduling",
          "Latency can only come from memory"
        ],
        correctOption: 0
      },
      {
        id: "IF1-P-3",
        prompt: "What evidence best separates a process problem from a downstream dependency problem?",
        options: [
          "Process state plus dependency/request timing",
          "A Git branch name",
          "A desktop screenshot",
          "The hostname alone"
        ],
        correctOption: 0
      },
      {
        id: "IF1-P-4",
        prompt: "Why inspect file descriptors and sockets during a service incident?",
        options: [
          "They show resources the process is actually using",
          "They replace application logs",
          "They prove the database is healthy",
          "They assign more CPU"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "I-F2",
    course: "intermediate",
    title: "Networking and Protocols",
    prerequisiteLessonIds: ["D1.4", "D1.5"],
    remediationLessonIds: ["D1.4", "D1.5", "D1.6", "D2.1", "D2.2"],
    questions: [
      {
        id: "IF2-P-1",
        prompt: "A request times out. What should you establish before blaming HTTP?",
        options: [
          "Whether the required connection path was established",
          "Whether the code has a unit test",
          "Whether the browser is open",
          "Whether Git has a new commit"
        ],
        correctOption: 0
      },
      {
        id: "IF2-P-2",
        prompt: "Why can the same hostname behave differently from two source hosts?",
        options: [
          "DNS, routing, policy, proxy or destination selection can differ by source",
          "HTTP always changes the hostname",
          "TCP uses a different port for every host",
          "CIDR only applies to browsers"
        ],
        correctOption: 0
      },
      {
        id: "IF2-P-3",
        prompt: "TCP connects but TLS fails. What layer should you investigate next?",
        options: [
          "TLS negotiation and certificate/hostname behavior",
          "Ethernet cabling only",
          "CPU scheduling only",
          "Git permissions"
        ],
        correctOption: 0
      },
      {
        id: "IF2-P-4",
        prompt: "Why are timeout, refusal and reset useful different clues?",
        options: [
          "They can indicate different failure points or endpoint behavior",
          "They are three names for the same event",
          "They only describe HTTP status codes",
          "They prove DNS worked"
        ],
        correctOption: 0
      }
    ]
  },
  {
    sectionId: "A-F1",
    course: "advanced",
    title: "Capacity and Queueing Foundations",
    prerequisiteLessonIds: [],
    remediationLessonIds: ["A1.1", "A1.2"],
    questions: [
      {
        id: "AF1-P-1",
        prompt: "A queue grows continuously. What relationship is most important?",
        options: [
          "Arrival rate is above effective service rate",
          "DNS TTL is too high",
          "The client uses HTTPS",
          "The UI has too many buttons"
        ],
        correctOption: 0
      },
      {
        id: "AF1-P-2",
        prompt: "Why can adding API replicas fail to improve end-to-end throughput?",
        options: [
          "Another downstream component may already be the bottleneck",
          "Replicas always reduce throughput",
          "HTTP cannot use multiple servers",
          "Queues cannot exist between services"
        ],
        correctOption: 0
      },
      {
        id: "AF1-P-3",
        prompt: "What does headroom provide in a capacity plan?",
        options: [
          "Room for variation, failures and growth before saturation",
          "A guarantee that no component can fail",
          "A replacement for monitoring",
          "A fixed global latency"
        ],
        correctOption: 0
      },
      {
        id: "AF1-P-4",
        prompt: "Why is queue age useful in addition to queue depth?",
        options: [
          "Old work shows how long demand has remained unresolved",
          "Queue age measures CPU frequency",
          "Depth and age are always identical",
          "Age proves the database is corrupt"
        ],
        correctOption: 0
      }
    ]
  }
];

export const diagnosticBySection = Object.fromEntries(
  diagnosticDefinitions.map((definition) => [definition.sectionId, definition])
) as Record<string, DiagnosticDefinition>;

export function recommendationForScore(
  score: number,
  total: number
): DiagnosticRecommendation {
  const ratio = total === 0 ? 0 : score / total;
  if (ratio >= 0.9) return "skip-theory";
  if (ratio >= 0.7) return "condense-theory";
  return "remediate";
}
