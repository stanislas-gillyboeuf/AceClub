CREATE TYPE "public"."tarif_age_reference_mode" AS ENUM('season_start', 'dec_31_start_year', 'season_end_year');--> statement-breakpoint
CREATE TYPE "public"."tarif_audit_action" AS ENUM('created', 'updated', 'activated', 'archived', 'duplicated');--> statement-breakpoint
CREATE TYPE "public"."tarif_cumul_mode" AS ENUM('cumulative', 'best_only');--> statement-breakpoint
CREATE TYPE "public"."tarif_grid_status" AS ENUM('draft', 'active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."tarif_rounding_increment" AS ENUM('none', 'fifty_cents', 'one_euro');--> statement-breakpoint
CREATE TYPE "public"."tarif_rule_effect_type" AS ENUM('percent_discount', 'fixed_discount', 'surcharge_amount', 'surcharge_percent', 'fixed_price');--> statement-breakpoint
CREATE TYPE "public"."tarif_rule_target_type" AS ENUM('membership', 'lessons', 'license', 'additional_line', 'total_excluding_license');--> statement-breakpoint
CREATE TABLE "club_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarif_additional_line" (
	"id" text PRIMARY KEY NOT NULL,
	"tarif_grid_id" text NOT NULL,
	"name" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"conditions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarif_age_category" (
	"id" text PRIMARY KEY NOT NULL,
	"tarif_grid_id" text NOT NULL,
	"name" text NOT NULL,
	"min_age" integer NOT NULL,
	"max_age" integer,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarif_base_rate" (
	"id" text PRIMARY KEY NOT NULL,
	"tarif_grid_id" text NOT NULL,
	"category_id" text NOT NULL,
	"membership_fee_cents" integer DEFAULT 0 NOT NULL,
	"license_fee_cents" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarif_grid" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"family_id" text NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"previous_version_id" text,
	"season_label" text NOT NULL,
	"season_start_date" timestamp NOT NULL,
	"season_end_date" timestamp NOT NULL,
	"age_reference_mode" "tarif_age_reference_mode" DEFAULT 'season_start' NOT NULL,
	"cumul_mode" "tarif_cumul_mode" DEFAULT 'best_only' NOT NULL,
	"reduction_cap_percent" integer,
	"rounding_increment" "tarif_rounding_increment" DEFAULT 'none' NOT NULL,
	"status" "tarif_grid_status" DEFAULT 'draft' NOT NULL,
	"created_by_user_id" text NOT NULL,
	"activated_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarif_grid_audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"tarif_grid_id" text NOT NULL,
	"actor_user_id" text NOT NULL,
	"action" "tarif_audit_action" NOT NULL,
	"summary" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarif_lesson_rate" (
	"id" text PRIMARY KEY NOT NULL,
	"tarif_grid_id" text NOT NULL,
	"category_id" text NOT NULL,
	"lessons_per_week" integer NOT NULL,
	"price_cents" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tarif_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"tarif_grid_id" text NOT NULL,
	"name" text NOT NULL,
	"conditions" jsonb NOT NULL,
	"effect_type" "tarif_rule_effect_type" NOT NULL,
	"effect_value" integer NOT NULL,
	"target_type" "tarif_rule_target_type" NOT NULL,
	"target_additional_line_id" text,
	"exclusivity_group" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "club_tag" ADD CONSTRAINT "club_tag_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_additional_line" ADD CONSTRAINT "tarif_additional_line_tarif_grid_id_tarif_grid_id_fk" FOREIGN KEY ("tarif_grid_id") REFERENCES "public"."tarif_grid"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_age_category" ADD CONSTRAINT "tarif_age_category_tarif_grid_id_tarif_grid_id_fk" FOREIGN KEY ("tarif_grid_id") REFERENCES "public"."tarif_grid"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_base_rate" ADD CONSTRAINT "tarif_base_rate_tarif_grid_id_tarif_grid_id_fk" FOREIGN KEY ("tarif_grid_id") REFERENCES "public"."tarif_grid"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_base_rate" ADD CONSTRAINT "tarif_base_rate_category_id_tarif_age_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tarif_age_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_grid" ADD CONSTRAINT "tarif_grid_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_grid" ADD CONSTRAINT "tarif_grid_created_by_user_id_user_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_grid_audit_log" ADD CONSTRAINT "tarif_grid_audit_log_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_grid_audit_log" ADD CONSTRAINT "tarif_grid_audit_log_tarif_grid_id_tarif_grid_id_fk" FOREIGN KEY ("tarif_grid_id") REFERENCES "public"."tarif_grid"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_grid_audit_log" ADD CONSTRAINT "tarif_grid_audit_log_actor_user_id_user_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_lesson_rate" ADD CONSTRAINT "tarif_lesson_rate_tarif_grid_id_tarif_grid_id_fk" FOREIGN KEY ("tarif_grid_id") REFERENCES "public"."tarif_grid"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_lesson_rate" ADD CONSTRAINT "tarif_lesson_rate_category_id_tarif_age_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."tarif_age_category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_rule" ADD CONSTRAINT "tarif_rule_tarif_grid_id_tarif_grid_id_fk" FOREIGN KEY ("tarif_grid_id") REFERENCES "public"."tarif_grid"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tarif_rule" ADD CONSTRAINT "tarif_rule_target_additional_line_id_tarif_additional_line_id_fk" FOREIGN KEY ("target_additional_line_id") REFERENCES "public"."tarif_additional_line"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "club_tag_org_name_uidx" ON "club_tag" USING btree ("organization_id","name");--> statement-breakpoint
CREATE INDEX "club_tag_organizationId_idx" ON "club_tag" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tarif_additional_line_tarifGridId_idx" ON "tarif_additional_line" USING btree ("tarif_grid_id");--> statement-breakpoint
CREATE INDEX "tarif_age_category_tarifGridId_idx" ON "tarif_age_category" USING btree ("tarif_grid_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tarif_base_rate_grid_category_uidx" ON "tarif_base_rate" USING btree ("tarif_grid_id","category_id");--> statement-breakpoint
CREATE INDEX "tarif_grid_organizationId_idx" ON "tarif_grid" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "tarif_grid_familyId_idx" ON "tarif_grid" USING btree ("family_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tarif_grid_active_per_org_season_uidx" ON "tarif_grid" USING btree ("organization_id","season_label") WHERE "tarif_grid"."status" = 'active';--> statement-breakpoint
CREATE INDEX "tarif_grid_audit_log_tarifGridId_idx" ON "tarif_grid_audit_log" USING btree ("tarif_grid_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tarif_lesson_rate_grid_category_lessons_uidx" ON "tarif_lesson_rate" USING btree ("tarif_grid_id","category_id","lessons_per_week");--> statement-breakpoint
CREATE INDEX "tarif_rule_tarifGridId_idx" ON "tarif_rule" USING btree ("tarif_grid_id");