/**
 * Mirrors TENNIS_LEVELS / PADEL_LEVELS / LEGACY_PADEL_LEVELS from
 * services/api/server/user/validators.ts — kept in sync manually rather than importing from
 * that file, to avoid coupling this feature's schema knowledge into a shared validators file
 * it doesn't otherwise depend on (same approach already taken in tournament/lib/skill-order.ts).
 * If those scales change, update both places.
 */
export const TENNIS_LEVELS = [
  "Négatif",
  "-4/6",
  "-2/6",
  "0",
  "1/6",
  "2/6",
  "3/6",
  "4/6",
  "5/6",
  "15",
  "15/1",
  "15/2",
  "15/3",
  "15/4",
  "15/5",
  "30",
  "30/1",
  "30/2",
  "30/3",
  "30/4",
  "30/5",
  "40",
  "NC",
] as const;

export const PADEL_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
const LEGACY_PADEL_LEVELS = ["Débutant", "Intermédiaire", "Avancé", "Expert"] as const;

export function getBuiltinLevels(sport: "tennis" | "padel"): readonly string[] {
  return sport === "tennis" ? TENNIS_LEVELS : PADEL_LEVELS;
}

export function isBuiltinLevel(sport: "tennis" | "padel", value: string): boolean {
  if (sport === "tennis") return (TENNIS_LEVELS as readonly string[]).includes(value);
  return (
    (PADEL_LEVELS as readonly string[]).includes(value) ||
    (LEGACY_PADEL_LEVELS as readonly string[]).includes(value)
  );
}
