import { describe, it, expect } from "vitest";
import { evaluateAndApplyRules } from "../../../server/pricing/lib/engine";
import type { BaseLine, MemberPricingProfile, RuleSnapshot, TarifGridSnapshot } from "../../../server/pricing/lib/engine";

const ctx = { resolvedCategoryId: "cat-adult", ageAtReference: 30 };

const LINES_NO_ADDITIONAL: BaseLine[] = [
  { key: "membership", label: "Adhésion", targetType: "membership", baseAmountCents: 15000 },
  { key: "license", label: "Licence", targetType: "license", baseAmountCents: 3500 },
  { key: "lessons", label: "Cours", targetType: "lessons", baseAmountCents: 10000 },
];

function rule(
  partial: Pick<RuleSnapshot, "id" | "name" | "conditions" | "effectType" | "effectValue" | "targetType"> &
    Partial<RuleSnapshot>,
): RuleSnapshot {
  return {
    targetAdditionalLineId: null,
    exclusivityGroup: null,
    isActive: true,
    sortOrder: 0,
    ...partial,
  };
}

function grid(overrides: Partial<TarifGridSnapshot> = {}): TarifGridSnapshot {
  return {
    ageReferenceMode: "season_start",
    cumulMode: "cumulative",
    reductionCapPercent: null,
    roundingIncrement: "none",
    seasonStartDate: "2026-09-01",
    seasonEndDate: "2027-08-31",
    ageCategories: [],
    baseRates: [],
    lessonRates: [],
    additionalLines: [],
    rules: [],
    ...overrides,
  };
}

const NO_CONDITIONS: never[] = [];
const profile: MemberPricingProfile = {};

