export type PodcastCognitiveLevel = 1 | 2 | 3 | 4;

export type PodcastCognitiveLevelId =
  | "foundation"
  | "mechanism"
  | "diagnosis"
  | "design";

export type PodcastTtsSpeech = {
  episodeId: string;
  cognitiveLevel: PodcastCognitiveLevel;
  cognitiveLevelId: PodcastCognitiveLevelId;
  label: string;
  description: string;
  scriptVersion: string;
};

export type PodcastTtsBundle = {
  episodeId: string;
  speeches: PodcastTtsSpeech[];
};

const levelIds: Record<PodcastCognitiveLevel, PodcastCognitiveLevelId> = {
  1: "foundation",
  2: "mechanism",
  3: "diagnosis",
  4: "design"
};

const levelLabels: Record<PodcastCognitiveLevel, string> = {
  1: "Foundation",
  2: "Mechanism",
  3: "Diagnosis",
  4: "Design & transfer"
};

const levelDescriptions: Record<PodcastCognitiveLevel, string> = {
  1: "Simple mental model and purpose.",
  2: "How the system actually works.",
  3: "Failure analysis and evidence.",
  4: "System design and transfer to new cases."
};

export function podcastLevelId(level: PodcastCognitiveLevel) {
  return levelIds[level];
}

export function podcastLevelLabel(level: PodcastCognitiveLevel) {
  return levelLabels[level];
}

export function podcastLevelDescription(level: PodcastCognitiveLevel) {
  return levelDescriptions[level];
}

export function cognitivePodcastUrl(basePath: string, level: PodcastCognitiveLevel) {
  const normalized = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const extensionIndex = normalized.lastIndexOf(".");
  if (extensionIndex < 0) return `${normalized}.cognitive-${level}.txt`;

  return `${normalized.slice(0, extensionIndex)}.cognitive-${level}${normalized.slice(extensionIndex)}`;
}

export function buildPodcastTtsBundle(
  episodeId: string,
  scriptVersions: Record<string, string>
): PodcastTtsBundle | undefined {
  const speeches = ([1, 2, 3, 4] as const).map((level) => {
    const scriptVersion = scriptVersions[String(level)];
    if (!scriptVersion) return undefined;

    return {
      episodeId,
      cognitiveLevel: level,
      cognitiveLevelId: levelIds[level],
      label: levelLabels[level],
      description: levelDescriptions[level],
      scriptVersion
    };
  });

  if (speeches.some((speech) => !speech)) return undefined;

  return {
    episodeId,
    speeches: speeches as PodcastTtsSpeech[]
  };
}

export function isValidPodcastTtsBundle(
  value: unknown,
  episodeId: string
): value is PodcastTtsBundle {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Partial<PodcastTtsBundle>;
  if (candidate.episodeId !== episodeId || !Array.isArray(candidate.speeches)) {
    return false;
  }

  if (candidate.speeches.length !== 4) return false;

  const levels = new Set<number>();

  for (const speech of candidate.speeches) {
    if (!speech || speech.episodeId !== episodeId) return false;
    if (![1, 2, 3, 4].includes(speech.cognitiveLevel)) return false;
    if (speech.cognitiveLevelId !== levelIds[speech.cognitiveLevel]) return false;
    if (speech.label !== levelLabels[speech.cognitiveLevel]) return false;
    if (speech.description !== levelDescriptions[speech.cognitiveLevel]) return false;
    if (typeof speech.scriptVersion !== "string" || !speech.scriptVersion) return false;

    if (levels.has(speech.cognitiveLevel)) return false;
    levels.add(speech.cognitiveLevel);
  }

  return levels.size === 4;
}

export type PodcastScriptManifest = {
  schemaVersion: number;
  source: string;
  episodes: Record<string, string>;
  cognitiveLevels: Record<string, Record<string, string>>;
};
