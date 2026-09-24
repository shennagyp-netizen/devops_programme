export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type PlatformId = "macos" | "linux" | "windows";

export type CourseDefinition = {
  id: CourseLevel;
  title: string;
  purpose: string;
  projects: string[];
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
    purpose: "Introduce operational thinking by solving concrete distributed-system problems and adding tools only when the problem requires them.",
    projects: ["B1", "B2", "B3"]
  },
  {
    id: "intermediate",
    title: "DevOps Engineering",
    purpose: "Build deep production engineering capability across containers, Kubernetes, infrastructure, observability, reliability and incidents.",
    projects: ["I1", "I2", "I3"]
  },
  {
    id: "advanced",
    title: "Large-Scale Distributed Systems",
    purpose: "Reason about global systems, partial failure, capacity, resilience, recovery and very large operational blast radii.",
    projects: ["A1", "A2", "A3"]
  }
];

export const platformProfiles: PlatformProfile[] = [
  { id: "macos", label: "macOS", shell: "zsh", notes: "Primary local-lab target in the current MVP." },
  { id: "linux", label: "Linux", shell: "bash", notes: "Native Linux execution path." },
  { id: "windows", label: "Windows", shell: "PowerShell", notes: "Windows-native command adapter planned; conceptual objectives remain shared." }
];
