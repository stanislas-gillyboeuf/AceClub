CREATE TYPE "public"."conversation_status" AS ENUM('active', 'pending_request', 'rejected');--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "status" "conversation_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "initiated_by_user_id" text;--> statement-breakpoint
ALTER TABLE "conversation" ADD COLUMN "request_notified_at" timestamp;--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_initiated_by_user_id_user_id_fk" FOREIGN KEY ("initiated_by_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;