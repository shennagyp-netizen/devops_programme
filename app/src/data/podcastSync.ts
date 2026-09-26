export type PodcastExplanationLevel = 1 | 2 | 3 | 4;

export type PodcastExplanationLevelId =
  | "very-simple"
  | "simple-technical"
  | "professional"
  | "expert";

export type PodcastTtsSpeech = {
  episodeId: string;
  explanationLevel: PodcastExplanationLevel;
  explanationLevelId: PodcastExplanationLevelId;
  label: string;
  description: string;
  scriptVersion: string;
};

export type PodcastTtsBundle = {
  episodeId: string;
  speeches: PodcastTtsSpeech[];
};

const levelIds: Record<PodcastExplanationLevel, PodcastExplanationLevelId> = {
  1: "very-simple",
  2: "simple-technical",
  3: "professional",
  4: "expert"
};

const levelLabels: Record<PodcastExplanationLevel, string> = {
  1: "Very simple",
  2: "Simple technical",
  3: "Professional",
  4: "Expert"
};

const levelDescriptions: Record<PodcastExplanationLevel, string> = {
  1: "The complete lesson information, explained with very explicit everyday language.",
  2: "The complete lesson information, explained with simple technical language.",
  3: "The complete lesson information, explained in normal professional technical language.",
  4: "The complete lesson information, explained compactly for a highly experienced engineer."
};

export const PODCAST_EXPLANATION_LEVELS = [1, 2, 3, 4] as const;

export function podcastLevelId(level: PodcastExplanationLevel) {
  return levelIds[level];
}

export function podcastLevelLabel(level: PodcastExplanationLevel) {
  return levelLabels[level];
}

export function podcastLevelDescription(level: PodcastExplanationLevel) {
  return levelDescriptions[level];
}

export function podcastExplanationUrl(
  basePath: string,
  level: PodcastExplanationLevel
) {
  const normalized = basePath.startsWith("/") ? basePath : `/${basePath}`;
  const extensionIndex = normalized.lastIndexOf(".");
  if (extensionIndex < 0) return `${normalized}.cognitive-${level}.txt`;

  return `${normalized.slice(0, extensionIndex)}.cognitive-${level}${normalized.slice(extensionIndex)}`;
}

export function buildPodcastTtsBundle(
  episodeId: string,
  scriptVersions: Record<string, string>
): PodcastTtsBundle | undefined {
  const speeches = PODCAST_EXPLANATION_LEVELS.map((level) => {
    const scriptVersion = scriptVersions[String(level)];
    if (!scriptVersion) return undefined;

    return {
      episodeId,
      explanationLevel: level,
      explanationLevelId: levelIds[level],
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

  if (candidate.speeches.length !== PODCAST_EXPLANATION_LEVELS.length) return false;

  const levels = new Set<number>();

  for (const speech of candidate.speeches) {
    if (!speech || speech.episodeId !== episodeId) return false;
    if (!PODCAST_EXPLANATION_LEVELS.includes(speech.explanationLevel)) return false;
    if (speech.explanationLevelId !== levelIds[speech.explanationLevel]) return false;
    if (speech.label !== levelLabels[speech.explanationLevel]) return false;
    if (speech.description !== levelDescriptions[speech.explanationLevel]) return false;
    if (typeof speech.scriptVersion !== "string" || !speech.scriptVersion) return false;

    if (levels.has(speech.explanationLevel)) return false;
    levels.add(speech.explanationLevel);
  }

  return levels.size === PODCAST_EXPLANATION_LEVELS.length;
}

export type PodcastScriptManifest = {
  schemaVersion: number;
  source: string;
  episodes: Record<string, string>;
  cognitiveLevels: Record<string, Record<string, string>>;
};
