CREATE TABLE "account_deletion_request" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"club_name" text NOT NULL,
	"reason" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"processed_by" text
);
