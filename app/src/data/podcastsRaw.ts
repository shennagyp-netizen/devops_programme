export type Turn = {
  id: string;
  speaker: "A" | "B";
  text: string;
  kind: "dialogue" | "prediction" | "lab" | "recall";
};

export const dayFor = (id: string) => id.split(".")[0];

export const podcastUrl = (dayId: string) =>
  `/podcasts/day-${dayId.replace("D", "")}.txt`;

export function getEpisodeText(source: string, lessonId: string) {
  const marker = new RegExp(`\\nEPISODE ${lessonId} —[^\\n]*\\n`);
  const match = source.match(marker);
  if (!match || match.index === undefined) return "";
  const start = match.index + match[0].length;
  const rest = source.slice(start);
  const next = rest.search(/\\nEPISODE D\\d+\\.\\d+ —/);
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
    /(mac lab|mac exercise|run (that|the) command|run the command|lab:|hands-on)/i.test(
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
      const m = x.match(/^Speaker ([AB]):\s*([\s\S]*)$/);
      if (!m) {
        return {
          id: `${lessonId}.T${String(index + 1).padStart(3, "0")}`,
          speaker: "A",
          text: x,
          kind: classifyTurn(x)
        };
      }

      return {
        id: `${lessonId}.T${String(index + 1).padStart(3, "0")}`,
        speaker: m[1] as "A" | "B",
        text: m[2].trim(),
        kind: classifyTurn(m[2])
      };
    });
}
