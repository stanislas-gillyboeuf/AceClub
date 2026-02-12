CREATE TYPE "public"."match_sensation" AS ENUM('bad', 'average', 'good', 'great');--> statement-breakpoint
CREATE TABLE "match_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"sensation" "match_sensation" NOT NULL,
	"comment" text,
	"visible_to_club" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_feedback" ADD CONSTRAINT "match_feedback_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_feedback" ADD CONSTRAINT "match_feedback_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_feedback_matchId_idx" ON "match_feedback" USING btree ("match_id");--> statement-breakpoint
CREATE UNIQUE INDEX "match_feedback_matchId_userId_unique" ON "match_feedback" USING btree ("match_id","user_id");