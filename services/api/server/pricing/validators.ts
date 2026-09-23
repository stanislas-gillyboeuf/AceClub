import { z } from "zod";
import { tarifConditionSchema } from "./lib/engine";

const ageReferenceModeEnum = z.enum(["season_start", "dec_31_start_year", "season_end_year"]);
const cumulModeEnum = z.enum(["cumulative", "best_only"]);
const roundingIncrementEnum = z.enum(["none", "fifty_cents", "one_euro"]);
const effectTypeEnum = z.enum([
  "percent_discount",
  "fixed_discount",
  "surcharge_amount",
  "surcharge_percent",
  "fixed_price",
]);
const targetTypeEnum = z.enum([
  "membership",
  "lessons",
  "license",
  "additional_line",
  "total_excluding_license",
]);
const createModeEnum = z.enum(["blank", "duplicate", "template"]);
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO date (YYYY-MM-DD)");

// --- Queries ---

export const listGridsValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  seasonLabel: z.string().optional(),
});

export const getGridValidator = z.object({
  id: z.string().min(1, "Grid ID is required"),
});

export const getActiveGridValidator = z.object({
  organizationId: z.string().min(1, "Organization ID is required"),
  seasonLabel: z.string().min(1, "Season label is required"),
});

export const listAuditLogValidator = z.object({
  tarifGridId: z.string().min(1, "Grid ID is required"),
});

// --- Grid lifecycle ---

export const createGridValidator = z
  .object({
    organizationId: z.string().min(1, "Organization ID is required"),
    seasonLabel: z.string().min(1, "Season label is required"),
    seasonStartDate: z.string().datetime(),
    seasonEndDate: z.string().datetime(),
    mode: createModeEnum,
    duplicateFromGridId: z.string().min(1).optional(),
  })
  .refine((data) => data.mode !== "duplicate" || !!data.duplicateFromGridId, {
    message: "duplicateFromGridId is required when mode is 'duplicate'",
    path: ["duplicateFromGridId"],
  })
  .refine((data) => new Date(data.seasonStartDate) < new Date(data.seasonEndDate), {
    message: "seasonStartDate must be before seasonEndDate",
    path: ["seasonEndDate"],
  });

export const updateGridSettingsValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  seasonLabel: z.string().min(1).optional(),
  seasonStartDate: z.string().datetime().optional(),
  seasonEndDate: z.string().datetime().optional(),
  ageReferenceMode: ageReferenceModeEnum.optional(),
  cumulMode: cumulModeEnum.optional(),
  reductionCapPercent: z.number().int().min(0).max(100).nullable().optional(),
  roundingIncrement: roundingIncrementEnum.optional(),
});

export const activateGridValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
});

// --- Age categories ---

const ageCategoryItemValidator = z
  .object({
    id: z.string().min(1).optional(),
    name: z.string().min(1).max(60),
    minAge: z.number().int().min(0),
    maxAge: z.number().int().min(0).nullable(),
    sortOrder: z.number().int().min(0).optional().default(0),
  })
  .refine((data) => data.maxAge === null || data.maxAge >= data.minAge, {
    message: "maxAge must be greater than or equal to minAge",
    path: ["maxAge"],
  });

export const upsertAgeCategoriesValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  items: z.array(ageCategoryItemValidator).min(1),
});

// --- Base rates (membership + license) ---

const baseRateItemValidator = z.object({
  categoryId: z.string().min(1),
  membershipFeeCents: z.number().int().min(0),
  licenseFeeCents: z.number().int().min(0),
});

export const upsertBaseRatesValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  items: z.array(baseRateItemValidator),
});

// --- Lesson rates ---

const lessonRateItemValidator = z.object({
  categoryId: z.string().min(1),
  lessonsPerWeek: z.number().int().min(0).max(4),
  priceCents: z.number().int().min(0),
});

export const upsertLessonRatesValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  items: z.array(lessonRateItemValidator),
});

// --- Additional lines ---

export const createAdditionalLineValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  name: z.string().min(1).max(80),
  amountCents: z.number().int().min(0),
  conditions: z.array(tarifConditionSchema).optional().default([]),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().min(0).optional().default(0),
});

export const updateAdditionalLineValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  additionalLineId: z.string().min(1, "Additional line ID is required"),
  name: z.string().min(1).max(80).optional(),
  amountCents: z.number().int().min(0).optional(),
  conditions: z.array(tarifConditionSchema).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const deleteAdditionalLineValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  additionalLineId: z.string().min(1, "Additional line ID is required"),
});

// --- Rules ---

export const createRuleValidator = z
  .object({
    gridId: z.string().min(1, "Grid ID is required"),
    name: z.string().min(1).max(120),
    conditions: z.array(tarifConditionSchema),
    effectType: effectTypeEnum,
    effectValue: z.number().int(),
    targetType: targetTypeEnum,
    targetAdditionalLineId: z.string().min(1).optional(),
    exclusivityGroup: z.string().min(1).max(60).optional(),
    isActive: z.boolean().optional().default(true),
    sortOrder: z.number().int().min(0).optional().default(0),
  })
  .refine((data) => data.targetType !== "additional_line" || !!data.targetAdditionalLineId, {
    message: "targetAdditionalLineId is required when targetType is 'additional_line'",
    path: ["targetAdditionalLineId"],
  });

// Partial update — the handler cross-checks targetType/targetAdditionalLineId consistency
// against the merged (existing + incoming) row, since a caller may only send one of the two.
export const updateRuleValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  ruleId: z.string().min(1, "Rule ID is required"),
  name: z.string().min(1).max(120).optional(),
  conditions: z.array(tarifConditionSchema).optional(),
  effectType: effectTypeEnum.optional(),
  effectValue: z.number().int().optional(),
  targetType: targetTypeEnum.optional(),
  targetAdditionalLineId: z.string().min(1).nullable().optional(),
  exclusivityGroup: z.string().min(1).max(60).nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const deleteRuleValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  ruleId: z.string().min(1, "Rule ID is required"),
});

export const reorderRulesValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  orderedRuleIds: z.array(z.string().min(1)).min(1),
});

export const duplicateRuleValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  ruleId: z.string().min(1, "Rule ID is required"),
});

export const toggleRuleValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  ruleId: z.string().min(1, "Rule ID is required"),
  isActive: z.boolean(),
});

// --- Simulation ---

const memberPricingProfileValidator = z.object({
  birthDate: isoDate.optional(),
  communeInsee: z.string().optional(),
  householdRank: z.number().int().min(1).optional(),
  lessonsPerWeek: z.number().int().min(0).optional(),
  licensedElsewhere: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  isNew: z.boolean().optional(),
  registrationDate: isoDate.optional(),
});

export const simulateValidator = z.object({
  gridId: z.string().min(1, "Grid ID is required"),
  profile: memberPricingProfileValidator,
});
