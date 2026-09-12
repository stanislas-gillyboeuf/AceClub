CREATE TABLE "club_member_profile" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"license_number" text,
	"license_valid_until" timestamp,
	"phone_override" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "restricted_dashboard_access" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD CONSTRAINT "club_member_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD CONSTRAINT "club_member_profile_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "club_member_profile_userId_organizationId_uidx" ON "club_member_profile" USING btree ("user_id","organization_id");--> statement-breakpoint
CREATE INDEX "club_member_profile_organizationId_idx" ON "club_member_profile" USING btree ("organization_id");