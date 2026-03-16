CREATE TABLE "match_photo" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_photo" ADD CONSTRAINT "match_photo_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_photo" ADD CONSTRAINT "match_photo_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_photo_matchId_idx" ON "match_photo" USING btree ("match_id");--> statement-breakpoint
CREATE UNIQUE INDEX "match_photo_matchId_userId_unique" ON "match_photo" USING btree ("match_id","user_id");