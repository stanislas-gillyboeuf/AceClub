ALTER TYPE "public"."notification_type" ADD VALUE 'match_request_update';--> statement-breakpoint
CREATE TABLE "organization_notification_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"streak_warning" boolean DEFAULT true NOT NULL,
	"challenge_assigned" boolean DEFAULT true NOT NULL,
	"match_request_update" boolean DEFAULT true NOT NULL,
	"match_liked" boolean DEFAULT true NOT NULL,
	"new_message" boolean DEFAULT true NOT NULL,
	"booking_reminder" boolean DEFAULT true NOT NULL,
	"class_reminder" boolean DEFAULT true NOT NULL,
	"coach_message" boolean DEFAULT true NOT NULL,
	"cotisation_request_email" boolean DEFAULT true NOT NULL,
	"cotisation_reminder_email" boolean DEFAULT true NOT NULL,
	"invitation_accepted" boolean DEFAULT true NOT NULL,
	"club_announcement" boolean DEFAULT true NOT NULL,
	"member_alert_digest_email" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_notification_settings" ADD CONSTRAINT "organization_notification_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "org_notification_settings_organizationId_uidx" ON "organization_notification_settings" USING btree ("organization_id");