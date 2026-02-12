ALTER TABLE "match" ADD COLUMN IF NOT EXISTS "venue_organization_id" text;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'match_venue_organization_id_organization_id_fk'
  ) THEN
    ALTER TABLE "match" ADD CONSTRAINT "match_venue_organization_id_organization_id_fk" FOREIGN KEY ("venue_organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;
  END IF;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "match_venueOrganizationId_idx" ON "match" USING btree ("venue_organization_id");