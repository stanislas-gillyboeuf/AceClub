import { z } from "zod";

/**
 * Pure types for the pricing engine. This module has ZERO dependency on Hono/Drizzle/Node —
 * only `zod` and native TypeScript — so it stays extractable into a shared package later
 * (e.g. for apps/mobile) without a rewrite.
 *
 * `server/pricing/validators.ts` must import `tarifConditionSchema` from here rather than
 * redefining it, so the API validation and the engine's runtime evaluation never drift apart.
 */

// --- Conditions (discriminated union, AND implicit between entries in a list) ---

const ageCategoryConditionSchema = z.object({
  type: z.literal("age_category"),
  categoryIds: z.array(z.string()).min(1),
});

const ageRangeConditionSchema = z.object({
  type: z.literal("age_range"),
  minAge: z.number().int().min(0),
  maxAge: z.number().int().min(0),
});

const communeConditionSchema = z.object({
  type: z.literal("commune"),
  mode: z.enum(["in", "not_in"]),
  communeInseeCodes: z.array(z.string()).min(1),
});

// minRank/maxRank express "2e" (minRank=2, maxRank=2) or "4e et plus" (minRank=4, maxRank=undefined).
const householdRankConditionSchema = z.object({
  type: z.literal("household_rank"),
  minRank: z.number().int().min(1),
  maxRank: z.number().int().min(1).optional(),
});

const lessonsCountConditionSchema = z.object({
  type: z.literal("lessons_count"),
  operator: z.enum(["eq", "gte", "lte"]),
  value: z.number().int().min(0),
});

const licenseElsewhereConditionSchema = z.object({
  type: z.literal("license_elsewhere"),
  value: z.boolean(),
});

// Matches if the member has AT LEAST ONE of the listed tags.
const tagConditionSchema = z.object({
  type: z.literal("tag"),
  tagIds: z.array(z.string()).min(1),
});

const membershipTypeConditionSchema = z.object({
  type: z.literal("membership_type"),
  value: z.enum(["new", "renewal"]),
});

// monthDay format "MM-DD", compared to the day/month of registrationDate independently of the year.
const registrationAfterConditionSchema = z.object({
  type: z.literal("registration_after"),
  monthDay: z.string().regex(/^\d{2}-\d{2}$/),
});

export const tarifConditionSchema = z.discriminatedUnion("type", [
  ageCategoryConditionSchema,
  ageRangeConditionSchema,
  communeConditionSchema,
  householdRankConditionSchema,
  lessonsCountConditionSchema,
  licenseElsewhereConditionSchema,
  tagConditionSchema,
  membershipTypeConditionSchema,
  registrationAfterConditionSchema,
]);

export type TarifCondition = z.infer<typeof tarifConditionSchema>;
export type TarifConditionType = TarifCondition["type"];

export type ConditionResult = { met: true } | { met: false } | { missing: string[] };

// --- Member profile (decoupled from any real member row — a 1B adapter maps member -> profile) ---

export interface MemberPricingProfile {
  birthDate?: string; // ISO "YYYY-MM-DD"
  communeInsee?: string;
  householdRank?: number; // 1 = first of the household, 2 = second, etc.
  lessonsPerWeek?: number;
  licensedElsewhere?: boolean;
  tags?: string[]; // tagIds
  isNew?: boolean; // new member vs renewal
  registrationDate?: string; // ISO "YYYY-MM-DD"
}

// --- Grid snapshot (DB rows flattened into plain JS objects — no Drizzle types here) ---

export type TarifAgeReferenceMode = "season_start" | "dec_31_start_year" | "season_end_year";
export type TarifCumulMode = "cumulative" | "best_only";
export type TarifRoundingIncrement = "none" | "fifty_cents" | "one_euro";
export type TarifRuleEffectType =
  | "percent_discount"
  | "fixed_discount"
  | "surcharge_amount"
  | "surcharge_percent"
  | "fixed_price";
export type TarifRuleTargetType = "membership" | "lessons" | "license" | "additional_line" | "total_excluding_license";

export interface AgeCategorySnapshot {
  id: string;
  name: string;
  minAge: number;
  maxAge: number | null;
  sortOrder: number;
}

export interface BaseRateSnapshot {
  categoryId: string;
  membershipFeeCents: number;
  licenseFeeCents: number;
}

export interface LessonRateSnapshot {
  categoryId: string;
  lessonsPerWeek: number; // 0..4, 4 = "4 ou plus"
  priceCents: number;
}

export interface AdditionalLineSnapshot {
  id: string;
  name: string;
  amountCents: number;
  conditions: TarifCondition[];
  isActive: boolean;
  sortOrder: number;
}

export interface RuleSnapshot {
  id: string;
  name: string;
  conditions: TarifCondition[];
  effectType: TarifRuleEffectType;
  // Cents for amount-based effects (fixed_discount, surcharge_amount, fixed_price).
  // Basis points (1/100 of a percent; 1000 = 10.00%) for percent-based effects.
  effectValue: number;
  targetType: TarifRuleTargetType;
  targetAdditionalLineId: string | null; // required iff targetType === "additional_line"
  exclusivityGroup: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface TarifGridSnapshot {
  ageReferenceMode: TarifAgeReferenceMode;
  cumulMode: TarifCumulMode;
  reductionCapPercent: number | null;
  roundingIncrement: TarifRoundingIncrement;
  seasonStartDate: string; // ISO "YYYY-MM-DD"
  seasonEndDate: string; // ISO "YYYY-MM-DD"
  ageCategories: AgeCategorySnapshot[];
  baseRates: BaseRateSnapshot[];
  lessonRates: LessonRateSnapshot[];
  additionalLines: AdditionalLineSnapshot[];
  rules: RuleSnapshot[];
}

// --- Computation intermediates ---

// key: "membership" | "license" | "lessons" | `additional:<additionalLineId>`
export type LineTargetType = Exclude<TarifRuleTargetType, "total_excluding_license">;

export interface BaseLine {
  key: string;
  label: string;
  targetType: LineTargetType;
  additionalLineId?: string;
  baseAmountCents: number;
}

// Accumulated per-line effect of all rules, before the cap/floor/rounding pass.
export interface LineAdjustment {
  reductionCents: number; // positive magnitude of total discount on this line
  surchargeCents: number; // positive magnitude of total surcharge on this line
  fixedOverrideCents: number | null;
}

// --- Breakdown (explainable output) ---

export interface AppliedRule {
  ruleId: string;
  ruleName: string;
  targetType: TarifRuleTargetType;
  amountCents: number; // signed delta contributed by this rule (negative = discount, positive = surcharge)
  description: string;
}

export interface SkippedRule {
  ruleId: string;
  ruleName: string;
  reason: string;
}

export interface BreakdownLine {
  key: string;
  label: string;
  baseAmountCents: number;
  finalAmountCents: number;
}

export type Breakdown =
  | { status: "incomplete"; missingFields: string[] }
  | {
      status: "complete";
      missingFields: [];
      lines: BreakdownLine[];
      appliedRules: AppliedRule[];
      skippedRules: SkippedRule[];
      capApplied: boolean;
      totalCents: number;
    };
