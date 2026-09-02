ALTER TABLE "match_intent" ADD COLUMN "sport" "sport_type";--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "secondary_sport" "sport_type";--> statement-breakpoint
ALTER TABLE "user_preference" ADD COLUMN "secondary_skill_level" text;