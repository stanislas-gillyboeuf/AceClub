ALTER TYPE "public"."message_type" ADD VALUE 'match_request';--> statement-breakpoint
CREATE TABLE "match_intent_teammate" (
	"id" text PRIMARY KEY NOT NULL,
	"match_intent_id" text NOT NULL,
	"slot_index" integer NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_intent" ADD COLUMN "is_flexible_date" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "match_request" ADD COLUMN "slot_index" integer;--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "match_request_id" text;--> statement-breakpoint
ALTER TABLE "match_intent_teammate" ADD CONSTRAINT "match_intent_teammate_match_intent_id_match_intent_id_fk" FOREIGN KEY ("match_intent_id") REFERENCES "public"."match_intent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_intent_teammate" ADD CONSTRAINT "match_intent_teammate_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "match_intent_teammate_unique" ON "match_intent_teammate" USING btree ("match_intent_id","slot_index");--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_match_request_id_match_request_id_fk" FOREIGN KEY ("match_request_id") REFERENCES "public"."match_request"("id") ON DELETE no action ON UPDATE no action;