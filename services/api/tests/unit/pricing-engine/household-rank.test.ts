import { describe, expect, it } from "vitest";
import { computeCotisation } from "../../../server/pricing/lib/engine";
import type { TarifGridSnapshot, RuleSnapshot, AdditionalLineSnapshot } from "../../../server/pricing/lib/engine";
import {
  computeHouseholdRanks,
  stripHouseholdRules,
  type HouseholdRankInput,
} from "../../../server/pricing/lib/household-rank";

function input(overrides: Partial<HouseholdRankInput> & { userId: string }): HouseholdRankInput {
  return {
    householdId: "h1",
    counted: true,
    priceCents: 10000,
    birthDate: "2010-01-01",
    override: null,
    frozen: null,
    ...overrides,
  };
}

function rank(results: ReturnType<typeof computeHouseholdRanks>, userId: string) {
  return results.get(userId);
}

describe("computeHouseholdRanks", () => {
  it("gives rank 1 to the most expensive member and the next ranks in descending price order", () => {
    const res = computeHouseholdRanks([
      input({ userId: "cheap", priceCents: 9000 }),
      input({ userId: "dear", priceCents: 30000 }),
      input({ userId: "mid", priceCents: 20000 }),
    ]);
    expect(rank(res, "dear")).toEqual({ rank: 1, source: "computed" });
    expect(rank(res, "mid")).toEqual({ rank: 2, source: "computed" });
    expect(rank(res, "cheap")).toEqual({ rank: 3, source: "computed" });
  });

  it("breaks price ties by age (older first), then by userId", () => {
    const res = computeHouseholdRanks([
      input({ userId: "young", priceCents: 10000, birthDate: "2015-05-05" }),
      input({ userId: "old", priceCents: 10000, birthDate: "2008-05-05" }),
      input({ userId: "b", priceCents: 10000, birthDate: "2012-01-01" }),
      input({ userId: "a", priceCents: 10000, birthDate: "2012-01-01" }),
    ]);
    expect(rank(res, "old")?.rank).toBe(1);
    expect(rank(res, "a")?.rank).toBe(2);
    expect(rank(res, "b")?.rank).toBe(3);
    expect(rank(res, "young")?.rank).toBe(4);
  });

  it("puts a member without birth date after the others on equal prices", () => {
    const res = computeHouseholdRanks([
      input({ userId: "nodate", priceCents: 10000, birthDate: undefined }),
      input({ userId: "dated", priceCents: 10000, birthDate: "2010-01-01" }),
    ]);
    expect(rank(res, "dated")?.rank).toBe(1);
    expect(rank(res, "nodate")?.rank).toBe(2);
  });

  it("keeps frozen ranks and gives a newcomer the next free rank, even if more expensive", () => {
    const res = computeHouseholdRanks([
      input({ userId: "first", priceCents: 20000, frozen: 1 }),
      input({ userId: "second", priceCents: 15000, frozen: 2 }),
      input({ userId: "newcomer", priceCents: 90000 }),
    ]);
    expect(rank(res, "first")).toEqual({ rank: 1, source: "frozen" });
    expect(rank(res, "second")).toEqual({ rank: 2, source: "frozen" });
    expect(rank(res, "newcomer")).toEqual({ rank: 3, source: "computed" });
  });

  it("fills the smallest free rank when a frozen rank leaves a gap", () => {
    const res = computeHouseholdRanks([
      input({ userId: "kept", frozen: 2 }),
      input({ userId: "new", priceCents: 5000 }),
    ]);
    expect(rank(res, "new")).toEqual({ rank: 1, source: "computed" });
  });

  it("lets a manual override win and removes it from the free ranks", () => {
    const res = computeHouseholdRanks([
      input({ userId: "forced", priceCents: 1000, override: 1 }),
      input({ userId: "dear", priceCents: 30000 }),
      input({ userId: "mid", priceCents: 20000 }),
    ]);
    expect(rank(res, "forced")).toEqual({ rank: 1, source: "override" });
    expect(rank(res, "dear")).toEqual({ rank: 2, source: "computed" });
    expect(rank(res, "mid")).toEqual({ rank: 3, source: "computed" });
  });

  it("an override beats a frozen rank on the same member", () => {
    const res = computeHouseholdRanks([input({ userId: "x", override: 4, frozen: 1 })]);
    expect(rank(res, "x")).toEqual({ rank: 4, source: "override" });
  });

  it("excludes non-adherents from the ranking so they never shift a sibling", () => {
    const res = computeHouseholdRanks([
      input({ userId: "coachParent", counted: false, priceCents: null }),
      input({ userId: "kid1", priceCents: 20000 }),
      input({ userId: "kid2", priceCents: 10000 }),
    ]);
    expect(rank(res, "kid1")?.rank).toBe(1);
    expect(rank(res, "kid2")?.rank).toBe(2);
    expect(rank(res, "coachParent")).toEqual({ rank: 1, source: null });
  });

  it("does not rank a member whose price is unknown (and takes no slot)", () => {
    const res = computeHouseholdRanks([
      input({ userId: "unknown", priceCents: null }),
      input({ userId: "known", priceCents: 10000 }),
    ]);
    expect(rank(res, "unknown")).toEqual({ rank: null, source: null });
    expect(rank(res, "known")).toEqual({ rank: 1, source: "computed" });
  });

  it("treats a member without household as alone: rank 1", () => {
    const res = computeHouseholdRanks([
      input({ userId: "solo", householdId: null, priceCents: null }),
      input({ userId: "soloNonAdherent", householdId: null, counted: false }),
    ]);
    expect(rank(res, "solo")).toEqual({ rank: 1, source: "computed" });
    expect(rank(res, "soloNonAdherent")).toEqual({ rank: 1, source: null });
  });

  it("ranks households independently", () => {
    const res = computeHouseholdRanks([
      input({ userId: "a1", householdId: "hA", priceCents: 10000 }),
      input({ userId: "b1", householdId: "hB", priceCents: 5000 }),
      input({ userId: "a2", householdId: "hA", priceCents: 4000 }),
    ]);
    expect(rank(res, "a1")?.rank).toBe(1);
    expect(rank(res, "a2")?.rank).toBe(2);
    expect(rank(res, "b1")?.rank).toBe(1);
  });

  it("handles a single-member household", () => {
    const res = computeHouseholdRanks([input({ userId: "only", priceCents: 12000 })]);
    expect(rank(res, "only")).toEqual({ rank: 1, source: "computed" });
  });
});

