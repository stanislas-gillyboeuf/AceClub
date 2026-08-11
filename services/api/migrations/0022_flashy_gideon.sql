CREATE TYPE "public"."court_booking_status" AS ENUM('confirmed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."court_surface" AS ENUM('clay', 'hard', 'grass', 'carpet');--> statement-breakpoint
CREATE TABLE "court" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"surface" "court_surface",
	"indoor" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "court_booking" (
	"id" text PRIMARY KEY NOT NULL,
	"court_id" text NOT NULL,
	"user_id" text NOT NULL,
	"start_at" timestamp NOT NULL,
	"end_at" timestamp NOT NULL,
	"status" "court_booking_status" DEFAULT 'confirmed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "court" ADD CONSTRAINT "court_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_booking" ADD CONSTRAINT "court_booking_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."court"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_booking" ADD CONSTRAINT "court_booking_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "court_organizationId_idx" ON "court" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "court_booking_userId_idx" ON "court_booking" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "court_booking_startAt_idx" ON "court_booking" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "court_booking_courtId_startAt_idx" ON "court_booking" USING btree ("court_id","start_at");