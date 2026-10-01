import { tennisLevels, type SkillLevel } from "@/lib/skill-levels";

export interface FftGroup {
  key: string;
  label: string;
  levels: SkillLevel[];
}

function levelsFor(values: string[]): SkillLevel[] {
  return values
    .map((v) => tennisLevels.find((l) => l.value === v))
    .filter((l): l is SkillLevel => !!l);
}

/**
 * Partitions the 23 existing tennisLevels (apps/mobile/lib/skill-levels.ts) into the 4 groups
 * shown under "Je suis classé(e)". No new values — matches the backend's TENNIS_LEVELS exactly
 * (no "Promotion"/"1re série"/"-15").
 */
export const fftGroups: FftGroup[] = [
  { key: "nc", label: "Non classé", levels: levelsFor(["NC"]) },
  {
    key: "4e-serie",
    label: "4e série",
    levels: levelsFor(["40", "30/5", "30/4", "30/3", "30/2", "30/1"]),
  },
  {
    key: "3e-serie",
    label: "3e série",
    levels: levelsFor(["30", "15/5", "15/4", "15/3", "15/2", "15/1"]),
  },
  {
    key: "2e-serie",
    label: "2e série",
    levels: levelsFor(["15", "5/6", "4/6", "3/6", "2/6", "1/6", "0", "-2/6", "-4/6", "Négatif"]),
  },
];