function baseGrid(): TarifGridSnapshot {
  return {
    ageReferenceMode: "season_start",
    cumulMode: "cumulative",
    reductionCapPercent: null,
    roundingIncrement: "none",
    seasonStartDate: "2026-09-01",
    seasonEndDate: "2027-08-31",
    ageCategories: [{ id: "adult", name: "Adulte", minAge: 18, maxAge: null, sortOrder: 0 }],
    baseRates: [{ categoryId: "adult", membershipFeeCents: 15000, licenseFeeCents: 0 }],
    lessonRates: [],
    additionalLines: [],
    rules: [],
  };
}

function rule(overrides: Partial<RuleSnapshot> & { id: string }): RuleSnapshot {
  return {
    name: overrides.id,
    conditions: [],
    effectType: "percent_discount",
    effectValue: 1000,
    targetType: "membership",
    targetAdditionalLineId: null,
    exclusivityGroup: null,
    isActive: true,
    sortOrder: 0,
    ...overrides,
  };
}

function line(overrides: Partial<AdditionalLineSnapshot> & { id: string }): AdditionalLineSnapshot {
  return { name: overrides.id, amountCents: 1000, conditions: [], isActive: true, sortOrder: 0, ...overrides };
}

describe("stripHouseholdRules", () => {
  const family = rule({ id: "family2", conditions: [{ type: "household_rank", minRank: 2, maxRank: 2 }] });
  const student = rule({ id: "student", conditions: [{ type: "tag", tagIds: ["etu"] }] });

  it("removes rules and additional lines that depend on the household rank, keeps the others", () => {
    const grid = baseGrid();
    grid.rules = [family, student];
    grid.additionalLines = [
      line({ id: "thirdChildFee", conditions: [{ type: "household_rank", minRank: 3 }] }),
      line({ id: "badge" }),
    ];
    const stripped = stripHouseholdRules(grid);
    expect(stripped.rules.map((r) => r.id)).toEqual(["student"]);
    expect(stripped.additionalLines.map((l) => l.id)).toEqual(["badge"]);
    expect(grid.rules).toHaveLength(2); // input not mutated
  });

  it("drops rules that targeted a removed additional line", () => {
    const grid = baseGrid();
    grid.additionalLines = [line({ id: "famLine", conditions: [{ type: "household_rank", minRank: 2 }] })];
    grid.rules = [rule({ id: "onLine", targetType: "additional_line", targetAdditionalLineId: "famLine" })];
    expect(stripHouseholdRules(grid).rules).toEqual([]);
  });

  it("keeps a rule when only another condition mentions nothing about the household", () => {
    const grid = baseGrid();
    grid.rules = [student];
    expect(stripHouseholdRules(grid).rules).toHaveLength(1);
  });

  it("gives the same price without family discount whatever the rank", () => {
    const grid = baseGrid();
    grid.rules = [family];
    const profile = { birthDate: "1990-01-01", licensedElsewhere: true, lessonsPerWeek: 0, tags: [] };
    const stripped = stripHouseholdRules(grid);
    const results = [1, 2, 3].map((householdRank) => {
      const b = computeCotisation(stripped, { ...profile, householdRank });
      return b.status === "complete" ? b.totalCents : null;
    });
    expect(results).toEqual([15000, 15000, 15000]);
    // ...whereas the full grid does discount the 2nd member.
    const withRank2 = computeCotisation(grid, { ...profile, householdRank: 2 });
    expect(withRank2.status === "complete" && withRank2.totalCents).toBe(13500);
  });
});
