CREATE TYPE "public"."broadcast_channel" AS ENUM('email', 'push', 'both');--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'club_announcement';--> statement-breakpoint
CREATE TABLE "broadcast_message" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"channel" "broadcast_channel" NOT NULL,
	"segment" text NOT NULL,
	"recipient_count" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "broadcast_message" ADD CONSTRAINT "broadcast_message_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "broadcast_message" ADD CONSTRAINT "broadcast_message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "broadcast_message_organizationId_idx" ON "broadcast_message" USING btree ("organization_id");