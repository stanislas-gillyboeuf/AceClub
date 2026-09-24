CREATE TABLE "household" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"payer_user_id" text,
	"contact_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD COLUMN "household_id" text;--> statement-breakpoint
ALTER TABLE "member_cotisation" ADD COLUMN "household_rank_frozen" integer;--> statement-breakpoint
ALTER TABLE "household" ADD CONSTRAINT "household_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "household" ADD CONSTRAINT "household_payer_user_id_user_id_fk" FOREIGN KEY ("payer_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "household_organizationId_idx" ON "household" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD CONSTRAINT "club_member_profile_household_id_household_id_fk" FOREIGN KEY ("household_id") REFERENCES "public"."household"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "club_member_profile_householdId_idx" ON "club_member_profile" USING btree ("household_id");