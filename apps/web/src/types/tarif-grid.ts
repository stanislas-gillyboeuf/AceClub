// Mirrors services/api/server/pricing/lib/engine/types.ts and services/api/server/pricing/validators.ts.
// Keep in sync manually — the engine module has zero web dependency by design.

export type TarifConditionType =
  | "age_category"
  | "age_range"
  | "commune"
  | "household_rank"
  | "lessons_count"
  | "license_elsewhere"
  | "tag"
  | "membership_type"
  | "registration_after"

export type TarifCondition =
  | { type: "age_category"; categoryIds: string[] }
  | { type: "age_range"; minAge: number; maxAge: number }
  | { type: "commune"; mode: "in" | "not_in"; communeInseeCodes: string[] }
  // minRank=2,maxRank=2 = "2e" ; minRank=4,maxRank=undefined = "4e et plus"
  | { type: "household_rank"; minRank: number; maxRank?: number }
  | { type: "lessons_count"; operator: "eq" | "gte" | "lte"; value: number }
  | { type: "license_elsewhere"; value: boolean }
  | { type: "tag"; tagIds: string[] } // matches if the member has AT LEAST ONE of the tags
  | { type: "membership_type"; value: "new" | "renewal" }
  | { type: "registration_after"; monthDay: string } // "MM-DD"

export interface MemberPricingProfile {
  birthDate?: string // "YYYY-MM-DD"
  communeInsee?: string
  householdRank?: number
  lessonsPerWeek?: number
  licensedElsewhere?: boolean
  tags?: string[]
  isNew?: boolean
  registrationDate?: string // "YYYY-MM-DD"
}

export type TarifGridStatus = "draft" | "active" | "archived"
export type TarifAgeReferenceMode = "season_start" | "dec_31_start_year" | "season_end_year"
export type TarifCumulMode = "cumulative" | "best_only"
export type TarifRoundingIncrement = "none" | "fifty_cents" | "one_euro"
export type TarifRuleEffectType =
  | "percent_discount"
  | "fixed_discount"
  | "surcharge_amount"
  | "surcharge_percent"
  | "fixed_price"
export type TarifRuleTargetType =
  | "membership"
  | "lessons"
  | "license"
  | "additional_line"
  | "total_excluding_license"

export interface TarifGrid {
  id: string
  organizationId: string
  familyId: string
  version: number
  previousVersionId: string | null
  seasonLabel: string
  seasonStartDate: string
  seasonEndDate: string
  ageReferenceMode: TarifAgeReferenceMode
  cumulMode: TarifCumulMode
  reductionCapPercent: number | null
  roundingIncrement: TarifRoundingIncrement
  status: TarifGridStatus
  createdByUserId: string
  activatedAt: string | null
  archivedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface TarifAgeCategory {
  id: string
  tarifGridId: string
  name: string
  minAge: number
  maxAge: number | null
  sortOrder: number
  createdAt: string
}

export interface TarifBaseRate {
  id: string
  tarifGridId: string
  categoryId: string
  membershipFeeCents: number
  licenseFeeCents: number
  updatedAt: string
}

export interface TarifLessonRate {
  id: string
  tarifGridId: string
  categoryId: string
  lessonsPerWeek: number
  priceCents: number
}

export interface TarifAdditionalLine {
  id: string
  tarifGridId: string
  name: string
  amountCents: number
  conditions: TarifCondition[]
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TarifRule {
  id: string
  tarifGridId: string
  name: string
  conditions: TarifCondition[]
  effectType: TarifRuleEffectType
  effectValue: number
  targetType: TarifRuleTargetType
  targetAdditionalLineId: string | null
  exclusivityGroup: string | null
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export interface TarifGridWarning {
  code: string
  message: string
  severity: "warning"
}

export interface GetGridResponse {
  grid: TarifGrid
  ageCategories: TarifAgeCategory[]
  baseRates: TarifBaseRate[]
  lessonRates: TarifLessonRate[]
  additionalLines: TarifAdditionalLine[]
  rules: TarifRule[]
  warnings: TarifGridWarning[]
}

export interface AppliedRule {
  ruleId: string
  ruleName: string
  targetType: TarifRuleTargetType
  amountCents: number
  description: string
}

export interface SkippedRule {
  ruleId: string
  ruleName: string
  reason: string
}

export interface BreakdownLine {
  key: string
  label: string
  baseAmountCents: number
  finalAmountCents: number
}

export type Breakdown =
  | { status: "incomplete"; missingFields: string[] }
  | {
      status: "complete"
      missingFields: []
      lines: BreakdownLine[]
      appliedRules: AppliedRule[]
      skippedRules: SkippedRule[]
      capApplied: boolean
      totalCents: number
    }

export interface TarifAuditLogEntry {
  id: string
  action: "created" | "updated" | "activated" | "archived" | "duplicated"
  summary: string | null
  createdAt: string
  actorUserId: string
  actorName: string
}

export interface ClubTag {
  id: string
  name: string
  sortOrder: number
}

// --- Mutation inputs ---

export interface CreateGridInput {
  organizationId: string
  seasonLabel: string
  seasonStartDate: string
  seasonEndDate: string
  mode: "blank" | "duplicate" | "template"
  duplicateFromGridId?: string
}

export interface UpdateGridSettingsInput {
  gridId: string
  seasonLabel?: string
  seasonStartDate?: string
  seasonEndDate?: string
  ageReferenceMode?: TarifAgeReferenceMode
  cumulMode?: TarifCumulMode
  reductionCapPercent?: number | null
  roundingIncrement?: TarifRoundingIncrement
}

export interface AgeCategoryItemInput {
  id?: string
  name: string
  minAge: number
  maxAge: number | null
  sortOrder?: number
}

export interface BaseRateItemInput {
  categoryId: string
  membershipFeeCents: number
  licenseFeeCents: number
}

export interface LessonRateItemInput {
  categoryId: string
  lessonsPerWeek: number
  priceCents: number
}

export interface CreateAdditionalLineInput {
  gridId: string
  name: string
  amountCents: number
  conditions?: TarifCondition[]
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateAdditionalLineInput {
  gridId: string
  additionalLineId: string
  name?: string
  amountCents?: number
  conditions?: TarifCondition[]
  isActive?: boolean
  sortOrder?: number
}

export interface CreateRuleInput {
  gridId: string
  name: string
  conditions: TarifCondition[]
  effectType: TarifRuleEffectType
  effectValue: number
  targetType: TarifRuleTargetType
  targetAdditionalLineId?: string
  exclusivityGroup?: string
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateRuleInput {
  gridId: string
  ruleId: string
  name?: string
  conditions?: TarifCondition[]
  effectType?: TarifRuleEffectType
  effectValue?: number
  targetType?: TarifRuleTargetType
  targetAdditionalLineId?: string | null
  exclusivityGroup?: string | null
  isActive?: boolean
  sortOrder?: number
}
