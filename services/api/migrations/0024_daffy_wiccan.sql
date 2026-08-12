CREATE TYPE "public"."court_cancellation_policy" AS ENUM('anytime', 'window', 'disabled');--> statement-breakpoint
CREATE TABLE "court_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"opening_hour" integer DEFAULT 8 NOT NULL,
	"closing_hour" integer DEFAULT 22 NOT NULL,
	"max_bookings_per_week_weekday" integer,
	"max_bookings_per_week_weekend" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "price_per_hour" integer;--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "slot_duration_minutes" integer DEFAULT 60 NOT NULL;--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "cancellation_policy" "court_cancellation_policy" DEFAULT 'anytime' NOT NULL;--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "cancellation_window_hours" integer;--> statement-breakpoint
ALTER TABLE "court_booking" ADD COLUMN "purpose" text;--> statement-breakpoint
ALTER TABLE "court_booking" ADD COLUMN "booked_as_club" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "court_settings" ADD CONSTRAINT "court_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "court_settings_organizationId_uidx" ON "court_settings" USING btree ("organization_id");