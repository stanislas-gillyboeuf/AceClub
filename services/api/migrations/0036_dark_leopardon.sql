CREATE TYPE "public"."tournament_format" AS ENUM('single_elimination');--> statement-breakpoint
CREATE TYPE "public"."tournament_match_status" AS ENUM('pending', 'ready', 'bye', 'completed');--> statement-breakpoint
CREATE TYPE "public"."tournament_status" AS ENUM('draft', 'in_progress', 'completed');--> statement-breakpoint
CREATE TABLE "tournament" (
	"id" text PRIMARY KEY NOT NULL,
	"event_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"sport" "sport_type" NOT NULL,
	"format" "tournament_format" DEFAULT 'single_elimination' NOT NULL,
	"draw_size" integer NOT NULL,
	"status" "tournament_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tournament_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "tournament_match" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"round" integer NOT NULL,
	"position" integer NOT NULL,
	"player1_user_id" text,
	"player2_user_id" text,
	"winner_user_id" text,
	"status" "tournament_match_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament_seed" (
	"id" text PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"user_id" text NOT NULL,
	"seed_number" integer NOT NULL,
	"skill_level" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_event_id_event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_match" ADD CONSTRAINT "tournament_match_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_match" ADD CONSTRAINT "tournament_match_player1_user_id_user_id_fk" FOREIGN KEY ("player1_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_match" ADD CONSTRAINT "tournament_match_player2_user_id_user_id_fk" FOREIGN KEY ("player2_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_match" ADD CONSTRAINT "tournament_match_winner_user_id_user_id_fk" FOREIGN KEY ("winner_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_seed" ADD CONSTRAINT "tournament_seed_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tournament_seed" ADD CONSTRAINT "tournament_seed_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tournament_organizationId_idx" ON "tournament" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tournament_match_tournamentId_round_position_uidx" ON "tournament_match" USING btree ("tournament_id","round","position");--> statement-breakpoint
CREATE INDEX "tournament_match_tournamentId_idx" ON "tournament_match" USING btree ("tournament_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tournament_seed_tournamentId_userId_uidx" ON "tournament_seed" USING btree ("tournament_id","user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "tournament_seed_tournamentId_seedNumber_uidx" ON "tournament_seed" USING btree ("tournament_id","seed_number");