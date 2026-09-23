import { resolveAgeCategory } from "./age-category";
import { buildBaseLines } from "./base-lines";
import { applyCapAndFloorPerLine, roundTotal } from "./rounding";
import { evaluateAndApplyRules } from "./rules";
import type { Breakdown, MemberPricingProfile, TarifGridSnapshot } from "./types";

/**
 * The pricing engine's single entry point. Pure — no I/O, no throw for ordinary business cases —
 * always returns a Breakdown, including `status: "incomplete"` when the profile lacks data the
 * grid needs. NEVER silently returns a full price when data is missing.
 *
 * Deterministic order:
 * 1. Resolve the age category (at the grid's configured reference date).
 * 2. Build base lines (membership, license, lessons, eligible additional lines).
 * 3. Evaluate rule eligibility.
 * 4. `fixed_price` rules override their target line, neutralizing other rules on it.
 * 5. Resolve exclusivity (cumul mode / exclusivity groups) among discount rules.
 * 6. Apply kept discounts — percent effects computed on each line's BASE amount, additive, never
 *    cascading (-10% and -15% = -25%, not -10% then -15% of what's left).
 * 7. Apply surcharges (majorations) — always applied once eligible.
 * 8. Apply the optional reduction cap, then the per-line floor (never negative).
 * 9. Round the total to the grid's configured increment (always down).
 */
export function computeCotisation(grid: TarifGridSnapshot, profile: MemberPricingProfile): Breakdown {
  if (profile.birthDate === undefined) {
    return { status: "incomplete", missingFields: ["birthDate"] };
  }

  const ageResult = resolveAgeCategory(grid, profile.birthDate);
  if ("error" in ageResult) {
    // A gap in the grid's age categories is a configuration problem, not missing profile data —
    // still surfaced as "incomplete" so the caller never gets a silent full price. The grid's
    // warnings UI (lib/warnings.ts, in the pricing domain) is where the treasurer actually fixes
    // this — the engine only refuses to guess.
    return { status: "incomplete", missingFields: [`ageCategory:no_matching_category_for_age_${ageResult.age}`] };
  }

  const { category, age } = ageResult;
  const ctx = { resolvedCategoryId: category.id, ageAtReference: age };

  const { lines: baseLines, missingFields: baseMissingFields } = buildBaseLines(grid, category.id, profile, ctx);
  const {
    appliedRules,
    skippedRules,
    missingFields: ruleMissingFields,
    lineAdjustments,
  } = evaluateAndApplyRules(grid, baseLines, profile, ctx);

  const missingFields = [...new Set([...baseMissingFields, ...ruleMissingFields])];
  if (missingFields.length > 0) {
    return { status: "incomplete", missingFields };
  }

  const { lines: finalLines, capApplied } = applyCapAndFloorPerLine(baseLines, lineAdjustments, grid.reductionCapPercent);
  const rawTotalCents = finalLines.reduce((sum, line) => sum + line.finalAmountCents, 0);
  const totalCents = roundTotal(rawTotalCents, grid.roundingIncrement);

  return {
    status: "complete",
    missingFields: [],
    lines: finalLines,
    appliedRules,
    skippedRules,
    capApplied,
    totalCents,
  };
}
