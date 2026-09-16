CREATE TYPE "public"."subscription_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
CREATE TABLE "club_member_note" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"author_user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "club_level_category" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"sport" "sport_type" NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"subscription_type_id" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp,
	"amount_due_cents" integer DEFAULT 0 NOT NULL,
	"status" "subscription_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_type" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"price_cents" integer,
	"duration_days" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "skill_level_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "skill_level_verified_by_user_id" text;--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "skill_level_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD COLUMN "is_vip" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "club_member_note" ADD CONSTRAINT "club_member_note_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_member_note" ADD CONSTRAINT "club_member_note_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_member_note" ADD CONSTRAINT "club_member_note_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_level_category" ADD CONSTRAINT "club_level_category_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_subscription" ADD CONSTRAINT "member_subscription_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_subscription" ADD CONSTRAINT "member_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_subscription" ADD CONSTRAINT "member_subscription_subscription_type_id_subscription_type_id_fk" FOREIGN KEY ("subscription_type_id") REFERENCES "public"."subscription_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription_type" ADD CONSTRAINT "subscription_type_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "club_member_note_organizationId_userId_idx" ON "club_member_note" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "club_level_category_org_sport_name_uidx" ON "club_level_category" USING btree ("organization_id","sport","name");--> statement-breakpoint
CREATE INDEX "club_level_category_organizationId_idx" ON "club_level_category" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_subscription_organizationId_userId_idx" ON "member_subscription" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE INDEX "subscription_type_organizationId_idx" ON "subscription_type" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_skill_level_verified_by_user_id_user_id_fk" FOREIGN KEY ("skill_level_verified_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;