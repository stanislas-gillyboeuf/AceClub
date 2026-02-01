CREATE TYPE "public"."conversation_type" AS ENUM('match', 'group');--> statement-breakpoint
CREATE TABLE "conversation" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text,
	"name" text,
	"type" "conversation_type" DEFAULT 'match' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_message_at" timestamp,
	"last_message_preview" text,
	"last_message_sender_id" text
);
--> statement-breakpoint
CREATE TABLE "conversation_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"user_id" text NOT NULL,
	"last_read_at" timestamp,
	"unread_count" integer DEFAULT 0 NOT NULL,
	"is_muted" boolean DEFAULT false NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message" (
	"id" text PRIMARY KEY NOT NULL,
	"conversation_id" text NOT NULL,
	"sender_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp,
	"client_message_id" text
);
--> statement-breakpoint
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "conversation_participant" ADD CONSTRAINT "conversation_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_conversation_id_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversation"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message" ADD CONSTRAINT "message_sender_id_user_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "conversation_matchId_idx" ON "conversation" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "conversation_lastMessageAt_idx" ON "conversation" USING btree ("last_message_at");--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_matchId_unique" ON "conversation" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "conversation_participant_conversationId_idx" ON "conversation_participant" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "conversation_participant_userId_idx" ON "conversation_participant" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "conversation_participant_unique" ON "conversation_participant" USING btree ("conversation_id","user_id");--> statement-breakpoint
CREATE INDEX "message_conversationId_idx" ON "message" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "message_senderId_idx" ON "message" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "message_conversationId_createdAt_idx" ON "message" USING btree ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "message_clientMessageId_idx" ON "message" USING btree ("client_message_id");