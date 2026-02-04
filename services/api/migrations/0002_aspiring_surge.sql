ALTER TABLE "conversation" DROP CONSTRAINT "conversation_match_id_match_id_fk";
--> statement-breakpoint
DROP INDEX "conversation_matchId_idx";--> statement-breakpoint
DROP INDEX "conversation_matchId_unique";--> statement-breakpoint
ALTER TABLE "match" ADD COLUMN "conversation_id" text;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "match_conversationId_idx" ON "match" USING btree ("conversation_id");--> statement-breakpoint
ALTER TABLE "conversation" DROP COLUMN "match_id";