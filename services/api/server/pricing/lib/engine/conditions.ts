import type { ConditionResult, MemberPricingProfile, TarifCondition } from "./types";

export interface ConditionContext {
  resolvedCategoryId: string;
  ageAtReference: number;
}

/**
 * Evaluates a single condition against a member profile. Returns `{ missing: [...] }` — never
 * silently `{ met: false }` — when the profile lacks a field the condition needs, so callers can
 * surface it rather than guessing.
 */
export function evaluateCondition(
  condition: TarifCondition,
  profile: MemberPricingProfile,
  ctx: ConditionContext,
): ConditionResult {
  switch (condition.type) {
    case "age_category":
      return { met: condition.categoryIds.includes(ctx.resolvedCategoryId) };

    case "age_range":
      return { met: ctx.ageAtReference >= condition.minAge && ctx.ageAtReference <= condition.maxAge };

    case "commune": {
      if (profile.communeInsee === undefined) return { missing: ["communeInsee"] };
      const isIn = condition.communeInseeCodes.includes(profile.communeInsee);
      return { met: condition.mode === "in" ? isIn : !isIn };
    }

    case "household_rank": {
      if (profile.householdRank === undefined) return { missing: ["householdRank"] };
      const withinMax = condition.maxRank === undefined || profile.householdRank <= condition.maxRank;
      return { met: profile.householdRank >= condition.minRank && withinMax };
    }

    case "lessons_count": {
      if (profile.lessonsPerWeek === undefined) return { missing: ["lessonsPerWeek"] };
      switch (condition.operator) {
        case "eq":
          return { met: profile.lessonsPerWeek === condition.value };
        case "gte":
          return { met: profile.lessonsPerWeek >= condition.value };
        case "lte":
          return { met: profile.lessonsPerWeek <= condition.value };
      }
      break;
    }

    case "license_elsewhere": {
      if (profile.licensedElsewhere === undefined) return { missing: ["licensedElsewhere"] };
      return { met: profile.licensedElsewhere === condition.value };
    }

    case "tag": {
      if (profile.tags === undefined) return { missing: ["tags"] };
      return { met: condition.tagIds.some((id) => profile.tags!.includes(id)) };
    }

    case "membership_type": {
      if (profile.isNew === undefined) return { missing: ["isNew"] };
      return { met: (profile.isNew ? "new" : "renewal") === condition.value };
    }

    case "registration_after": {
      if (profile.registrationDate === undefined) return { missing: ["registrationDate"] };
      const monthDay = profile.registrationDate.slice(5, 10); // "MM-DD"
      return { met: monthDay > condition.monthDay };
    }
  }
}

/** Evaluates a list of conditions as an implicit AND. Missing data short-circuits and aggregates. */
export function evaluateConditions(
  conditions: TarifCondition[],
  profile: MemberPricingProfile,
  ctx: ConditionContext,
): ConditionResult {
  const missing: string[] = [];
  for (const condition of conditions) {
    const result = evaluateCondition(condition, profile, ctx);
    if ("missing" in result) {
      missing.push(...result.missing);
      continue;
    }
    if (!result.met) {
      return { met: false };
    }
  }
  if (missing.length > 0) return { missing };
  return { met: true };
}
