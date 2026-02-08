ALTER TABLE "organization" ADD COLUMN "pin" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "pin_enabled" boolean DEFAULT false;--> statement-breakpoint
UPDATE "organization" SET "pin" = LPAD(FLOOR(1000 + RANDOM() * 9000)::int::text, 4, '0') WHERE "pin" IS NULL;