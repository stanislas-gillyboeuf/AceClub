import type { Sport } from "@/types/common";

export interface SkillLevel {
  value: string;
  displayName: string;
}

export const tennisLevels: SkillLevel[] = [
  { value: "NC", displayName: "NC" },
  { value: "40", displayName: "40" },
  { value: "30/5", displayName: "30/5" },
  { value: "30/4", displayName: "30/4" },
  { value: "30/3", displayName: "30/3" },
  { value: "30/2", displayName: "30/2" },
  { value: "30/1", displayName: "30/1" },
  { value: "30", displayName: "30" },
  { value: "15/5", displayName: "15/5" },
  { value: "15/4", displayName: "15/4" },
  { value: "15/3", displayName: "15/3" },
  { value: "15/2", displayName: "15/2" },
  { value: "15/1", displayName: "15/1" },
  { value: "15", displayName: "15" },
  { value: "5/6", displayName: "5/6" },
  { value: "4/6", displayName: "4/6" },
  { value: "3/6", displayName: "3/6" },
  { value: "2/6", displayName: "2/6" },
  { value: "1/6", displayName: "1/6" },
  { value: "0", displayName: "0" },
  { value: "-2/6", displayName: "-2/6" },
  { value: "-4/6", displayName: "-4/6" },
  { value: "Négatif", displayName: "Négatif" },
];

export const padelLevels: SkillLevel[] = Array.from({ length: 10 }, (_, i) => {
  const value = String(i + 1);
  return { value, displayName: value };
});

export function getSkillLevels(sport: Sport): SkillLevel[] {
  return sport === "tennis" ? tennisLevels : padelLevels;
}

export function getSkillLevelDisplayName(value: string, sport: Sport): string | null {
  const levels = getSkillLevels(sport);
  return levels.find((l) => l.value === value)?.displayName ?? null;
}

/** Tolerant formatter for a user's tennis/padel ranking ("classement"). Returns null if unknown. */
export function formatSkillLevel(value?: string | null, sport?: string | null): string | null {
  if (!value) return null;
  if (sport === "tennis" || sport === "padel") {
    return getSkillLevelDisplayName(value, sport) ?? value;
  }
  return value;
}
