-- First drop default, then convert status column to text so we can update values
ALTER TABLE "event" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
-- Now migrate existing event status values to new enum values
UPDATE "event" SET "status" = 'draft' WHERE "status" = 'pending';--> statement-breakpoint
UPDATE "event" SET "status" = 'on_sale' WHERE "status" = 'open';--> statement-breakpoint
UPDATE "event" SET "status" = 'completed' WHERE "status" = 'closed';--> statement-breakpoint
-- Drop old enum and create new one
DROP TYPE "public"."event_status";--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'presale', 'on_sale', 'completed', 'full', 'cancelled', 'archived');--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "status" SET DEFAULT 'draft'::"public"."event_status";--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "status" SET DATA TYPE "public"."event_status" USING "status"::"public"."event_status";--> statement-breakpoint
-- First drop default, then convert visibility column to text so we can update values
ALTER TABLE "event" ALTER COLUMN "visibility" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "visibility" SET DATA TYPE text;--> statement-breakpoint
-- Migrate existing visibility values
UPDATE "event" SET "visibility" = 'public' WHERE "visibility" = 'private';--> statement-breakpoint
-- Drop old enum and create new one
DROP TYPE "public"."event_visibility";--> statement-breakpoint
CREATE TYPE "public"."event_visibility" AS ENUM('public', 'organization');--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "visibility" SET DEFAULT 'public'::"public"."event_visibility";--> statement-breakpoint
ALTER TABLE "event" ALTER COLUMN "visibility" SET DATA TYPE "public"."event_visibility" USING "visibility"::"public"."event_visibility";--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "cover_image" text;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "latitude" double precision;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "longitude" double precision;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "is_free" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "price" integer;--> statement-breakpoint
ALTER TABLE "event" ADD COLUMN "payment_link" text;--> statement-breakpoint
CREATE INDEX "event_visibility_idx" ON "event" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "event_createdAt_idx" ON "event" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "event_latitude_longitude_idx" ON "event" USING btree ("latitude","longitude");
