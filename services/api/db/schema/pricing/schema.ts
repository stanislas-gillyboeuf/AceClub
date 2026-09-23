import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const tarifGridStatus = pgEnum("tarif_grid_status", ["draft", "active", "archived"]);

export const tarifAgeReferenceMode = pgEnum("tarif_age_reference_mode", [
  "season_start",
  "dec_31_start_year",
  "season_end_year",
]);

export const tarifCumulMode = pgEnum("tarif_cumul_mode", ["cumulative", "best_only"]);

export const tarifRoundingIncrement = pgEnum("tarif_rounding_increment", [
  "none",
  "fifty_cents",
  "one_euro",
]);

export const tarifRuleEffectType = pgEnum("tarif_rule_effect_type", [
  "percent_discount",
  "fixed_discount",
  "surcharge_amount",
  "surcharge_percent",
  "fixed_price",
]);

export const tarifRuleTargetType = pgEnum("tarif_rule_target_type", [
  "membership",
  "lessons",
  "license",
  "additional_line",
  "total_excluding_license",
]);

export const tarifAuditAction = pgEnum("tarif_audit_action", [
  "created",
  "updated",
  "activated",
  "archived",
  "duplicated",
]);

export const memberCotisationStatus = pgEnum("member_cotisation_status", [
  "pending",
  "paid",
  "waived",
]);

/**
 * A versioned pricing grid for a club's season. Editing an "active" grid never mutates it in
 * place — it clones a new row (same familyId, version+1, previousVersionId set) and archives the
 * old one. See server/pricing/lib/versioning.ts. The UI only ever shows draft/active; version
 * chaining is an implementation detail for history + future amount-freezing (phase 1B).
 */
export const tarifGrid = pgTable(
  "tarif_grid",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    familyId: text("family_id").notNull(),
    version: integer("version").notNull().default(1),
    // Soft pointer, not a FK — avoids self-referential insertion-order issues.
    previousVersionId: text("previous_version_id"),
    seasonLabel: text("season_label").notNull(),
    seasonStartDate: timestamp("season_start_date").notNull(),
    seasonEndDate: timestamp("season_end_date").notNull(),
    ageReferenceMode: tarifAgeReferenceMode("age_reference_mode").notNull().default("season_start"),
    cumulMode: tarifCumulMode("cumul_mode").notNull().default("best_only"),
    reductionCapPercent: integer("reduction_cap_percent"),
    roundingIncrement: tarifRoundingIncrement("rounding_increment").notNull().default("none"),
    status: tarifGridStatus("status").notNull().default("draft"),
    createdByUserId: text("created_by_user_id")
      .notNull()
      .references(() => user.id),
    activatedAt: timestamp("activated_at"),
    archivedAt: timestamp("archived_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("tarif_grid_organizationId_idx").on(table.organizationId),
    index("tarif_grid_familyId_idx").on(table.familyId),
    // Only one active grid per club+season, across all versions of a family.
    uniqueIndex("tarif_grid_active_per_org_season_uidx")
      .on(table.organizationId, table.seasonLabel)
      .where(sql`${table.status} = 'active'`),
  ],
);

export const tarifAgeCategory = pgTable(
  "tarif_age_category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    tarifGridId: text("tarif_grid_id")
      .notNull()
      .references(() => tarifGrid.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    minAge: integer("min_age").notNull(),
    maxAge: integer("max_age"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("tarif_age_category_tarifGridId_idx").on(table.tarifGridId)],
);

export const tarifBaseRate = pgTable(
  "tarif_base_rate",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    tarifGridId: text("tarif_grid_id")
      .notNull()
      .references(() => tarifGrid.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => tarifAgeCategory.id, { onDelete: "cascade" }),
    membershipFeeCents: integer("membership_fee_cents").notNull().default(0),
    licenseFeeCents: integer("license_fee_cents").notNull().default(0),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("tarif_base_rate_grid_category_uidx").on(table.tarifGridId, table.categoryId),
  ],
);

