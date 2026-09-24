import type { TarifCondition, TarifGridSnapshot } from "./engine";

/**
 * Pure household-rank logic — no I/O, no Drizzle. The pricing adapter feeds it each member's
 * "price without any family discount" and it decides who is 1st, 2nd, 3rd... of the household, so
 * the most expensive member pays full price and the cheaper ones get the family reductions.
 */

function hasHouseholdCondition(conditions: TarifCondition[]): boolean {
  return conditions.some((c) => c.type === "household_rank");
}

/**
 * Returns a copy of the grid without anything that depends on the household rank: rules and
 * additional lines carrying a `household_rank` condition (and rules that targeted a removed
 * additional line). Computing a member with this grid and `householdRank: 1` gives their price
 * "without family discount" independently of the rank — which is what breaks the circularity
 * (the rank is derived from that price).
 */
export function stripHouseholdRules(grid: TarifGridSnapshot): TarifGridSnapshot {
  const additionalLines = grid.additionalLines.filter((l) => !hasHouseholdCondition(l.conditions));
  const keptLineIds = new Set(additionalLines.map((l) => l.id));
  const rules = grid.rules.filter(
    (r) =>
      !hasHouseholdCondition(r.conditions) &&
      !(r.targetType === "additional_line" && r.targetAdditionalLineId && !keptLineIds.has(r.targetAdditionalLineId)),
  );
  return { ...grid, additionalLines, rules };
}

export type HouseholdRankSource = "override" | "frozen" | "computed";

export interface HouseholdRankInput {
  userId: string;
  householdId: string | null;
  /** Effective adherent: only adherents are ranked (a coach parent must not shift the children). */
  counted: boolean;
  /** Price without family discount in cents, or null when it cannot be determined. */
  priceCents: number | null;
  /** "YYYY-MM-DD" — the older member goes first on equal prices. */
  birthDate?: string;
  /** Manual override (`clubMemberProfile.householdRank`), wins over everything. */
  override: number | null;
  /** Rank saved on an already-issued cotisation of the season, kept as-is. */
  frozen: number | null;
}

export interface HouseholdRankResult {
  /** null = no rank could be decided (price unknown): the engine will report it as missing. */
  rank: number | null;
  source: HouseholdRankSource | null;
}

/**
 * Ranks:
 * - a manual override always wins (and is removed from the free ranks of its household);
 * - ranks already frozen on an issued cotisation are kept, so a sibling joining later never
 *   reshuffles them;
 * - remaining counted members with a known price are sorted by price desc, then birth date asc
 *   (older first), then userId, and take the smallest free ranks;
 * - a counted member with an unknown price gets no rank (nothing invented, nothing frozen);
 * - a member without household is alone: rank 1; a non-adherent takes no rank slot (rank 1, no
 *   source) so they never shift a sibling.
 */
export function computeHouseholdRanks(members: HouseholdRankInput[]): Map<string, HouseholdRankResult> {
  const results = new Map<string, HouseholdRankResult>();
  const byHousehold = new Map<string, HouseholdRankInput[]>();
  const addToGroup = (m: HouseholdRankInput) => {
    const group = byHousehold.get(m.householdId as string) ?? [];
    group.push(m);
    byHousehold.set(m.householdId as string, group);
  };

  for (const m of members) {
    if (m.override !== null) {
      results.set(m.userId, { rank: m.override, source: "override" });
      if (m.householdId) addToGroup(m); // its rank must be removed from its household's free ranks
    } else if (!m.householdId) {
      results.set(m.userId, { rank: 1, source: m.counted ? "computed" : null });
    } else if (!m.counted) {
      results.set(m.userId, { rank: 1, source: null }); // takes no slot in the ranking
    } else {
      addToGroup(m);
    }
  }

  for (const group of byHousehold.values()) {
    const taken = new Set<number>();
    for (const m of group) {
      if (m.override !== null) taken.add(m.override);
    }
    const candidates: HouseholdRankInput[] = [];
    for (const m of group) {
      if (m.override !== null) continue;
      if (m.frozen !== null) {
        results.set(m.userId, { rank: m.frozen, source: "frozen" });
        taken.add(m.frozen);
      } else if (m.priceCents !== null) {
        candidates.push(m);
      } else {
        results.set(m.userId, { rank: null, source: null });
      }
    }

    candidates.sort((a, b) => {
      if (a.priceCents !== b.priceCents) return (b.priceCents as number) - (a.priceCents as number);
      if (a.birthDate !== b.birthDate) {
        if (a.birthDate === undefined) return 1;
        if (b.birthDate === undefined) return -1;
        return a.birthDate < b.birthDate ? -1 : 1;
      }
      return a.userId < b.userId ? -1 : a.userId > b.userId ? 1 : 0;
    });

    let next = 1;
    for (const m of candidates) {
      while (taken.has(next)) next++;
      results.set(m.userId, { rank: next, source: "computed" });
      taken.add(next);
    }
  }

  return results;
}
