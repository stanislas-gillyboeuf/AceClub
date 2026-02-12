CREATE TYPE "public"."event_participant_status" AS ENUM('registered', 'waitlisted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('open', 'closed', 'completed', 'cancelled', 'archived', 'pending');--> statement-breakpoint
CREATE TYPE "public"."event_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "event" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"address" text,
	"max_participants" integer,
	"visibility" "event_visibility" DEFAULT 'public' NOT NULL,
	"status" "event_status" DEFAULT 'pending' NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "event_participant_status" DEFAULT 'registered' NOT NULL,
	"registered_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event" ADD CONSTRAINT "event_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participant" ADD CONSTRAINT "event_participant_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_participant" ADD CONSTRAINT "event_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_organizationId_idx" ON "event" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "event_startDate_idx" ON "event" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "event_status_idx" ON "event" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_participant_eventId_idx" ON "event_participant" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_participant_userId_idx" ON "event_participant" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "event_participant_eventId_userId_idx" ON "event_participant" USING btree ("event_id","user_id");