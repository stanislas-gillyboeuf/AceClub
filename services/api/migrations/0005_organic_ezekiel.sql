CREATE TABLE "feature_flag" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"enabled" boolean DEFAULT false NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_feature_flag" (
	"id" text PRIMARY KEY NOT NULL,
	"feature_flag_id" text NOT NULL,
	"organization_id" text NOT NULL,
	"enabled" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "organization_feature_flag" ADD CONSTRAINT "organization_feature_flag_feature_flag_id_feature_flag_id_fk" FOREIGN KEY ("feature_flag_id") REFERENCES "public"."feature_flag"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_feature_flag" ADD CONSTRAINT "organization_feature_flag_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "feature_flag_key_uidx" ON "feature_flag" USING btree ("key");--> statement-breakpoint
CREATE UNIQUE INDEX "org_feature_flag_uidx" ON "organization_feature_flag" USING btree ("feature_flag_id","organization_id");