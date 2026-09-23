import { distributeProportionally } from "./allocation";
import { evaluateConditions } from "./conditions";
import type {
  AppliedRule,
  BaseLine,
  LineAdjustment,
  MemberPricingProfile,
  RuleSnapshot,
  SkippedRule,
  TarifGridSnapshot,
} from "./types";

interface RulesContext {
  resolvedCategoryId: string;
  ageAtReference: number;
}

export interface EvaluateRulesResult {
  appliedRules: AppliedRule[];
  skippedRules: SkippedRule[];
  missingFields: string[];
  lineAdjustments: Record<string, LineAdjustment>;
}

function resolveTargetLineKeys(rule: RuleSnapshot, lines: BaseLine[], excludeKeys: Set<string>): string[] {
  switch (rule.targetType) {
    case "membership":
      return lines.some((l) => l.key === "membership") ? ["membership"] : [];
    case "lessons":
      return lines.some((l) => l.key === "lessons") ? ["lessons"] : [];
    case "license":
      return lines.some((l) => l.key === "license") ? ["license"] : [];
    case "additional_line": {
      const key = rule.targetAdditionalLineId ? `additional:${rule.targetAdditionalLineId}` : null;
      return key && lines.some((l) => l.key === key) ? [key] : [];
    }
    case "total_excluding_license":
      return lines.filter((l) => l.key !== "license" && !excludeKeys.has(l.key)).map((l) => l.key);
  }
}

// Percent effects are computed per targeted line directly (base_i * rate), which — for
// "total_excluding_license" — is mathematically equivalent to computing the percentage of the
// summed base and redistributing it proportionally, without the extra redistribution step.
// Flat-amount effects (fixed_discount/surcharge_amount) on a single line apply directly; on
// "total_excluding_license" they're distributed proportionally by each line's base amount.
function computeRuleDeltas(rule: RuleSnapshot, lines: BaseLine[], targetKeys: string[]): Record<string, number> {
  const linesByKey = new Map(lines.map((l) => [l.key, l]));
  const isPercent = rule.effectType === "percent_discount" || rule.effectType === "surcharge_percent";
  const sign = rule.effectType === "percent_discount" || rule.effectType === "fixed_discount" ? -1 : 1;

  if (isPercent) {
    const deltas: Record<string, number> = {};
    for (const key of targetKeys) {
      const base = linesByKey.get(key)!.baseAmountCents;
      deltas[key] = sign * Math.round((base * rule.effectValue) / 10000);
    }
    return deltas;
  }

  if (targetKeys.length === 1) {
    return { [targetKeys[0]]: sign * rule.effectValue };
  }

  const weights = targetKeys.map((key) => ({ key, weight: linesByKey.get(key)!.baseAmountCents }));
  const distributed = distributeProportionally(rule.effectValue, weights);
  const deltas: Record<string, number> = {};
  for (const key of targetKeys) deltas[key] = sign * (distributed[key] ?? 0);
  return deltas;
}

function magnitude(deltas: Record<string, number>): number {
  return Object.values(deltas).reduce((s, v) => s + Math.abs(v), 0);
}

/**
 * Steps 3-7 of the engine, documented in `compute-cotisation.ts`:
 * 3. Evaluate rule eligibility (conditions AND'ed together).
 * 4. `fixed_price` rules override their target line and neutralize every other rule on it.
 * 5. Resolve exclusivity: "best_only" mode keeps a single overall-best discount rule; "cumulative"
 *    mode keeps every ungrouped discount rule but only the best within each exclusivity group.
 *    Surcharges (majorations) are never subject to this resolution — they always apply once
 *    eligible, since the client's cumul setting concerns "réductions", not surcharges.
 * 6-7. Apply kept discounts (percent additive on each line's BASE amount, never cascading) then
 *    surcharges.
 */