describe("evaluateAndApplyRules — branches not exercised by the 10 required scenarios", () => {
  it("a fixed_price rule targeting a non-existent additional line is skipped as not applicable", () => {
    const g = grid({
      rules: [
        rule({
          id: "ghost",
          name: "Règle fantôme",
          conditions: NO_CONDITIONS,
          effectType: "fixed_price",
          effectValue: 0,
          targetType: "additional_line",
          targetAdditionalLineId: "does-not-exist",
        }),
      ],
    });
    const result = evaluateAndApplyRules(g, LINES_NO_ADDITIONAL, profile, ctx);
    expect(result.appliedRules).toHaveLength(0);
    expect(result.skippedRules).toEqual([
      { ruleId: "ghost", ruleName: "Règle fantôme", reason: "La ligne ciblée n'est pas applicable à ce profil" },
    ]);
  });

  it("two fixed_price rules targeting the same single line: the second is skipped, referencing the first", () => {
    const g = grid({
      rules: [
        rule({
          id: "first",
          name: "Première règle",
          conditions: NO_CONDITIONS,
          effectType: "fixed_price",
          effectValue: 0,
          targetType: "membership",
          sortOrder: 0,
        }),
        rule({
          id: "second",
          name: "Deuxième règle",
          conditions: NO_CONDITIONS,
          effectType: "fixed_price",
          effectValue: 5000,
          targetType: "membership",
          sortOrder: 1,
        }),
      ],
    });
    const result = evaluateAndApplyRules(g, LINES_NO_ADDITIONAL, profile, ctx);
    expect(result.appliedRules).toHaveLength(1);
    expect(result.appliedRules[0].ruleId).toBe("first");
    expect(result.skippedRules).toEqual([
      { ruleId: "second", ruleName: "Deuxième règle", reason: "Prix fixe déjà appliqué sur cette ligne par « Première règle »" },
    ]);
  });

  it("a fixed_price rule on total_excluding_license partially applies when only some of its lines are already locked", () => {
    const g = grid({
      rules: [
        rule({
          id: "lock-membership",
          name: "Verrou adhésion",
          conditions: NO_CONDITIONS,
          effectType: "fixed_price",
          effectValue: 0,
          targetType: "membership",
          sortOrder: 0,
        }),
        rule({
          id: "flat-total",
          name: "Prix fixe global",
          conditions: NO_CONDITIONS,
          effectType: "fixed_price",
          effectValue: 4000,
          targetType: "total_excluding_license",
          sortOrder: 1,
        }),
      ],
    });
    const result = evaluateAndApplyRules(g, LINES_NO_ADDITIONAL, profile, ctx);
    // "lock-membership" locks membership first; "flat-total" then only gets to apply on "lessons"
    // (membership is skipped inside its own loop, not reported as a separate skippedRules entry).
    expect(result.appliedRules.map((r) => r.ruleId)).toEqual(["lock-membership", "flat-total"]);
    const flatTotalApplied = result.appliedRules.find((r) => r.ruleId === "flat-total")!;
    expect(flatTotalApplied.amountCents).toBe(4000 - 10000); // fixed price 4000 vs "lessons" base 10000
  });

  it("a non-fixed-price rule whose own target line doesn't exist is skipped before reaching exclusivity resolution", () => {
    const g = grid({
      rules: [
        rule({
          id: "ghost-discount",
          name: "Réduction fantôme",
          conditions: NO_CONDITIONS,
          effectType: "percent_discount",
          effectValue: 1000,
          targetType: "additional_line",
          targetAdditionalLineId: "does-not-exist",
        }),
      ],
    });
    const result = evaluateAndApplyRules(g, LINES_NO_ADDITIONAL, profile, ctx);
    expect(result.appliedRules).toHaveLength(0);
    expect(result.skippedRules).toEqual([
      { ruleId: "ghost-discount", ruleName: "Réduction fantôme", reason: "La ligne ciblée n'est pas applicable à ce profil" },
    ]);
  });

  it("total_excluding_license rules (discount and surcharge) with every eligible line already locked are skipped as not applicable", () => {
    const g = grid({
      rules: [
        rule({
          id: "lock-membership",
          name: "Verrou adhésion",
          conditions: NO_CONDITIONS,
          effectType: "fixed_price",
          effectValue: 0,
          targetType: "membership",
          sortOrder: 0,
        }),
        rule({
          id: "lock-lessons",
          name: "Verrou cours",
          conditions: NO_CONDITIONS,
          effectType: "fixed_price",
          effectValue: 0,
          targetType: "lessons",
          sortOrder: 1,
        }),
        rule({
          id: "discount-total",
          name: "Réduction globale",
          conditions: NO_CONDITIONS,
          effectType: "percent_discount",
          effectValue: 1000,
          targetType: "total_excluding_license",
          sortOrder: 2,
        }),
        rule({
          id: "surcharge-total",
          name: "Majoration globale",
          conditions: NO_CONDITIONS,
          effectType: "surcharge_amount",
          effectValue: 500,
          targetType: "total_excluding_license",
          sortOrder: 3,
        }),
      ],
    });
    const result = evaluateAndApplyRules(g, LINES_NO_ADDITIONAL, profile, ctx);
    const skippedIds = result.skippedRules.map((r) => r.ruleId);
    expect(skippedIds).toContain("discount-total");
    expect(skippedIds).toContain("surcharge-total");
    expect(result.skippedRules.find((r) => r.ruleId === "discount-total")?.reason).toBe(
      "La ligne ciblée n'est pas applicable à ce profil",
    );
    expect(result.skippedRules.find((r) => r.ruleId === "surcharge-total")?.reason).toBe(
      "La ligne ciblée n'est pas applicable à ce profil",
    );
  });

  it("cumulative mode: a discount rule alone in its own exclusivity group is kept without comparison", () => {
    const g = grid({
      cumulMode: "cumulative",
      rules: [
        rule({
          id: "solo",
          name: "Règle seule dans son groupe",
          conditions: NO_CONDITIONS,
          effectType: "percent_discount",
          effectValue: 1000,
          targetType: "membership",
          exclusivityGroup: "groupe_unique",
        }),
      ],
    });
    const result = evaluateAndApplyRules(g, LINES_NO_ADDITIONAL, profile, ctx);
    expect(result.appliedRules).toHaveLength(1);
    expect(result.appliedRules[0].ruleId).toBe("solo");
    expect(result.skippedRules).toHaveLength(0);
  });

  it("best_only mode: ties on magnitude are broken by sortOrder (lower sortOrder wins)", () => {
    const g = grid({
      cumulMode: "best_only",
      rules: [
        rule({
          id: "later",
          name: "Règle B (sortOrder 5)",
          conditions: NO_CONDITIONS,
          effectType: "percent_discount",
          effectValue: 1000,
          targetType: "membership",
          sortOrder: 5,
        }),
        rule({
          id: "earlier",
          name: "Règle A (sortOrder 2)",
          conditions: NO_CONDITIONS,
          effectType: "percent_discount",
          effectValue: 1000, // identical magnitude to "later" -> tie
          targetType: "membership",
          sortOrder: 2,
        }),
      ],
    });
    const result = evaluateAndApplyRules(g, LINES_NO_ADDITIONAL, profile, ctx);
    expect(result.appliedRules).toHaveLength(1);
    expect(result.appliedRules[0].ruleId).toBe("earlier");
  });

  it("a flat (non-percent) rule on total_excluding_license distributes by base amount using largest-remainder rounding", () => {
    const lines: BaseLine[] = [
      { key: "membership", label: "Adhésion", targetType: "membership", baseAmountCents: 100 },
      { key: "license", label: "Licence", targetType: "license", baseAmountCents: 0 },
      { key: "lessons", label: "Cours", targetType: "lessons", baseAmountCents: 200 },
    ];
    const g = grid({
      rules: [
        rule({
          id: "flat-total",
          name: "Réduction fixe globale",
          conditions: NO_CONDITIONS,
          effectType: "fixed_discount",
          effectValue: 100, // does not divide evenly across a 100:200 base ratio
          targetType: "total_excluding_license",
        }),
      ],
    });
    const result = evaluateAndApplyRules(g, lines, profile, ctx);
    const applied = result.appliedRules[0];
    expect(applied.amountCents).toBe(-100); // the two per-line shares sum exactly to the rule's amount
  });
});
