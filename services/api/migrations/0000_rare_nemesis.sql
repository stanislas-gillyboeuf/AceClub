CREATE TYPE "public"."match_side" AS ENUM('home', 'away');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'ongoing', 'finished');--> statement-breakpoint
CREATE TYPE "public"."match_type" AS ENUM('match', 'training');--> statement-breakpoint
CREATE TYPE "public"."match_intent_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."match_intent_type" AS ENUM('match', 'training');--> statement-breakpoint
CREATE TYPE "public"."match_request_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."swipe_action" AS ENUM('like', 'pass');--> statement-breakpoint
CREATE TYPE "public"."sport_type" AS ENUM('tennis', 'padel');--> statement-breakpoint
CREATE TYPE "public"."device_platform" AS ENUM('ios', 'android');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('match_request_accepted', 'invitation_accepted', 'new_match_request', 'match_reminder', 'challenge_assigned', 'streak_warning');--> statement-breakpoint
CREATE TYPE "public"."aces_transaction_type" AS ENUM('match_participation', 'match_victory', 'challenge_completed', 'streak_bonus', 'level_up_bonus', 'badge_bonus');--> statement-breakpoint
CREATE TYPE "public"."challenge_difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."challenge_type" AS ENUM('quantitative', 'social', 'performance');--> statement-breakpoint
CREATE TYPE "public"."user_challenge_status" AS ENUM('active', 'completed', 'expired');--> statement-breakpoint
CREATE TYPE "public"."badge_category" AS ENUM('level', 'achievement', 'milestone', 'special');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"email" text NOT NULL,
	"role" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"inviter_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member" (
	"id" text PRIMARY KEY NOT NULL,
	"organization_id" text NOT NULL,
	"user_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"metadata" text,
	CONSTRAINT "organization_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	"impersonated_by" text,
	"active_organization_id" text,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"role" text,
	"banned" boolean DEFAULT false,
	"ban_reason" text,
	"ban_expires" timestamp,
	"phone_number" text,
	"phone_number_verified" boolean,
	"onboarding_completed" boolean DEFAULT false,
	"is_ghost" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" text PRIMARY KEY NOT NULL,
	"created_by" text NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"type" "match_type" DEFAULT 'match' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"finished_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "match_comment" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"user_name" text NOT NULL,
	"user_image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"user_id" text NOT NULL,
	"side" "match_side" NOT NULL,
	"is_winner" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "set" (
	"id" text PRIMARY KEY NOT NULL,
	"match_id" text NOT NULL,
	"set_number" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "set_score" (
	"id" text PRIMARY KEY NOT NULL,
	"set_id" text NOT NULL,
	"participant_id" text NOT NULL,
	"games" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_intent" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"date" timestamp,
	"time" timestamp,
	"duration" integer DEFAULT 60,
	"type" "match_intent_type" DEFAULT 'match',
	"description" text,
	"status" "match_intent_status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "match_intent_swipe" (
	"id" text PRIMARY KEY NOT NULL,
	"match_intent_id" text NOT NULL,
	"swiper_user_id" text NOT NULL,
	"action" "swipe_action" NOT NULL,
	"swiped_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_request" (
	"id" text PRIMARY KEY NOT NULL,
	"match_intent_id" text NOT NULL,
	"requester_id" text NOT NULL,
	"receiver_id" text NOT NULL,
	"status" "match_request_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"responded_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_preference" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"sport" "sport_type" NOT NULL,
	"skill_level" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_preference_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "device_token" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token" text NOT NULL,
	"platform" "device_platform" DEFAULT 'ios' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"data" text,
	"reference_id" text,
	"reference_type" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" timestamp,
	"sent_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aces_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"type" "aces_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"reference_id" text,
	"reference_type" text,
	"description" text,
	"multiplier" real DEFAULT 1,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_level" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"total_aces" integer DEFAULT 0 NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_level_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "challenge_template" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"type" "challenge_type" NOT NULL,
	"difficulty" "challenge_difficulty" NOT NULL,
	"title_fr" text NOT NULL,
	"title_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"target_value" integer NOT NULL,
	"aces_reward" integer NOT NULL,
	"min_level" integer DEFAULT 1 NOT NULL,
	"max_level" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "challenge_template_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_challenge" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"template_id" text NOT NULL,
	"week_number" integer NOT NULL,
	"year" integer NOT NULL,
	"status" "user_challenge_status" DEFAULT 'active' NOT NULL,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"target_value" integer NOT NULL,
	"completed_at" timestamp,
	"aces_awarded" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_streak" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"longest_streak" integer DEFAULT 0 NOT NULL,
	"last_active_week" integer,
	"last_active_year" integer,
	"streak_start_date" timestamp,
	"total_active_weeks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_streak_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "badge" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"category" "badge_category" NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"description_fr" text NOT NULL,
	"description_en" text NOT NULL,
	"icon_name" text NOT NULL,
	"required_level" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "badge_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "title" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"required_level" integer NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "title_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_badge" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"badge_id" text NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	"notified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_title" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title_id" text NOT NULL,
	"equipped_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_title_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match" ADD CONSTRAINT "match_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_comment" ADD CONSTRAINT "match_comment_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_comment" ADD CONSTRAINT "match_comment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participant" ADD CONSTRAINT "match_participant_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_participant" ADD CONSTRAINT "match_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set" ADD CONSTRAINT "set_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_score" ADD CONSTRAINT "set_score_set_id_set_id_fk" FOREIGN KEY ("set_id") REFERENCES "public"."set"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "set_score" ADD CONSTRAINT "set_score_participant_id_match_participant_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."match_participant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_intent" ADD CONSTRAINT "match_intent_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_intent_swipe" ADD CONSTRAINT "match_intent_swipe_match_intent_id_match_intent_id_fk" FOREIGN KEY ("match_intent_id") REFERENCES "public"."match_intent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_intent_swipe" ADD CONSTRAINT "match_intent_swipe_swiper_user_id_user_id_fk" FOREIGN KEY ("swiper_user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_request" ADD CONSTRAINT "match_request_match_intent_id_match_intent_id_fk" FOREIGN KEY ("match_intent_id") REFERENCES "public"."match_intent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_request" ADD CONSTRAINT "match_request_requester_id_user_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_request" ADD CONSTRAINT "match_request_receiver_id_user_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preference" ADD CONSTRAINT "user_preference_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "device_token" ADD CONSTRAINT "device_token_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aces_transaction" ADD CONSTRAINT "aces_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_level" ADD CONSTRAINT "user_level_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge" ADD CONSTRAINT "user_challenge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_challenge" ADD CONSTRAINT "user_challenge_template_id_challenge_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."challenge_template"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_streak" ADD CONSTRAINT "user_streak_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badge" ADD CONSTRAINT "user_badge_badge_id_badge_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badge"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_title" ADD CONSTRAINT "user_title_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_title" ADD CONSTRAINT "user_title_title_id_title_id_fk" FOREIGN KEY ("title_id") REFERENCES "public"."title"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "invitation_organizationId_idx" ON "invitation" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "invitation_email_idx" ON "invitation" USING btree ("email");--> statement-breakpoint
CREATE INDEX "member_organizationId_idx" ON "member" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "member_userId_idx" ON "member" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "organization_slug_uidx" ON "organization" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "match_comment_matchId_idx" ON "match_comment" USING btree ("match_id");--> statement-breakpoint
CREATE UNIQUE INDEX "match_comment_matchId_userId_unique" ON "match_comment" USING btree ("match_id","user_id");--> statement-breakpoint
CREATE INDEX "match_participant_matchId_idx" ON "match_participant" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "match_participant_userId_idx" ON "match_participant" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "match_participant_matchId_userId_unique" ON "match_participant" USING btree ("match_id","user_id");--> statement-breakpoint
CREATE INDEX "set_matchId_idx" ON "set" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "set_score_setId_idx" ON "set_score" USING btree ("set_id");--> statement-breakpoint
CREATE INDEX "set_score_participantId_idx" ON "set_score" USING btree ("participant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "match_intent_swipe_unique" ON "match_intent_swipe" USING btree ("match_intent_id","swiper_user_id");--> statement-breakpoint
CREATE INDEX "user_preference_userId_idx" ON "user_preference" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_preference_organizationId_idx" ON "user_preference" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "device_token_userId_idx" ON "device_token" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "device_token_token_idx" ON "device_token" USING btree ("token");--> statement-breakpoint
CREATE INDEX "notification_userId_idx" ON "notification" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notification_userId_isRead_idx" ON "notification" USING btree ("user_id","is_read");--> statement-breakpoint
CREATE INDEX "notification_createdAt_idx" ON "notification" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "aces_transaction_userId_idx" ON "aces_transaction" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "aces_transaction_createdAt_idx" ON "aces_transaction" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_level_userId_idx" ON "user_level" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_level_totalAces_idx" ON "user_level" USING btree ("total_aces");--> statement-breakpoint
CREATE INDEX "challenge_template_type_idx" ON "challenge_template" USING btree ("type");--> statement-breakpoint
CREATE INDEX "challenge_template_minLevel_idx" ON "challenge_template" USING btree ("min_level");--> statement-breakpoint
CREATE INDEX "user_challenge_userId_idx" ON "user_challenge" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_challenge_weekYear_idx" ON "user_challenge" USING btree ("week_number","year");--> statement-breakpoint
CREATE INDEX "user_challenge_status_idx" ON "user_challenge" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "user_challenge_userId_templateId_week_unique" ON "user_challenge" USING btree ("user_id","template_id","week_number","year");--> statement-breakpoint
CREATE INDEX "user_streak_userId_idx" ON "user_streak" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_badge_userId_idx" ON "user_badge" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badge_userId_badgeId_unique" ON "user_badge" USING btree ("user_id","badge_id");--> statement-breakpoint
CREATE INDEX "user_title_userId_idx" ON "user_title" USING btree ("user_id");