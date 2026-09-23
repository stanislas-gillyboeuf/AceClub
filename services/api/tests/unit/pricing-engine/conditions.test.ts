import { describe, it, expect } from "vitest";
import { evaluateCondition, evaluateConditions } from "../../../server/pricing/lib/engine";
import type { MemberPricingProfile, TarifCondition } from "../../../server/pricing/lib/engine";

const ctx = { resolvedCategoryId: "cat-adult", ageAtReference: 30 };

describe("evaluateCondition", () => {
  it("age_category: met when the resolved category is in the list", () => {
    const c: TarifCondition = { type: "age_category", categoryIds: ["cat-adult", "cat-young"] };
    expect(evaluateCondition(c, {}, ctx)).toEqual({ met: true });
  });

  it("age_category: not met when the resolved category is absent from the list", () => {
    const c: TarifCondition = { type: "age_category", categoryIds: ["cat-young"] };
    expect(evaluateCondition(c, {}, ctx)).toEqual({ met: false });
  });

  it("age_range: met/not met based on ageAtReference, no profile field required", () => {
    const inRange: TarifCondition = { type: "age_range", minAge: 18, maxAge: 64 };
    const outOfRange: TarifCondition = { type: "age_range", minAge: 65, maxAge: 99 };
    expect(evaluateCondition(inRange, {}, ctx)).toEqual({ met: true });
    expect(evaluateCondition(outOfRange, {}, ctx)).toEqual({ met: false });
  });

  it("commune: mode 'in' met when profile commune is in the list", () => {
    const c: TarifCondition = { type: "commune", mode: "in", communeInseeCodes: ["35238"] };
    expect(evaluateCondition(c, { communeInsee: "35238" }, ctx)).toEqual({ met: true });
    expect(evaluateCondition(c, { communeInsee: "44109" }, ctx)).toEqual({ met: false });
  });

  it("commune: mode 'not_in' is the inverse of 'in'", () => {
    const c: TarifCondition = { type: "commune", mode: "not_in", communeInseeCodes: ["35238"] };
    expect(evaluateCondition(c, { communeInsee: "44109" }, ctx)).toEqual({ met: true });
    expect(evaluateCondition(c, { communeInsee: "35238" }, ctx)).toEqual({ met: false });
  });

  it("commune: missing when the profile has no commune", () => {
    const c: TarifCondition = { type: "commune", mode: "in", communeInseeCodes: ["35238"] };
    expect(evaluateCondition(c, {}, ctx)).toEqual({ missing: ["communeInsee"] });
  });

  it("household_rank: within [minRank, maxRank] range", () => {
    const c: TarifCondition = { type: "household_rank", minRank: 2, maxRank: 2 };
    expect(evaluateCondition(c, { householdRank: 2 }, ctx)).toEqual({ met: true });
    expect(evaluateCondition(c, { householdRank: 1 }, ctx)).toEqual({ met: false });
    expect(evaluateCondition(c, { householdRank: 3 }, ctx)).toEqual({ met: false });
  });

  it("household_rank: no maxRank means 'this rank or higher' (e.g. 4e et plus)", () => {
    const c: TarifCondition = { type: "household_rank", minRank: 4 };
    expect(evaluateCondition(c, { householdRank: 4 }, ctx)).toEqual({ met: true });
    expect(evaluateCondition(c, { householdRank: 10 }, ctx)).toEqual({ met: true });
    expect(evaluateCondition(c, { householdRank: 3 }, ctx)).toEqual({ met: false });
  });

  it("household_rank: missing when the profile has no rank", () => {
    const c: TarifCondition = { type: "household_rank", minRank: 2 };
    expect(evaluateCondition(c, {}, ctx)).toEqual({ missing: ["householdRank"] });
  });

  it("lessons_count: eq/gte/lte operators", () => {
    expect(evaluateCondition({ type: "lessons_count", operator: "eq", value: 2 }, { lessonsPerWeek: 2 }, ctx)).toEqual({
      met: true,
    });
    expect(evaluateCondition({ type: "lessons_count", operator: "gte", value: 2 }, { lessonsPerWeek: 3 }, ctx)).toEqual({
      met: true,
    });
    expect(evaluateCondition({ type: "lessons_count", operator: "lte", value: 2 }, { lessonsPerWeek: 3 }, ctx)).toEqual({
      met: false,
    });
  });

  it("lessons_count: an unknown operator (defensive path, unreachable via the typed schema) is not met", () => {
    const c = { type: "lessons_count", operator: "unknown", value: 1 } as unknown as TarifCondition;
    expect(evaluateCondition(c, { lessonsPerWeek: 1 }, ctx)).toBeUndefined();
  });

  it("lessons_count: missing when the profile has no lessonsPerWeek", () => {
    const c: TarifCondition = { type: "lessons_count", operator: "gte", value: 1 };
    expect(evaluateCondition(c, {}, ctx)).toEqual({ missing: ["lessonsPerWeek"] });
  });

  it("license_elsewhere: matches the exact boolean value", () => {
    const c: TarifCondition = { type: "license_elsewhere", value: true };
    expect(evaluateCondition(c, { licensedElsewhere: true }, ctx)).toEqual({ met: true });
    expect(evaluateCondition(c, { licensedElsewhere: false }, ctx)).toEqual({ met: false });
    expect(evaluateCondition(c, {}, ctx)).toEqual({ missing: ["licensedElsewhere"] });
  });

  it("tag: met when the profile has at least one of the listed tags", () => {
    const c: TarifCondition = { type: "tag", tagIds: ["etudiant", "senior"] };
    expect(evaluateCondition(c, { tags: ["etudiant"] }, ctx)).toEqual({ met: true });
    expect(evaluateCondition(c, { tags: ["benevole"] }, ctx)).toEqual({ met: false });
    expect(evaluateCondition(c, { tags: [] }, ctx)).toEqual({ met: false });
  });

  it("tag: missing when profile.tags is undefined (distinct from an empty array)", () => {
    const c: TarifCondition = { type: "tag", tagIds: ["etudiant"] };
    expect(evaluateCondition(c, {}, ctx)).toEqual({ missing: ["tags"] });
  });

  it("membership_type: new vs renewal", () => {
    expect(evaluateCondition({ type: "membership_type", value: "new" }, { isNew: true }, ctx)).toEqual({ met: true });
    expect(evaluateCondition({ type: "membership_type", value: "renewal" }, { isNew: true }, ctx)).toEqual({
      met: false,
    });
    expect(evaluateCondition({ type: "membership_type", value: "new" }, {}, ctx)).toEqual({ missing: ["isNew"] });
  });

  it("registration_after: compares month-day only, independent of year", () => {
    const c: TarifCondition = { type: "registration_after", monthDay: "01-15" };
    expect(evaluateCondition(c, { registrationDate: "2026-02-01" }, ctx)).toEqual({ met: true });
    expect(evaluateCondition(c, { registrationDate: "2019-01-01" }, ctx)).toEqual({ met: false });
    expect(evaluateCondition(c, {}, ctx)).toEqual({ missing: ["registrationDate"] });
  });
});

describe("evaluateConditions (implicit AND across a list)", () => {
  const conditions: TarifCondition[] = [
    { type: "tag", tagIds: ["etudiant"] },
    { type: "age_range", minAge: 18, maxAge: 30 },
  ];

  it("met when every condition is met", () => {
    const profile: MemberPricingProfile = { tags: ["etudiant"] };
    expect(evaluateConditions(conditions, profile, ctx)).toEqual({ met: true });
  });

  it("not met (and no missing) when one condition is definitively false", () => {
    const profile: MemberPricingProfile = { tags: ["benevole"] };
    expect(evaluateConditions(conditions, profile, ctx)).toEqual({ met: false });
  });

  it("an empty condition list is always met (a rule with no conditions applies to everyone)", () => {
    expect(evaluateConditions([], {}, ctx)).toEqual({ met: true });
  });

  it("aggregates missing fields across multiple conditions rather than short-circuiting on the first", () => {
    const multi: TarifCondition[] = [
      { type: "commune", mode: "in", communeInseeCodes: ["35238"] },
      { type: "household_rank", minRank: 2 },
    ];
    expect(evaluateConditions(multi, {}, ctx)).toEqual({ missing: ["communeInsee", "householdRank"] });
  });
});
