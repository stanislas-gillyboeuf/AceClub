CREATE TYPE "public"."course_attendance_status" AS ENUM('present', 'absent');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'coach_message';--> statement-breakpoint
CREATE TABLE "course_attendance" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"user_id" text NOT NULL,
	"status" "course_attendance_status" NOT NULL,
	"marked_by_user_id" text NOT NULL,
	"marked_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vacation_period" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "course_attendance" ADD CONSTRAINT "course_attendance_booking_id_court_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."court_booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_attendance" ADD CONSTRAINT "course_attendance_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_attendance" ADD CONSTRAINT "course_attendance_marked_by_user_id_user_id_fk" FOREIGN KEY ("marked_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vacation_period" ADD CONSTRAINT "vacation_period_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_attendance_bookingId_userId_uidx" ON "course_attendance" USING btree ("booking_id","user_id");--> statement-breakpoint
CREATE INDEX "course_attendance_userId_idx" ON "course_attendance" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "vacation_period_organizationId_idx" ON "vacation_period" USING btree ("organization_id");