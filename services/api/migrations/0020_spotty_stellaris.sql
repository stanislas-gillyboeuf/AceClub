ALTER TYPE "public"."notification_type" ADD VALUE 'match_liked';--> statement-breakpoint
CREATE TABLE "match_like" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_like" ADD CONSTRAINT "match_like_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_like" ADD CONSTRAINT "match_like_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_like_matchId_idx" ON "match_like" USING btree ("match_id");--> statement-breakpoint
CREATE UNIQUE INDEX "match_like_matchId_userId_unique" ON "match_like" USING btree ("match_id","user_id");