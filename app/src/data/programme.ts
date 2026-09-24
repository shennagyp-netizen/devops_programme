export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type PlatformId = "macos" | "linux" | "windows";

export type CourseSection = {
  id: string;
  title: string;
  kind: "foundation" | "application";
  humanExample: string;
};

export type CourseDefinition = {
  id: CourseLevel;
  title: string;
  purpose: string;
  projects: string[];
  sections: CourseSection[];
};

export type PlatformProfile = {
  id: PlatformId;
  label: string;
  shell: string;
  notes: string;
};

export const courses: CourseDefinition[] = [
  {
    id: "beginner",
    title: "DevOps Through Problems",
    purpose:
      "Solve concrete distributed-system problems and introduce each DevOps tool only when the problem creates a reason to learn it.",
    projects: ["B1", "B2", "B3"],
    sections: [
      {
        id: "B-F1",
        title: "Linux and Process Foundations",
        kind: "foundation",
        humanExample: "A small shop where one person suddenly has to do every job."
      },
      {
        id: "B-F2",
        title: "Networking Foundations",
        kind: "foundation",
        humanExample: "A delivery needs both an address and a route before it can arrive."
      },
      {
        id: "B-A1",
        title: "Service Communication",
        kind: "application",
        humanExample: "A phone call can fail because the number is wrong, unreachable, rejected, or answered by the wrong service."
      },
      {
        id: "B-A2",
        title: "Containers",
        kind: "application",
        humanExample: "A kitchen separates work areas while sharing controlled storage."
      },
      {
        id: "B-A3",
        title: "CI/CD and Reproducible Delivery",
        kind: "application",
        humanExample: "An airport uses controlled gates rather than letting every passenger walk onto the runway."
      },
      {
        id: "B-A4",
        title: "Observability and Recovery",
        kind: "application",
        humanExample: "A clinic cannot diagnose 'everything is slow' without knowing which step is slow."
      },
      {
        id: "B-A5",
        title: "Queues, Retries and Failure",
        kind: "application",
        humanExample: "A restaurant queue prevents every customer from shouting orders directly at the kitchen."
      }
    ]
  },
  {
    id: "intermediate",
    title: "DevOps Engineering",
    purpose:
      "Build deep production engineering capability across Linux, networking, containers, Kubernetes, CI/CD, infrastructure, observability, reliability and incidents.",
    projects: ["I1", "I2", "I3"],
    sections: [
      {
        id: "I-F1",
        title: "Linux and Operating Systems",
        kind: "foundation",
        humanExample: "Inspect the actual workload before blaming the machine."
      },
      {
        id: "I-F2",
        title: "Networking and Protocols",
        kind: "foundation",
        humanExample: "A phone call saying 'it failed' is not enough to tell whether the number, route, endpoint, or service was wrong."
      },
      {
        id: "I-A1",
        title: "Containers and Docker",
        kind: "application",
        humanExample: "Isolation helps teams share a machine without pretending every workload has the same environment."
      },
      {
        id: "I-A2",
        title: "Kubernetes Control Loops",
        kind: "application",
        humanExample: "Hotel management keeps room availability aligned with the desired operating state."
      },
      {
        id: "I-A3",
        title: "Kubernetes Networking and Storage",
        kind: "application",
        humanExample: "Hospital reception routes visitors without requiring them to know the exact bed assignment."
      },
      {
        id: "I-A4",
        title: "CI/CD and Infrastructure as Code",
        kind: "application",
        humanExample: "A factory process is useful because another shift can repeat it without guessing."
      },
      {
        id: "I-A5",
        title: "Observability and SRE",
        kind: "application",
        humanExample: "A maintenance team needs evidence about which component failed, not just a report that the building is unhappy."
      },
      {
        id: "I-A6",
        title: "Distributed Systems and Recovery",
        kind: "application",
        humanExample: "Several warehouses sharing inventory data create a synchronization problem as well as a capacity solution."
      }
    ]
  },
  {
    id: "advanced",
    title: "Large-Scale Distributed Systems",
    purpose:
      "Reason about global systems, partial failure, capacity, resilience, recovery and very large operational blast radii.",
    projects: ["A1", "A2", "A3"],
    sections: [
      {
        id: "A-F1",
        title: "Capacity and Queueing Foundations",
        kind: "foundation",
        humanExample: "Opening more checkout lanes can simply move the bottleneck to the payment system."
      },
      {
        id: "A-F2",
        title: "Distributed State Foundations",
        kind: "foundation",
        humanExample: "Several warehouses keeping copies of inventory must reconcile changes."
      },
      {
        id: "A-F3",
        title: "Failure Domains",
        kind: "foundation",
        humanExample: "Losing one room is different from losing the building."
      },
      {
        id: "A-A1",
        title: "Global Traffic and Multi-Region Systems",
        kind: "application",
        humanExample: "Moving customers to another branch only works if the inventory and staff can actually serve them."
      },
      {
        id: "A-A2",
        title: "Failure Engineering",
        kind: "application",
        humanExample: "A small blocked door can become a building-wide evacuation problem when every hallway depends on it."
      },
      {
        id: "A-A3",
        title: "Massive-Scale Service Design",
        kind: "application",
        humanExample: "At very large volume, small inefficiencies become permanent operating costs."
      }
    ]
  }
];

export const platformProfiles: PlatformProfile[] = [
  {
    id: "macos",
    label: "macOS",
    shell: "zsh",
    notes: "Primary local-lab target in the current MVP."
  },
  {
    id: "linux",
    label: "Linux",
    shell: "bash",
    notes: "Native Linux execution path."
  },
  {
    id: "windows",
    label: "Windows",
    shell: "PowerShell",
    notes: "Windows-native command adapter covers the current authored lesson set; conceptual objectives remain shared."
  }
];
