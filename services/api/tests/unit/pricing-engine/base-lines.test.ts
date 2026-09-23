import { describe, it, expect } from "vitest";
import { buildBaseLines } from "../../../server/pricing/lib/engine";
import type { TarifGridSnapshot } from "../../../server/pricing/lib/engine";

const CAT = "cat-adult";
const ctx = { ageAtReference: 30 };

function grid(overrides: Partial<TarifGridSnapshot> = {}): TarifGridSnapshot {
  return {
    ageReferenceMode: "season_start",
    cumulMode: "cumulative",
    reductionCapPercent: null,
    roundingIncrement: "none",
    seasonStartDate: "2026-09-01",
    seasonEndDate: "2027-08-31",
    ageCategories: [{ id: CAT, name: "Adulte", minAge: 18, maxAge: 99, sortOrder: 0 }],
    baseRates: [{ categoryId: CAT, membershipFeeCents: 15000, licenseFeeCents: 3500 }],
    lessonRates: [
      { categoryId: CAT, lessonsPerWeek: 0, priceCents: 0 },
      { categoryId: CAT, lessonsPerWeek: 4, priceCents: 46000 },
    ],
    additionalLines: [],
    rules: [],
    ...overrides,
  };
}

describe("buildBaseLines", () => {
  it("flags licensedElsewhere as missing when the category charges a license fee and it's absent", () => {
    const { lines, missingFields } = buildBaseLines(grid(), CAT, {}, ctx);
    expect(missingFields).toContain("licensedElsewhere");
    expect(lines.find((l) => l.key === "license")?.baseAmountCents).toBe(3500); // full fee, not yet zeroed
  });

  it("does not require licensedElsewhere when the category's license fee is 0", () => {
    const g = grid({ baseRates: [{ categoryId: CAT, membershipFeeCents: 15000, licenseFeeCents: 0 }] });
    const { lines, missingFields } = buildBaseLines(g, CAT, {}, ctx);
    expect(missingFields).not.toContain("licensedElsewhere");
    expect(lines.find((l) => l.key === "license")?.baseAmountCents).toBe(0);
  });

  it("flags lessonsPerWeek as missing when the grid has a lesson-price table for this category and it's absent", () => {
    const { missingFields } = buildBaseLines(grid(), CAT, { licensedElsewhere: false }, ctx);
    expect(missingFields).toContain("lessonsPerWeek");
  });

  it("does not require lessonsPerWeek when the grid has no lesson-price table for this category", () => {
    const g = grid({ lessonRates: [] });
    const { missingFields, lines } = buildBaseLines(g, CAT, { licensedElsewhere: false }, ctx);
    expect(missingFields).not.toContain("lessonsPerWeek");
    expect(lines.find((l) => l.key === "lessons")?.baseAmountCents).toBe(0);
  });

  it("clamps a requested lesson count above 4 to the '4 ou plus' tier", () => {
    const { lines } = buildBaseLines(grid(), CAT, { licensedElsewhere: false, lessonsPerWeek: 7 }, ctx);
    expect(lines.find((l) => l.key === "lessons")?.baseAmountCents).toBe(46000);
  });

  it("includes an additional line when its conditions are met", () => {
    const g = grid({
      additionalLines: [
        { id: "droit-entree", name: "Droit d'entrée", amountCents: 3000, conditions: [], isActive: true, sortOrder: 0 },
      ],
    });
    const { lines } = buildBaseLines(g, CAT, { licensedElsewhere: false, lessonsPerWeek: 0 }, ctx);
    expect(lines.find((l) => l.key === "additional:droit-entree")?.baseAmountCents).toBe(3000);
  });

  it("excludes an inactive additional line even if its conditions would be met", () => {
    const g = grid({
      additionalLines: [
        { id: "droit-entree", name: "Droit d'entrée", amountCents: 3000, conditions: [], isActive: false, sortOrder: 0 },
      ],
    });
    const { lines } = buildBaseLines(g, CAT, { licensedElsewhere: false, lessonsPerWeek: 0 }, ctx);
    expect(lines.find((l) => l.key === "additional:droit-entree")).toBeUndefined();
  });

  it("excludes an additional line whose conditions are not met", () => {
    const g = grid({
      additionalLines: [
        {
          id: "droit-entree",
          name: "Droit d'entrée",
          amountCents: 3000,
          conditions: [{ type: "membership_type", value: "new" }],
          isActive: true,
          sortOrder: 0,
        },
      ],
    });
    const { lines } = buildBaseLines(g, CAT, { licensedElsewhere: false, lessonsPerWeek: 0, isNew: false }, ctx);
    expect(lines.find((l) => l.key === "additional:droit-entree")).toBeUndefined();
  });

  it("aggregates a missing field required by an additional line's condition, and excludes the line", () => {
    const g = grid({
      additionalLines: [
        {
          id: "droit-entree",
          name: "Droit d'entrée",
          amountCents: 3000,
          conditions: [{ type: "tag", tagIds: ["nouveau"] }],
          isActive: true,
          sortOrder: 0,
        },
      ],
    });
    const { lines, missingFields } = buildBaseLines(g, CAT, { licensedElsewhere: false, lessonsPerWeek: 0 }, ctx);
    expect(missingFields).toContain("tags");
    expect(lines.find((l) => l.key === "additional:droit-entree")).toBeUndefined();
  });
});
