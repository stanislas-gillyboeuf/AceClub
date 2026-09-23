CREATE TYPE "public"."member_cotisation_status" AS ENUM('pending', 'paid', 'waived');--> statement-breakpoint
CREATE TABLE "club_member_tag" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"tag_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_cotisation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"tarif_grid_id" text NOT NULL,
	"season_label" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"breakdown_snapshot" jsonb NOT NULL,
	"status" "member_cotisation_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"paid_method" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_cotisation_reminder_log" (
	"id" text PRIMARY KEY NOT NULL,
	"member_cotisation_id" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"sent_by_user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD COLUMN "licensed_elsewhere" boolean;--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD COLUMN "household_rank" integer;--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD COLUMN "commune_insee" text;--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD COLUMN "commune_name" text;--> statement-breakpoint
ALTER TABLE "club_member_tag" ADD CONSTRAINT "club_member_tag_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_member_tag" ADD CONSTRAINT "club_member_tag_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "club_member_tag" ADD CONSTRAINT "club_member_tag_tag_id_club_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."club_tag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_cotisation" ADD CONSTRAINT "member_cotisation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_cotisation" ADD CONSTRAINT "member_cotisation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_cotisation" ADD CONSTRAINT "member_cotisation_tarif_grid_id_tarif_grid_id_fk" FOREIGN KEY ("tarif_grid_id") REFERENCES "public"."tarif_grid"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_cotisation_reminder_log" ADD CONSTRAINT "member_cotisation_reminder_log_member_cotisation_id_member_cotisation_id_fk" FOREIGN KEY ("member_cotisation_id") REFERENCES "public"."member_cotisation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_cotisation_reminder_log" ADD CONSTRAINT "member_cotisation_reminder_log_sent_by_user_id_user_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "club_member_tag_org_user_tag_uidx" ON "club_member_tag" USING btree ("organization_id","user_id","tag_id");--> statement-breakpoint
CREATE INDEX "club_member_tag_organizationId_userId_idx" ON "club_member_tag" USING btree ("organization_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "member_cotisation_org_user_season_uidx" ON "member_cotisation" USING btree ("organization_id","user_id","season_label");--> statement-breakpoint
CREATE INDEX "member_cotisation_organizationId_idx" ON "member_cotisation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_cotisation_organizationId_seasonLabel_idx" ON "member_cotisation" USING btree ("organization_id","season_label");--> statement-breakpoint
CREATE INDEX "member_cotisation_reminder_log_memberCotisationId_idx" ON "member_cotisation_reminder_log" USING btree ("member_cotisation_id");