CREATE TYPE "public"."court_booking_kind" AS ENUM('member', 'admin_block', 'course');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('active', 'cancelled');--> statement-breakpoint
CREATE TABLE "course" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"coach_user_id" text NOT NULL,
	"court_id" text NOT NULL,
	"name" text NOT NULL,
	"weekday" integer NOT NULL,
	"start_time" text NOT NULL,
	"duration_minutes" integer NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"status" "course_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_enrollment" (
	"id" text PRIMARY KEY NOT NULL,
	"course_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "court_booking" ADD COLUMN "kind" "court_booking_kind" DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "court_booking" ADD COLUMN "course_id" text;--> statement-breakpoint
ALTER TABLE "court_booking" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "court_booking" ADD COLUMN "reminder_sent_at" timestamp;--> statement-breakpoint
ALTER TABLE "club_member_profile" ADD COLUMN "medical_certificate_valid_until" timestamp;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_coach_user_id_user_id_fk" FOREIGN KEY ("coach_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course" ADD CONSTRAINT "course_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."court"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollment" ADD CONSTRAINT "course_enrollment_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollment" ADD CONSTRAINT "course_enrollment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "course_organizationId_idx" ON "course" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "course_coachUserId_idx" ON "course" USING btree ("coach_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "course_enrollment_courseId_userId_uidx" ON "course_enrollment" USING btree ("course_id","user_id");--> statement-breakpoint
CREATE INDEX "course_enrollment_userId_idx" ON "course_enrollment" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "court_booking_courseId_idx" ON "court_booking" USING btree ("course_id");