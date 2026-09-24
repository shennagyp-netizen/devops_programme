import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const itemRoot = path.join(root, "exams", "items");

const required = {
  conceptual: { foundation: 3, applied: 7, difficult: 7, challenge: 3 },
  diagnostic: { foundation: 2, applied: 4, difficult: 4, challenge: 2 },
  "hands-on": { foundation: 1, applied: 3, difficult: 3, challenge: 1 }
};

const familyRules = {
  conceptual: {
    targetItems: 20,
    targetMinutes: 60,
    cognitiveLevels: ["mechanism", "application", "diagnosis", "design"],
    competencySuffix: "core"
  },
  diagnostic: {
    targetItems: 12,
    targetMinutes: 45,
    cognitiveLevels: ["application", "diagnosis", "design"],
    competencySuffix: "diagnostic"
  },
  "hands-on": {
    targetItems: 8,
    targetMinutes: 90,
    cognitiveLevels: ["application", "diagnosis", "design"],
    competencySuffix: "hands-on"
  }
};

const itemFields = [
  "id",
  "family",
  "difficulty",
  "cognitiveLevel",
  "itemType",
  "expectedMinutes",
  "competencyId",
  "prompt"
];

const handsOnFields = [
  "environment",
  "initialState",
  "allowedOperations",
  "success",
  "evidence",
  "failureConditions",
  "recoveryRequirements",
  "resetStrategy"
];

async function filesIn(dir, relative = "") {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => []);
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;

    const rel = path.join(relative, entry.name);
    const abs = path.join(dir, entry.name);

    if (entry.isDirectory()) files.push(...(await filesIn(abs, rel)));
    else if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push({ abs, rel });
    }
  }

  return files;
}

function targetCounts(total) {
  const bands = Object.entries(
    total === 20 ? required.conceptual : total === 12 ? required.diagnostic : required["hands-on"]
  );
  return Object.fromEntries(bands);
}

const files = await filesIn(itemRoot);
let failed = false;
const globalIds = new Map();

for (const file of files) {
  let data;
  try {
    data = JSON.parse(await readFile(file.abs, "utf8"));
  } catch (error) {
    failed = true;
    console.error(`${file.rel}: invalid JSON: ${error.message}`);
    continue;
  }

  const items = Array.isArray(data.items) ? data.items : [];
  const pilot = data.purpose?.includes("Not yet a certification pool");

  if (!items.length) {
    failed = true;
    console.error(`${file.rel}: item bank is empty`);
    continue;
  }

  for (const item of items) {
    for (const field of itemFields) {
      if (item[field] === undefined || item[field] === null || item[field] === "") {
        failed = true;
        console.error(`${file.rel}: item ${item.id ?? "<unknown>"} is missing ${field}`);
      }
    }

    const previous = globalIds.get(item.id);
    if (previous) {
      failed = true;
      console.error(`${file.rel}: duplicate item id ${item.id}; already used in ${previous}`);
    } else {
      globalIds.set(item.id, file.rel);
    }

    if (!familyRules[item.family]) {
      failed = true;
      console.error(`${file.rel}: item ${item.id} has unknown family ${item.family}`);
      continue;
    }

    const validItemType =
      (typeof item.itemType === "string" && item.itemType.trim().length > 0) ||
      (Array.isArray(item.itemType) &&
        item.itemType.length > 0 &&
        item.itemType.every(
          (value) => typeof value === "string" && value.trim().length > 0
        ));

    if (!validItemType) {
      failed = true;
      console.error(
        `${file.rel}: item ${item.id} has invalid itemType; expected a non-empty string or non-empty string array`
      );
    }

    if (item.expectedMinutes <= 0) {
      failed = true;
      console.error(`${file.rel}: item ${item.id} has non-positive expectedMinutes`);
    }

    if (item.family === "hands-on") {
      for (const field of handsOnFields) {
        if (!Array.isArray(item[field]) && field !== "initialState" && field !== "resetStrategy") {
          failed = true;
          console.error(`${file.rel}: hands-on item ${item.id} has invalid ${field}`);
        }
        if ((field === "initialState" || field === "resetStrategy") && typeof item[field] !== "string") {
          failed = true;
          console.error(`${file.rel}: hands-on item ${item.id} has invalid ${field}`);
        }
      }
    }
  }

  if (!pilot) {
    for (const [family, bands] of Object.entries(required)) {
      for (const [band, minimum] of Object.entries(bands)) {
        const count = items.filter(
          (item) => item.family === family && item.difficulty === band
        ).length;

        if (count < minimum) {
          failed = true;
          console.error(
            `${file.rel}: ${family}/${band} has ${count}; needs at least ${minimum}`
          );
        }
      }
    }
    continue;
  }

  // Pilot banks are checked against the exact form blueprint too.
  for (const [family, rule] of Object.entries(familyRules)) {
    const familyItems = items.filter((item) => item.family === family);
    const targets = targetCounts(rule.targetItems);

    for (const [band, minimum] of Object.entries(targets)) {
      const count = familyItems.filter((item) => item.difficulty === band).length;
      if (count < minimum) {
        failed = true;
        console.error(
          `${file.rel}: pilot ${family}/${band} has ${count}; needs at least ${minimum}`
        );
      }
    }

    for (const level of rule.cognitiveLevels) {
      if (!familyItems.some((item) => item.cognitiveLevel === level)) {
        failed = true;
        console.error(
          `${file.rel}: pilot ${family} is missing cognitive level ${level}`
        );
      }
    }

    const expectedCompetency = `${data.sectionId}.${rule.competencySuffix}`;
    if (!familyItems.some((item) => item.competencyId === expectedCompetency)) {
      failed = true;
      console.error(
        `${file.rel}: pilot ${family} is missing competency ${expectedCompetency}`
      );
    }

    const selectedBudget = [];
    // Check the worst-case time, not the shortest possible form. A valid pool
    // must let every deterministic seed stay inside the declared time limit.
    for (const band of Object.keys(targets)) {
      const longest = familyItems
        .filter((item) => item.difficulty === band)
        .sort((a, b) => b.expectedMinutes - a.expectedMinutes)
        .slice(0, targets[band]);
      selectedBudget.push(...longest);
    }

    const totalMinutes = selectedBudget.reduce(
      (sum, item) => sum + item.expectedMinutes,
      0
    );
    const allowedMinutes = rule.targetMinutes * 1.25;

    if (selectedBudget.length !== rule.targetItems || totalMinutes > allowedMinutes) {
      failed = true;
      console.error(
        `${file.rel}: pilot ${family} cannot satisfy item/time budget: ${selectedBudget.length} items, ${totalMinutes} minutes, allowed ${allowedMinutes}`
      );
    }
  }
}

if (failed) {
  process.exit(1);
}

console.log(
  `Assessment item-bank check passed for ${files.length} bank file(s) and ${globalIds.size} unique item(s).`
);
