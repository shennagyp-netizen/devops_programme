import type {
  AssessmentBlueprint,
  AssessmentItem,
  DifficultyBand
} from "../data/assessment";

export type AssessmentForm = {
  formId: string;
  blueprint: AssessmentBlueprint;
  items: AssessmentItem[];
};

const bands: DifficultyBand[] = [
  "foundation",
  "applied",
  "difficult",
  "challenge"
];

function stableScore(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function targetCounts(
  total: number,
  mix: AssessmentBlueprint["targetDifficultyMix"]
) {
  const raw = bands.map((band) => ({
    band,
    raw: total * mix[band],
    count: Math.floor(total * mix[band])
  }));

  let remaining = total - raw.reduce((sum, item) => sum + item.count, 0);

  raw
    .sort((a, b) => b.raw - b.count - (a.raw - a.count))
    .forEach((item) => {
      if (remaining > 0) {
        item.count += 1;
        remaining -= 1;
      }
    });

  return Object.fromEntries(raw.map((item) => [item.band, item.count])) as Record<
    DifficultyBand,
    number
  >;
}

function validatePool(
  blueprint: AssessmentBlueprint,
  items: AssessmentItem[]
) {
  const pool = items.filter(
    (item) =>
      item.sectionId === blueprint.sectionId &&
      item.family === blueprint.family
  );

  const counts = new Map<DifficultyBand, number>();
  for (const band of bands) {
    counts.set(
      band,
      pool.filter((item) => item.difficulty === band).length
    );
  }

  const targets = targetCounts(blueprint.targetItemCount, blueprint.targetDifficultyMix);

  for (const band of bands) {
    if ((counts.get(band) ?? 0) < targets[band]) {
      throw new Error(
        `Not enough ${band} items for ${blueprint.courseId}/${blueprint.sectionId}/${blueprint.family}: need ${targets[band]}, have ${counts.get(band) ?? 0}.`
      );
    }
  }

  for (const competency of blueprint.minimumCompetencies) {
    if (!pool.some((item) => item.competencyId === competency)) {
      throw new Error(
        `Assessment pool is missing competency ${competency}.`
      );
    }
  }

  return pool;
}

export function generateAssessmentForm(
  blueprint: AssessmentBlueprint,
  itemPool: AssessmentItem[],
  seed: string
): AssessmentForm {
  const pool = validatePool(blueprint, itemPool);
  const targets = targetCounts(
    blueprint.targetItemCount,
    blueprint.targetDifficultyMix
  );

  const selected: AssessmentItem[] = [];

  for (const band of bands) {
    const candidates = pool
      .filter((item) => item.difficulty === band)
      .sort((a, b) =>
        stableScore(`${seed}:${a.id}`) - stableScore(`${seed}:${b.id}`)
      );

    selected.push(...candidates.slice(0, targets[band]));
  }

  for (const competency of blueprint.minimumCompetencies) {
    const covered = selected.some((item) => item.competencyId === competency);
    if (!covered) {
      throw new Error(
        `Generated form does not cover required competency ${competency}.`
      );
    }
  }

  const totalMinutes = selected.reduce(
    (sum, item) => sum + item.expectedMinutes,
    0
  );
  const allowedMinutes = blueprint.expectedMinutes * 1.25;

  if (totalMinutes > allowedMinutes) {
    throw new Error(
      `Generated form is too long: ${totalMinutes} minutes vs allowed ${Math.round(
        allowedMinutes
      )}.`
    );
  }

  return {
    formId: `${blueprint.courseId}-${blueprint.sectionId}-${blueprint.family}-${seed}`,
    blueprint,
    items: selected
  };
}
