CREATE TABLE "demo_availability_rule" (
	"id" text PRIMARY KEY NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'confirmed' NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"club_name" text NOT NULL,
	"phone" text,
	"role" text NOT NULL,
	"note" text,
	"utm_source" text,
	"cancel_token" text NOT NULL,
	"google_event_id" text,
	"google_meet_link" text,
	"reminder_day_before_sent_at" timestamp with time zone,
	"reminder_hour_before_sent_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_booking_settings" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"demo_duration_minutes" integer DEFAULT 20 NOT NULL,
	"buffer_before_minutes" integer DEFAULT 10 NOT NULL,
	"buffer_after_minutes" integer DEFAULT 10 NOT NULL,
	"min_notice_hours" integer DEFAULT 8 NOT NULL,
	"horizon_days" integer DEFAULT 21 NOT NULL,
	"max_per_day" integer DEFAULT 3 NOT NULL,
	"reference_timezone" text DEFAULT 'Europe/Paris' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demo_manual_block" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "google_calendar_connection" (
	"id" text PRIMARY KEY DEFAULT 'singleton' NOT NULL,
	"encrypted_refresh_token" text NOT NULL,
	"calendar_id" text DEFAULT 'primary' NOT NULL,
	"connected_by_user_id" text,
	"status" text DEFAULT 'connected' NOT NULL,
	"last_error_message" text,
	"last_error_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "demo_availability_rule_dayOfWeek_idx" ON "demo_availability_rule" USING btree ("day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "demo_booking_cancelToken_uidx" ON "demo_booking" USING btree ("cancel_token");--> statement-breakpoint
CREATE UNIQUE INDEX "demo_booking_startAt_confirmed_uidx" ON "demo_booking" USING btree ("start_at") WHERE "demo_booking"."status" = 'confirmed';--> statement-breakpoint
CREATE INDEX "demo_booking_startAt_idx" ON "demo_booking" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "demo_manual_block_date_idx" ON "demo_manual_block" USING btree ("date");