/** Category x lessons-per-week price table (0-4, 4 = "4 or more"). No computed degressivity. */
export const tarifLessonRate = pgTable(
  "tarif_lesson_rate",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    tarifGridId: text("tarif_grid_id")
      .notNull()
      .references(() => tarifGrid.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => tarifAgeCategory.id, { onDelete: "cascade" }),
    lessonsPerWeek: integer("lessons_per_week").notNull(),
    priceCents: integer("price_cents").notNull(),
  },
  (table) => [
    uniqueIndex("tarif_lesson_rate_grid_category_lessons_uidx").on(
      table.tarifGridId,
      table.categoryId,
      table.lessonsPerWeek,
    ),
  ],
);

export const tarifAdditionalLine = pgTable(
  "tarif_additional_line",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    tarifGridId: text("tarif_grid_id")
      .notNull()
      .references(() => tarifGrid.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amountCents: integer("amount_cents").notNull(),
    // TarifCondition[] (AND implicit) — validated by a Zod discriminated union at the API layer.
    conditions: jsonb("conditions").notNull().default(sql`'[]'::jsonb`),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("tarif_additional_line_tarifGridId_idx").on(table.tarifGridId)],
);

export const tarifRule = pgTable(
  "tarif_rule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    tarifGridId: text("tarif_grid_id")
      .notNull()
      .references(() => tarifGrid.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    // TarifCondition[] (AND implicit) — validated by a Zod discriminated union at the API layer.
    conditions: jsonb("conditions").notNull(),
    effectType: tarifRuleEffectType("effect_type").notNull(),
    // Cents for amount effects, basis points (1/100 of a percent) for percent effects.
    effectValue: integer("effect_value").notNull(),
    targetType: tarifRuleTargetType("target_type").notNull(),
    targetAdditionalLineId: text("target_additional_line_id").references(
      () => tarifAdditionalLine.id,
      { onDelete: "cascade" },
    ),
    exclusivityGroup: text("exclusivity_group"),
    isActive: boolean("is_active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("tarif_rule_tarifGridId_idx").on(table.tarifGridId)],
);

export const tarifGridAuditLog = pgTable(
  "tarif_grid_audit_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    tarifGridId: text("tarif_grid_id")
      .notNull()
      .references(() => tarifGrid.id, { onDelete: "cascade" }),
    actorUserId: text("actor_user_id")
      .notNull()
      .references(() => user.id),
    action: tarifAuditAction("action").notNull(),
    summary: text("summary"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("tarif_grid_audit_log_tarifGridId_idx").on(table.tarifGridId)],
);

/**
 * A real member's cotisation for one club season, computed once by the pricing engine (via
 * server/pricing/lib/member-cotisation.ts::ensureMemberCotisationRecord) and then FROZEN —
 * amountCents/breakdownSnapshot never change afterwards even if the grid is edited later, so a
 * receipt or a "paid" record always reflects what was actually charged. Payment tracking
 * (status/paidAt/paidMethod/notes/reminders) replaces the old flat `duesAssignment` flow for
 * cotisations — that table is left untouched in the DB but no longer created from the UI.
 */
export const memberCotisation = pgTable(
  "member_cotisation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tarifGridId: text("tarif_grid_id")
      .notNull()
      .references(() => tarifGrid.id, { onDelete: "cascade" }),
    seasonLabel: text("season_label").notNull(),
    amountCents: integer("amount_cents").notNull(),
    // Full engine Breakdown, frozen at generation time — the source for the detail view + receipt.
    breakdownSnapshot: jsonb("breakdown_snapshot").notNull(),
    status: memberCotisationStatus("status").notNull().default("pending"),
    paidAt: timestamp("paid_at"),
    paidMethod: text("paid_method"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("member_cotisation_org_user_season_uidx").on(
      table.organizationId,
      table.userId,
      table.seasonLabel,
    ),
    index("member_cotisation_organizationId_idx").on(table.organizationId),
    index("member_cotisation_organizationId_seasonLabel_idx").on(
      table.organizationId,
      table.seasonLabel,
    ),
  ],
);

export const memberCotisationReminderLog = pgTable(
  "member_cotisation_reminder_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    memberCotisationId: text("member_cotisation_id")
      .notNull()
      .references(() => memberCotisation.id, { onDelete: "cascade" }),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    sentByUserId: text("sent_by_user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [index("member_cotisation_reminder_log_memberCotisationId_idx").on(table.memberCotisationId)],
);
