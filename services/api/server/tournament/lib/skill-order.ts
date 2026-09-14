/**
 * Mirrors TENNIS_LEVELS / PADEL_LEVELS / LEGACY_PADEL_LEVELS from
 * services/api/server/user/validators.ts — kept in sync manually rather than importing from
 * that file, to avoid coupling this feature's schema knowledge into a shared validators file
 * it doesn't otherwise depend on. If those scales change, update both places.
 *
 * TENNIS_LEVELS is ordered strongest → weakest (real FFT ranking order: "Négatif" is the best
 * classification, "NC" — non classé — is unrated/weakest). PADEL_LEVELS is ordered weakest →
 * strongest (1 = beginner, 10 = expert; confirmed by scripts/migrate-padel-levels.ts, which
 * mapped legacy Débutant→"2" ... Expert→"9").
 */
const TENNIS_LEVELS = [
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

const PADEL_LEVELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;
const LEGACY_PADEL_LEVELS: Record<string, string> = {
  Débutant: "2",
  Intermédiaire: "5",
  Avancé: "7",
  Expert: "9",
};

/** Higher = stronger player. Unrated or unrecognized values sort last (weakest). */
export function getSkillRank(sport: "tennis" | "padel", skillLevel: string | null): number {
  if (!skillLevel) return -1;

  if (sport === "tennis") {
    const index = (TENNIS_LEVELS as readonly string[]).indexOf(skillLevel);
    return index === -1 ? -1 : TENNIS_LEVELS.length - 1 - index;
  }

  const normalized = LEGACY_PADEL_LEVELS[skillLevel] ?? skillLevel;
  const numeric = (PADEL_LEVELS as readonly string[]).includes(normalized)
    ? Number(normalized)
    : -1;
  return numeric;
}

/** For sorting strongest-first (seed 1 = strongest). */
export function compareSkillLevelDesc(
  sport: "tennis" | "padel",
  a: string | null,
  b: string | null,
): number {
  return getSkillRank(sport, b) - getSkillRank(sport, a);
}
