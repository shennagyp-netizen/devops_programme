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
  course: "beginner";
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
