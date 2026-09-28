CREATE TABLE "profile_share_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"revoked_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "profile_share_token" ADD CONSTRAINT "profile_share_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "profile_share_token_token_uidx" ON "profile_share_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "profile_share_token_userId_idx" ON "profile_share_token" USING btree ("user_id");