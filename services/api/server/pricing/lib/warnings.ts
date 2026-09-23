import type { TarifGridSnapshot } from "./engine";

export interface GridWarning {
  code: string;
  message: string;
  severity: "warning";
}

/** Non-blocking configuration warnings surfaced in the admin UI — never blocks saving. */
export function computeGridWarnings(snapshot: TarifGridSnapshot): GridWarning[] {
  const warnings: GridWarning[] = [];

  const sortedCategories = [...snapshot.ageCategories].sort((a, b) => a.minAge - b.minAge);
  for (let i = 0; i < sortedCategories.length - 1; i++) {
    const current = sortedCategories[i];
    const next = sortedCategories[i + 1];
    if (current.maxAge === null) continue; // an open-ended category swallows everything above it
    if (current.maxAge >= next.minAge) {
      warnings.push({
        code: "age_category_overlap",
        message: `Les catégories "${current.name}" et "${next.name}" se chevauchent.`,
        severity: "warning",
      });
    } else if (current.maxAge + 1 < next.minAge) {
      warnings.push({
        code: "age_category_gap",
        message: `Il y a un trou entre les catégories "${current.name}" et "${next.name}" (âges ${current.maxAge + 1} à ${next.minAge - 1} non couverts).`,
        severity: "warning",
      });
    }
  }

  for (const rule of snapshot.rules) {
    if (rule.conditions.length === 0) {
      warnings.push({
        code: "rule_no_condition",
        message: `La règle "${rule.name}" n'a aucune condition — elle s'applique à tous les adhérents.`,
        severity: "warning",
      });
    }
    if (rule.targetType === "license") {
      warnings.push({
        code: "rule_targets_license",
        message: `La règle "${rule.name}" réduit la licence FFT, habituellement reversée intégralement à la fédération.`,
        severity: "warning",
      });
    }
  }

  const seenByKey = new Map<string, string>();
  for (const rule of snapshot.rules) {
    const key = JSON.stringify({
      conditions: rule.conditions,
      effectType: rule.effectType,
      effectValue: rule.effectValue,
      targetType: rule.targetType,
      targetAdditionalLineId: rule.targetAdditionalLineId,
    });
    const duplicateOfName = seenByKey.get(key);
    if (duplicateOfName) {
      warnings.push({
        code: "rule_duplicate",
        message: `Les règles "${duplicateOfName}" et "${rule.name}" sont identiques.`,
        severity: "warning",
      });
    } else {
      seenByKey.set(key, rule.name);
    }
  }

  return warnings;
}
