CREATE TABLE "user_e2ee_key" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"public_key" text NOT NULL,
	"encrypted_private_key" text,
	"backup_salt" text,
	"key_version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_e2ee_key_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "message" ADD COLUMN "is_encrypted" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user_e2ee_key" ADD CONSTRAINT "user_e2ee_key_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_e2ee_key_userId_idx" ON "user_e2ee_key" USING btree ("user_id");