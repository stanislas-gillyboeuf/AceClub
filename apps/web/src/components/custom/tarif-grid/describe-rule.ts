import type { TarifAdditionalLine, TarifAgeCategory, TarifCondition, TarifRule } from "@/types/tarif-grid"
import { describeCommuneCodes } from "./commune-name-cache"

export function formatCents(cents: number) {
  return (cents / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}

function householdRankLabel(minRank: number, maxRank: number | undefined) {
  if (maxRank === undefined) return `${minRank}e et plus du foyer`
  if (minRank === maxRank) return `${minRank}e du foyer`
  return `${minRank}e à ${maxRank}e du foyer`
}

export function describeCondition(
  condition: TarifCondition,
  ctx: { ageCategories: TarifAgeCategory[]; tagNameById: Map<string, string> },
): string {
  switch (condition.type) {
    case "age_category": {
      const names = condition.categoryIds
        .map((id) => ctx.ageCategories.find((c) => c.id === id)?.name ?? id)
        .join(", ")
      return `catégorie ${names}`
    }
    case "age_range":
      return `âge entre ${condition.minAge} et ${condition.maxAge} ans`
    case "commune":
      return condition.mode === "in"
        ? `résident de ${describeCommuneCodes(condition.communeInseeCodes)}`
        : `hors commune de ${describeCommuneCodes(condition.communeInseeCodes)}`
    case "household_rank":
      return householdRankLabel(condition.minRank, condition.maxRank)
    case "lessons_count": {
      const op = condition.operator === "eq" ? "=" : condition.operator === "gte" ? "≥" : "≤"
      return `nombre de cours ${op} ${condition.value}`
    }
    case "license_elsewhere":
      return condition.value ? "licencié dans un autre club" : "non licencié ailleurs"
    case "tag": {
      const names = condition.tagIds.map((id) => ctx.tagNameById.get(id) ?? id).join(" ou ")
      return `statut ${names}`
    }
    case "membership_type":
      return condition.value === "new" ? "nouvel adhérent" : "renouvellement"
    case "registration_after": {
      const [month, day] = condition.monthDay.split("-")
      return `inscrit après le ${day}/${month}`
    }
    default:
      return "condition inconnue"
  }
}

const TARGET_LABELS: Record<TarifRule["targetType"], string> = {
  membership: "l'adhésion",
  lessons: "les cours",
  license: "la licence",
  additional_line: "la ligne",
  total_excluding_license: "le total hors licence",
}

function effectLabel(rule: TarifRule, additionalLines: TarifAdditionalLine[]) {
  const target =
    rule.targetType === "additional_line"
      ? `« ${additionalLines.find((l) => l.id === rule.targetAdditionalLineId)?.name ?? "?"} »`
      : TARGET_LABELS[rule.targetType]

  switch (rule.effectType) {
    case "percent_discount":
      return `-${(rule.effectValue / 100).toLocaleString("fr-FR")}% sur ${target}`
    case "fixed_discount":
      return `-${formatCents(rule.effectValue)} sur ${target}`
    case "surcharge_amount":
      return `+${formatCents(rule.effectValue)} sur ${target}`
    case "surcharge_percent":
      return `+${(rule.effectValue / 100).toLocaleString("fr-FR")}% sur ${target}`
    case "fixed_price":
      return `${target} à ${formatCents(rule.effectValue)} fixe`
    default:
      return target
  }
}

/** The auto-generated, human-readable sentence shown on each rule card — e.g.
 * "-10% sur l'adhésion pour les résidents de Rennes, Cesson-Sévigné". */
export function describeRule(
  rule: TarifRule,
  ctx: { ageCategories: TarifAgeCategory[]; additionalLines: TarifAdditionalLine[]; tagNameById: Map<string, string> },
): string {
  const effect = effectLabel(rule, ctx.additionalLines)
  if (rule.conditions.length === 0) return `${effect}, pour tous les adhérents`
  const conditions = rule.conditions.map((c) => describeCondition(c, ctx)).join(" ET ")
  return `${effect}, si ${conditions}`
}
