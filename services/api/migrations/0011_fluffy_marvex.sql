CREATE TYPE "public"."message_type" AS ENUM('text', 'voice', 'image');--> statement-breakpoint
ALTER TABLE "message" ALTER COLUMN "content" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "type" "message_type" DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "attachment_url" text;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "attachment_duration" integer;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "attachment_width" integer;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "attachment_height" integer;