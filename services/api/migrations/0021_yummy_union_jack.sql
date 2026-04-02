DO $$ BEGIN
  CREATE TYPE "public"."game_config_category" AS ENUM('aces_rewards', 'level_formula', 'streak_multiplier');
EXCEPTION WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_config" (
	"id" text PRIMARY KEY NOT NULL,
	"category" "game_config_category" NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"updated_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "game_config_category_key_uidx" ON "game_config" USING btree ("category","key");--> statement-breakpoint
INSERT INTO "game_config" ("id", "category", "key", "value", "description") VALUES
  ('01JQXG0001ACES_PARTICIPATION', 'aces_rewards', 'MATCH_PARTICIPATION', '100', 'Aces pour participation a un match'),
  ('01JQXG0002ACES_VICTORY', 'aces_rewards', 'MATCH_VICTORY', '300', 'Aces bonus pour victoire'),
  ('01JQXG0003ACES_CHALLENGE', 'aces_rewards', 'CHALLENGE_BASE', '150', 'Aces de base pour un defi'),
  ('01JQXG0004LEVEL_BASE', 'level_formula', 'BASE_ACES', '100', 'Aces de base par niveau'),
  ('01JQXG0005LEVEL_GROWTH', 'level_formula', 'GROWTH_RATE', '1.15', 'Taux de croissance exponentiel'),
  ('01JQXG0006LEVEL_MAX', 'level_formula', 'MAX_LEVEL', '100', 'Niveau maximum'),
  ('01JQXG0007STREAK_W1', 'streak_multiplier', 'week_1', '1.0', 'Multiplicateur semaine 1'),
  ('01JQXG0008STREAK_W2', 'streak_multiplier', 'week_2', '1.1', 'Multiplicateur semaine 2'),
  ('01JQXG0009STREAK_W34', 'streak_multiplier', 'week_3_4', '1.2', 'Multiplicateur semaines 3-4'),
  ('01JQXG000ASTREAK_W57', 'streak_multiplier', 'week_5_7', '1.3', 'Multiplicateur semaines 5-7'),
  ('01JQXG000BSTREAK_W811', 'streak_multiplier', 'week_8_11', '1.5', 'Multiplicateur semaines 8-11'),
  ('01JQXG000CSTREAK_W12P', 'streak_multiplier', 'week_12_plus', '2.0', 'Multiplicateur semaine 12+')
ON CONFLICT ("id") DO NOTHING;