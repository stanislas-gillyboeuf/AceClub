CREATE TYPE "public"."dues_assignment_status" AS ENUM('pending', 'paid', 'waived');--> statement-breakpoint
CREATE TABLE "dues_assignment" (
	"id" text PRIMARY KEY NOT NULL,
	"dues_type_id" text NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"status" "dues_assignment_status" DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"paid_method" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dues_reminder_log" (
	"id" text PRIMARY KEY NOT NULL,
	"dues_assignment_id" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"sent_by_user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dues_type" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"name" text NOT NULL,
	"amount_cents" integer NOT NULL,
	"due_date" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dues_assignment" ADD CONSTRAINT "dues_assignment_dues_type_id_dues_type_id_fk" FOREIGN KEY ("dues_type_id") REFERENCES "public"."dues_type"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dues_assignment" ADD CONSTRAINT "dues_assignment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dues_assignment" ADD CONSTRAINT "dues_assignment_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dues_reminder_log" ADD CONSTRAINT "dues_reminder_log_dues_assignment_id_dues_assignment_id_fk" FOREIGN KEY ("dues_assignment_id") REFERENCES "public"."dues_assignment"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dues_reminder_log" ADD CONSTRAINT "dues_reminder_log_sent_by_user_id_user_id_fk" FOREIGN KEY ("sent_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dues_type" ADD CONSTRAINT "dues_type_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dues_assignment_duesTypeId_userId_uidx" ON "dues_assignment" USING btree ("dues_type_id","user_id");--> statement-breakpoint
CREATE INDEX "dues_assignment_organizationId_idx" ON "dues_assignment" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "dues_assignment_status_idx" ON "dues_assignment" USING btree ("status");--> statement-breakpoint
CREATE INDEX "dues_reminder_log_duesAssignmentId_idx" ON "dues_reminder_log" USING btree ("dues_assignment_id");--> statement-breakpoint
CREATE INDEX "dues_type_organizationId_idx" ON "dues_type" USING btree ("organization_id");