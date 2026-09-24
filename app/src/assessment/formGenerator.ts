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

  const targets = targetCounts(
    blueprint.targetItemCount,
    blueprint.targetDifficultyMix
  );

  const counts = new Map<DifficultyBand, number>();
  for (const band of bands) {
    counts.set(
      band,
      pool.filter((item) => item.difficulty === band).length
    );
  }

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

  for (const cognitiveLevel of blueprint.requiredCognitiveLevels) {
    if (!pool.some((item) => item.cognitiveLevel === cognitiveLevel)) {
      throw new Error(
        `Assessment pool is missing cognitive level ${cognitiveLevel}.`
      );
    }
  }

  return pool;
}

function candidateOrder(items: AssessmentItem[], seed: string) {
  return [...items].sort((a, b) =>
    stableScore(`${seed}:${a.id}`) - stableScore(`${seed}:${b.id}`)
  );
}

export function generateAssessmentForm(
  blueprint: AssessmentBlueprint,
  itemPool: AssessmentItem[],
  seed: string
): AssessmentForm {
  const pool = validatePool(blueprint, itemPool);
  const remainingTargets = targetCounts(
    blueprint.targetItemCount,
    blueprint.targetDifficultyMix
  );
  const ordered = candidateOrder(pool, seed);
  const selected: AssessmentItem[] = [];
  const selectedIds = new Set<string>();

  const addCandidate = (item: AssessmentItem) => {
    if (selectedIds.has(item.id)) return false;
    if (remainingTargets[item.difficulty] <= 0) return false;

    selected.push(item);
    selectedIds.add(item.id);
    remainingTargets[item.difficulty] -= 1;
    return true;
  };

  // Cover scarce requirements first. This avoids a valid pool becoming
  // seed-dependent just because an early requirement consumed the only
  // remaining item in a needed difficulty band.
  const competencyRequirements = blueprint.minimumCompetencies.map((competency) => ({
    kind: "competency" as const,
    value: competency,
    candidates: ordered.filter((item) => item.competencyId === competency)
  }));
  const cognitiveRequirements = blueprint.requiredCognitiveLevels.map((level) => ({
    kind: "cognitive" as const,
    value: level,
    candidates: ordered.filter((item) => item.cognitiveLevel === level)
  }));

  const requirements = [...competencyRequirements, ...cognitiveRequirements]
    .sort((a, b) => a.candidates.length - b.candidates.length);

  for (const requirement of requirements) {
    const candidate = requirement.candidates.find(
      (item) =>
        !selectedIds.has(item.id) &&
        remainingTargets[item.difficulty] > 0
    );

    if (!candidate || !addCandidate(candidate)) {
      throw new Error(
        `Cannot cover ${requirement.kind} ${requirement.value} while preserving the difficulty blueprint.`
      );
    }
  }

  for (const band of bands) {
    for (const candidate of ordered) {
      if (remainingTargets[band] <= 0) break;
      if (candidate.difficulty !== band || selectedIds.has(candidate.id)) continue;
      addCandidate(candidate);
    }
  }

  if (selected.length !== blueprint.targetItemCount) {
    throw new Error(
      `Generated form has ${selected.length} items; expected ${blueprint.targetItemCount}.`
    );
  }

  for (const competency of blueprint.minimumCompetencies) {
    if (!selected.some((item) => item.competencyId === competency)) {
      throw new Error(
        `Generated form does not cover required competency ${competency}.`
      );
    }
  }

  for (const cognitiveLevel of blueprint.requiredCognitiveLevels) {
    if (!selected.some((item) => item.cognitiveLevel === cognitiveLevel)) {
      throw new Error(
        `Generated form does not cover required cognitive level ${cognitiveLevel}.`
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
