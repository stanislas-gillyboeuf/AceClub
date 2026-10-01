CREATE TYPE "public"."member_source" AS ENUM('csv_import', 'club_code', 'open_club', 'admin_added', 'invitation');--> statement-breakpoint
ALTER TABLE "member" ADD COLUMN "source" "member_source";