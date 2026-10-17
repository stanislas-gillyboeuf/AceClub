CREATE TABLE "course_messaging_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "course_id" text;--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "announcements_only" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "pinned_message_id" text;--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "organization_id" text;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD COLUMN "left_manually" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "course_messaging_settings" ADD CONSTRAINT "course_messaging_settings_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "course_messaging_settings_organizationId_uidx" ON "course_messaging_settings" USING btree ("organization_id");--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_course_id_course_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_courseId_uidx" ON "conversation" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "conversation_organizationId_idx" ON "conversation" USING btree ("organization_id");