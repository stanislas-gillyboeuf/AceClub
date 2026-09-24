ALTER TABLE "member_cotisation" ADD COLUMN "issued_at" timestamp;
--> statement-breakpoint
UPDATE "member_cotisation" SET "issued_at" = "created_at" WHERE "issued_at" IS NULL;
