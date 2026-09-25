export type Turn = {
  id: string;
  speaker: "A" | "B";
  text: string;
  kind: "dialogue" | "prediction" | "lab" | "recall";
};

export function podcastUrl(path: string) {
  if (path.startsWith("/")) return path;
  return `/${path}`;
}

export function getEpisodeText(source: string, lessonId: string) {
  const marker = new RegExp(`(?:^|\\n)EPISODE ${lessonId} —[^\\n]*\\n`);
  const match = source.match(marker);
  if (!match || match.index === undefined) return "";

  const start = match.index + match[0].length;
  const rest = source.slice(start);
  const next = rest.search(/\nEPISODE [A-Z0-9]+\.[0-9]+ —/);

  return (next >= 0 ? rest.slice(0, next) : rest).trim();
}

function classifyTurn(text: string): Turn["kind"] {
  const normalized = text.toLowerCase();

  if (
    /(pause me|prediction time|make a prediction|what do you think happens|what evidence would you expect|don't look it up yet)/i.test(
      normalized
    )
  ) {
    return "prediction";
  }

  if (
    /(mac lab|mac exercise|run (that|the) command|run the command|lab:|hands-on|practical challenge)/i.test(
      normalized
    )
  ) {
    return "lab";
  }

  if (
    /(recall|retrieval|without notes|five questions|question one|question two)/i.test(
      normalized
    )
  ) {
    return "recall";
  }

  return "dialogue";
}

export function parseTurns(text: string, lessonId = "episode"): Turn[] {
  return text
    .split(/\n\s*(?=Speaker [AB]:)/)
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x, index) => {
      const match = x.match(/^Speaker ([AB]):\s*([\s\S]*)$/);

      if (!match) {
        return {
          id: `${lessonId}.T${String(index + 1).padStart(3, "0")}`,
          speaker: "A",
          text: x,
          kind: classifyTurn(x)
        };
      }

      return {
        id: `${lessonId}.T${String(index + 1).padStart(3, "0")}`,
        speaker: match[1] as "A" | "B",
        text: match[2].trim(),
        kind: classifyTurn(match[2])
      };
    });
}
