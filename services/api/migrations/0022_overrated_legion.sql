CREATE TABLE "notification_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"name" text NOT NULL,
	"cron_expression" text NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"audience" jsonb NOT NULL,
	"default_variables" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"trigger_schedule_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_run_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_template" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "notification_type" NOT NULL,
	"description" text NOT NULL,
	"available_variables" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_template_variant" (
	"id" text PRIMARY KEY NOT NULL,
	"template_id" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notification_schedule" ADD CONSTRAINT "notification_schedule_template_id_notification_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_template"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_template_variant" ADD CONSTRAINT "notification_template_variant_template_id_notification_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."notification_template"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notification_schedule_template_idx" ON "notification_schedule" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "notification_schedule_active_idx" ON "notification_schedule" USING btree ("is_active");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_template_type_idx" ON "notification_template" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notification_variant_template_idx" ON "notification_template_variant" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "notification_variant_template_active_idx" ON "notification_template_variant" USING btree ("template_id","is_active");