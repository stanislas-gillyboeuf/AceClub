import type { TarifCondition, TarifRuleEffectType, TarifRuleTargetType } from "./engine";

export interface StarterTemplateAgeCategory {
  name: string;
  minAge: number;
  maxAge: number | null;
  sortOrder: number;
}

// Rates are keyed by category name — the caller resolves names to real category ids once the
// categories have been inserted and assigned real ids.
export interface StarterTemplateBaseRate {
  categoryName: string;
  membershipFeeCents: number;
  licenseFeeCents: number;
}

export interface StarterTemplateLessonRate {
  categoryName: string;
  lessonsPerWeek: number;
  priceCents: number;
}

export interface StarterTemplateRule {
  name: string;
  conditions: TarifCondition[];
  effectType: TarifRuleEffectType;
  effectValue: number;
  targetType: TarifRuleTargetType;
  exclusivityGroup?: string;
}

/**
 * "Club associatif type" — a reasonable starting grid so a treasurer can configure their own
 * grid in minutes rather than from a blank slate. Amounts are illustrative placeholders meant to
 * be edited, not real defaults for any specific club.
 */
export function getStarterTemplateAgeCategories(): StarterTemplateAgeCategory[] {
  return [
    { name: "Mini-tennis", minAge: 0, maxAge: 7, sortOrder: 0 },
    { name: "Jeune", minAge: 8, maxAge: 17, sortOrder: 1 },
    { name: "Étudiant", minAge: 18, maxAge: 25, sortOrder: 2 },
    { name: "Adulte", minAge: 26, maxAge: 64, sortOrder: 3 },
    { name: "Senior", minAge: 65, maxAge: null, sortOrder: 4 },
  ];
}

const MEMBERSHIP_FEE_CENTS_BY_CATEGORY: Record<string, number> = {
  "Mini-tennis": 6000,
  Jeune: 9000,
  Étudiant: 11000,
  Adulte: 15000,
  Senior: 12000,
};

const LICENSE_FEE_CENTS_BY_CATEGORY: Record<string, number> = {
  "Mini-tennis": 1500,
  Jeune: 2200,
  Étudiant: 3500,
  Adulte: 3500,
  Senior: 3500,
};

export function getStarterTemplateBaseRates(): StarterTemplateBaseRate[] {
  return getStarterTemplateAgeCategories().map((c) => ({
    categoryName: c.name,
    membershipFeeCents: MEMBERSHIP_FEE_CENTS_BY_CATEGORY[c.name],
    licenseFeeCents: LICENSE_FEE_CENTS_BY_CATEGORY[c.name],
  }));
}

export function getStarterTemplateLessonRates(): StarterTemplateLessonRate[] {
  return getStarterTemplateAgeCategories().flatMap((c) =>
    [0, 1, 2, 3, 4].map((lessonsPerWeek) => ({
      categoryName: c.name,
      lessonsPerWeek,
      // A simple degressive placeholder curve — first lesson at "full" price, each extra one
      // cheaper. Meant to be overwritten; not a real pricing policy.
      priceCents: lessonsPerWeek === 0 ? 0 : 12000 * lessonsPerWeek - (lessonsPerWeek - 1) * 1500,
    })),
  );
}

/**
 * Only the family-size discounts are seeded as real rules — they need no club-specific data. A
 * "Résident" rule is deliberately NOT seeded: it needs a real commune list the club must supply,
 * and shipping it with an empty list would violate the condition schema's `min(1)` constraint
 * (and be a silently-inactive trap). An "Étudiant" rule is seeded only if the template's
 * "Étudiant" age category was actually created and its id is known.
 */
export function buildStarterTemplateRules(categoryIdByName: Record<string, string>): StarterTemplateRule[] {
  const rules: StarterTemplateRule[] = [
    {
      name: "Famille 2e",
      conditions: [{ type: "household_rank", minRank: 2, maxRank: 2 }],
      effectType: "percent_discount",
      effectValue: 1000, // 10.00%
      targetType: "total_excluding_license",
      exclusivityGroup: "famille",
    },
    {
      name: "Famille 3e et plus",
      conditions: [{ type: "household_rank", minRank: 3 }],
      effectType: "percent_discount",
      effectValue: 2000, // 20.00%
      targetType: "total_excluding_license",
      exclusivityGroup: "famille",
    },
  ];

  const etudiantCategoryId = categoryIdByName["Étudiant"];
  if (etudiantCategoryId) {
    rules.push({
      name: "Étudiant",
      conditions: [{ type: "age_category", categoryIds: [etudiantCategoryId] }],
      effectType: "percent_discount",
      effectValue: 2000, // 20.00%
      targetType: "membership",
    });
  }

  return rules;
}
