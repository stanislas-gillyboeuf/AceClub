CREATE TYPE "public"."user_report_status" AS ENUM('open', 'reviewed', 'dismissed');--> statement-breakpoint
CREATE TABLE "user_block" (
	"id" text PRIMARY KEY NOT NULL,
	"blocker_user_id" text NOT NULL,
	"blocked_user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_report" (
	"id" text PRIMARY KEY NOT NULL,
	"reporter_user_id" text NOT NULL,
	"reported_user_id" text NOT NULL,
	"reason" text NOT NULL,
	"context" text,
	"status" "user_report_status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"reviewed_at" timestamp,
	"reviewed_by_user_id" text
);
--> statement-breakpoint
ALTER TABLE "user_block" ADD CONSTRAINT "user_block_blocker_user_id_user_id_fk" FOREIGN KEY ("blocker_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_block" ADD CONSTRAINT "user_block_blocked_user_id_user_id_fk" FOREIGN KEY ("blocked_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_report" ADD CONSTRAINT "user_report_reporter_user_id_user_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_report" ADD CONSTRAINT "user_report_reported_user_id_user_id_fk" FOREIGN KEY ("reported_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_report" ADD CONSTRAINT "user_report_reviewed_by_user_id_user_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "user_block_blocker_blocked_uidx" ON "user_block" USING btree ("blocker_user_id","blocked_user_id");--> statement-breakpoint
CREATE INDEX "user_block_blockerUserId_idx" ON "user_block" USING btree ("blocker_user_id");--> statement-breakpoint
CREATE INDEX "user_block_blockedUserId_idx" ON "user_block" USING btree ("blocked_user_id");--> statement-breakpoint
CREATE INDEX "user_report_reportedUserId_idx" ON "user_report" USING btree ("reported_user_id");--> statement-breakpoint
CREATE INDEX "user_report_status_idx" ON "user_report" USING btree ("status");