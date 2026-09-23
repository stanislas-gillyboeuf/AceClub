import type { AgeCategorySnapshot, TarifGridSnapshot } from "./types";

interface IsoDateParts {
  year: number;
  month: number; // 1-12
  day: number;
}

function parseIsoDate(iso: string): IsoDateParts {
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

/**
 * The age reference date, per the grid's configured mode:
 * - season_start: the season's start date itself
 * - dec_31_start_year: Dec 31 of the season's start-date year
 * - season_end_year: Dec 31 of the season's end-date year (the "vintage" — the age the member
 *   reaches at some point during that calendar year)
 * Uses UTC throughout so the calculation never depends on the machine's local timezone.
 */
export function resolveReferenceDate(
  grid: Pick<TarifGridSnapshot, "ageReferenceMode" | "seasonStartDate" | "seasonEndDate">,
): Date {
  switch (grid.ageReferenceMode) {
    case "season_start": {
      const { year, month, day } = parseIsoDate(grid.seasonStartDate);
      return new Date(Date.UTC(year, month - 1, day));
    }
    case "dec_31_start_year": {
      const { year } = parseIsoDate(grid.seasonStartDate);
      return new Date(Date.UTC(year, 11, 31));
    }
    case "season_end_year": {
      const { year } = parseIsoDate(grid.seasonEndDate);
      return new Date(Date.UTC(year, 11, 31));
    }
  }
}

function calculateAgeAtDate(birthDateIso: string, referenceDate: Date): number {
  const birth = parseIsoDate(birthDateIso);
  const refYear = referenceDate.getUTCFullYear();
  const refMonth = referenceDate.getUTCMonth() + 1;
  const refDay = referenceDate.getUTCDate();

  let age = refYear - birth.year;
  if (refMonth < birth.month || (refMonth === birth.month && refDay < birth.day)) {
    age -= 1;
  }
  return age;
}

export type ResolveAgeCategoryResult =
  | { category: AgeCategorySnapshot; age: number }
  | { error: "no_matching_category"; age: number };

/**
 * Finds the age category matching the member's age at the grid's reference date.
 * Returns an explicit error (never throws, never silently picks a category) when the grid's
 * age categories have a gap — that's a grid configuration problem, not a missing-profile-data
 * problem, so it is NOT reported via Breakdown.missingFields.
 */
export function resolveAgeCategory(grid: TarifGridSnapshot, birthDate: string): ResolveAgeCategoryResult {
  const referenceDate = resolveReferenceDate(grid);
  const age = calculateAgeAtDate(birthDate, referenceDate);
  const category = grid.ageCategories.find((c) => age >= c.minAge && (c.maxAge === null || age <= c.maxAge));
  if (!category) {
    return { error: "no_matching_category", age };
  }
  return { category, age };
}
