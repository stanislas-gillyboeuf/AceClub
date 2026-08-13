CREATE TYPE "public"."court_sport" AS ENUM('tennis', 'padel');--> statement-breakpoint
CREATE TABLE "court_booking_participant" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" text NOT NULL,
	"slot_index" integer NOT NULL,
	"user_id" text,
	"guest_name" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "court" ADD COLUMN "sport" "court_sport" DEFAULT 'tennis' NOT NULL;--> statement-breakpoint
ALTER TABLE "court_booking_participant" ADD CONSTRAINT "court_booking_participant_booking_id_court_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."court_booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "court_booking_participant" ADD CONSTRAINT "court_booking_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "court_booking_participant_bookingId_slotIndex_uidx" ON "court_booking_participant" USING btree ("booking_id","slot_index");