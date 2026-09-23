import { describe, it, expect } from "vitest";
import { resolveAgeCategory, resolveReferenceDate } from "../../../server/pricing/lib/engine";
import type { TarifGridSnapshot } from "../../../server/pricing/lib/engine";

const gridBase = {
  seasonStartDate: "2026-09-01",
  seasonEndDate: "2027-08-31",
};

describe("resolveReferenceDate", () => {
  it("season_start -> the season's start date itself", () => {
    const date = resolveReferenceDate({ ...gridBase, ageReferenceMode: "season_start" });
    expect(date.toISOString().slice(0, 10)).toBe("2026-09-01");
  });

  it("dec_31_start_year -> Dec 31 of the season's start-date year", () => {
    const date = resolveReferenceDate({ ...gridBase, ageReferenceMode: "dec_31_start_year" });
    expect(date.toISOString().slice(0, 10)).toBe("2026-12-31");
  });

  it("season_end_year -> Dec 31 of the season's end-date year", () => {
    const date = resolveReferenceDate({ ...gridBase, ageReferenceMode: "season_end_year" });
    expect(date.toISOString().slice(0, 10)).toBe("2027-12-31");
  });
});

function grid(): TarifGridSnapshot {
  return {
    ageReferenceMode: "season_start",
    cumulMode: "cumulative",
    reductionCapPercent: null,
    roundingIncrement: "none",
    seasonStartDate: "2026-09-01",
    seasonEndDate: "2027-08-31",
    ageCategories: [
      { id: "mini", name: "Mini-tennis", minAge: 0, maxAge: 7, sortOrder: 0 },
      { id: "jeune", name: "Jeune", minAge: 8, maxAge: 17, sortOrder: 1 },
      { id: "adulte", name: "Adulte", minAge: 26, maxAge: 64, sortOrder: 2 }, // deliberate gap 18-25
      { id: "senior", name: "Senior", minAge: 65, maxAge: null, sortOrder: 3 },
    ],
    baseRates: [],
    lessonRates: [],
    additionalLines: [],
    rules: [],
  };
}

describe("resolveAgeCategory", () => {
  it("decrements the age when the reference date falls before the birthday this year", () => {
    // Reference date 2026-09-01; birthday is 2026-10-01 (later in the year) -> hasn't happened yet.
    const result = resolveAgeCategory(grid(), "1980-10-01");
    expect("category" in result && result.category.id).toBe("adulte"); // 45, not 46
  });

  it("picks the category matching the exact minAge boundary", () => {
    // reference date = 2026-09-01, age exactly 8 -> "jeune"
    const result = resolveAgeCategory(grid(), "2018-09-01");
    expect("category" in result && result.category.id).toBe("jeune");
  });

  it("picks the category matching the exact maxAge boundary", () => {
    // age exactly 7 at reference -> "mini"
    const result = resolveAgeCategory(grid(), "2019-09-01");
    expect("category" in result && result.category.id).toBe("mini");
  });

  it("no bound (maxAge null) matches any age at or above minAge", () => {
    const result = resolveAgeCategory(grid(), "1950-01-01"); // very old, "senior" has no upper bound
    expect("category" in result && result.category.id).toBe("senior");
  });

  it("returns an explicit error when the grid has a configuration gap (no matching category)", () => {
    // age 20 falls in the deliberate 18-25 gap between "jeune" (max 17) and "adulte" (min 26)
    const result = resolveAgeCategory(grid(), "2006-09-01");
    expect(result).toEqual({ error: "no_matching_category", age: 20 });
  });
});