export function evaluateAndApplyRules(
  grid: TarifGridSnapshot,
  baseLines: BaseLine[],
  profile: MemberPricingProfile,
  ctx: RulesContext,
): EvaluateRulesResult {
  const appliedRules: AppliedRule[] = [];
  const skippedRules: SkippedRule[] = [];
  const missingFields: string[] = [];
  const lineAdjustments: Record<string, LineAdjustment> = {};
  for (const line of baseLines) {
    lineAdjustments[line.key] = { reductionCents: 0, surchargeCents: 0, fixedOverrideCents: null };
  }

  const activeRules = [...grid.rules].filter((r) => r.isActive).sort((a, b) => a.sortOrder - b.sortOrder);

  // Step 3: eligibility. A rule whose conditions can't be evaluated (missing profile data) is
  // neither applied nor skipped — it only contributes to `missingFields`, which makes the whole
  // Breakdown "incomplete" upstream in compute-cotisation.ts (never a silent full price). A rule
  // that is definitively not eligible (a condition is false) is simply not surfaced at all — it
  // never applied to this profile, showing it as "skipped" would just be noise.
  const eligible: RuleSnapshot[] = [];
  for (const rule of activeRules) {
    const result = evaluateConditions(rule.conditions, profile, ctx);
    if ("missing" in result) {
      missingFields.push(...result.missing);
      continue;
    }
    if (!result.met) continue;
    eligible.push(rule);
  }

  // Step 4: fixed_price rules lock their target line.
  const lockedKeys = new Set<string>();
  const lockedByRuleName = new Map<string, string>();
  const fixedPriceRules = eligible.filter((r) => r.effectType === "fixed_price");
  const nonFixedPriceRules = eligible.filter((r) => r.effectType !== "fixed_price");

  for (const rule of fixedPriceRules) {
    const targetKeys = resolveTargetLineKeys(rule, baseLines, lockedKeys);
    if (targetKeys.length === 0) {
      skippedRules.push({ ruleId: rule.id, ruleName: rule.name, reason: "La ligne ciblée n'est pas applicable à ce profil" });
      continue;
    }
    let appliedAtLeastOne = false;
    for (const key of targetKeys) {
      if (lockedKeys.has(key)) continue;
      appliedAtLeastOne = true;
      lockedKeys.add(key);
      lockedByRuleName.set(key, rule.name);
      const line = baseLines.find((l) => l.key === key)!;
      lineAdjustments[key].fixedOverrideCents = rule.effectValue;
      appliedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        targetType: rule.targetType,
        amountCents: rule.effectValue - line.baseAmountCents,
        description: `${rule.name} (prix fixe)`,
      });
    }
    if (!appliedAtLeastOne) {
      const winner = lockedByRuleName.get(targetKeys[0]) ?? "une autre règle";
      skippedRules.push({
        ruleId: rule.id,
        ruleName: rule.name,
        reason: `Prix fixe déjà appliqué sur cette ligne par « ${winner} »`,
      });
    }
  }

  // Step 4b: neutralize any other rule targeting a now-locked line.
  const unlockedRules: RuleSnapshot[] = [];
  for (const rule of nonFixedPriceRules) {
    if (rule.targetType !== "total_excluding_license") {
      const targetKeys = resolveTargetLineKeys(rule, baseLines, new Set());
      if (targetKeys.length === 0) {
        skippedRules.push({ ruleId: rule.id, ruleName: rule.name, reason: "La ligne ciblée n'est pas applicable à ce profil" });
        continue;
      }
      if (lockedKeys.has(targetKeys[0])) {
        const winner = lockedByRuleName.get(targetKeys[0]) ?? "une autre règle";
        skippedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          reason: `Prix fixe déjà appliqué sur cette ligne par « ${winner} »`,
        });
        continue;
      }
    }
    unlockedRules.push(rule);
  }

  const discountRules = unlockedRules.filter((r) => r.effectType === "percent_discount" || r.effectType === "fixed_discount");
  const surchargeRules = unlockedRules.filter((r) => r.effectType === "surcharge_amount" || r.effectType === "surcharge_percent");

  // Step 5: resolve exclusivity among discount rules only.
  const discountDeltasByRuleId = new Map<string, Record<string, number>>();
  const discountMagnitudeByRuleId = new Map<string, number>();
  for (const rule of discountRules) {
    const targetKeys = resolveTargetLineKeys(rule, baseLines, lockedKeys);
    if (targetKeys.length === 0) {
      skippedRules.push({ ruleId: rule.id, ruleName: rule.name, reason: "La ligne ciblée n'est pas applicable à ce profil" });
      continue;
    }
    const deltas = computeRuleDeltas(rule, baseLines, targetKeys);
    discountDeltasByRuleId.set(rule.id, deltas);
    discountMagnitudeByRuleId.set(rule.id, magnitude(deltas));
  }
  const rankedDiscountRules = discountRules.filter((r) => discountDeltasByRuleId.has(r.id));

  const byBestMagnitude = (a: RuleSnapshot, b: RuleSnapshot) => {
    const diff = discountMagnitudeByRuleId.get(b.id)! - discountMagnitudeByRuleId.get(a.id)!;
    return diff !== 0 ? diff : a.sortOrder - b.sortOrder;
  };

  let keptDiscountRules: RuleSnapshot[] = [];

  if (grid.cumulMode === "best_only") {
    if (rankedDiscountRules.length > 0) {
      const best = [...rankedDiscountRules].sort(byBestMagnitude)[0];
      for (const rule of rankedDiscountRules) {
        if (rule.id === best.id) continue;
        skippedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          reason: `Non cumulable — seule la règle la plus avantageuse (« ${best.name} ») est appliquée en mode « plus avantageuse »`,
        });
      }
      keptDiscountRules = [best];
    }
  } else {
    const groups = new Map<string, RuleSnapshot[]>();
    for (const rule of rankedDiscountRules) {
      if (!rule.exclusivityGroup) {
        keptDiscountRules.push(rule);
        continue;
      }
      const list = groups.get(rule.exclusivityGroup) ?? [];
      list.push(rule);
      groups.set(rule.exclusivityGroup, list);
    }
    for (const list of groups.values()) {
      if (list.length === 1) {
        keptDiscountRules.push(list[0]);
        continue;
      }
      const best = [...list].sort(byBestMagnitude)[0];
      keptDiscountRules.push(best);
      for (const rule of list) {
        if (rule.id === best.id) continue;
        skippedRules.push({
          ruleId: rule.id,
          ruleName: rule.name,
          reason: `Non cumulable avec « ${best.name} » (même groupe d'exclusivité)`,
        });
      }
    }
  }

  // Step 6: apply kept discounts.
  for (const rule of keptDiscountRules) {
    const deltas = discountDeltasByRuleId.get(rule.id)!;
    for (const [key, delta] of Object.entries(deltas)) {
      lineAdjustments[key].reductionCents += Math.abs(delta);
    }
    appliedRules.push({
      ruleId: rule.id,
      ruleName: rule.name,
      targetType: rule.targetType,
      amountCents: Object.values(deltas).reduce((s, v) => s + v, 0),
      description: rule.name,
    });
  }

  // Step 7: surcharges always apply once eligible — not subject to cumul-mode resolution.
  for (const rule of surchargeRules) {
    const targetKeys = resolveTargetLineKeys(rule, baseLines, lockedKeys);
    if (targetKeys.length === 0) {
      skippedRules.push({ ruleId: rule.id, ruleName: rule.name, reason: "La ligne ciblée n'est pas applicable à ce profil" });
      continue;
    }
    const deltas = computeRuleDeltas(rule, baseLines, targetKeys);
    for (const [key, delta] of Object.entries(deltas)) {
      lineAdjustments[key].surchargeCents += delta;
    }
    appliedRules.push({
      ruleId: rule.id,
      ruleName: rule.name,
      targetType: rule.targetType,
      amountCents: Object.values(deltas).reduce((s, v) => s + v, 0),
      description: rule.name,
    });
  }

  return { appliedRules, skippedRules, missingFields, lineAdjustments };
}
