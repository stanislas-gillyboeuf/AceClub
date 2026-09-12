import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const courtSurface = pgEnum("court_surface", ["clay", "hard", "grass", "carpet"]);
export const courtBookingStatus = pgEnum("court_booking_status", ["confirmed", "cancelled"]);
export const courtAccessPolicy = pgEnum("court_access_policy", ["members_only", "open"]);
export const courtCancellationPolicy = pgEnum("court_cancellation_policy", [
  "anytime",
  "window",
  "disabled",
]);
export const courtSport = pgEnum("court_sport", ["tennis", "padel"]);

export const court = pgTable(
  "court",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    name: text("name").notNull(),
    sport: courtSport("sport").notNull().default("tennis"),
    surface: courtSurface("surface"),
    indoor: boolean("indoor").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    accessPolicy: courtAccessPolicy("access_policy").notNull().default("members_only"),
    pricePerHour: integer("price_per_hour"),
    slotDurationMinutes: integer("slot_duration_minutes").notNull().default(60),
    cancellationPolicy: courtCancellationPolicy("cancellation_policy").notNull().default("anytime"),
    cancellationWindowHours: integer("cancellation_window_hours"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("court_organizationId_idx").on(table.organizationId)],
);

export const courtBooking = pgTable(
  "court_booking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    courtId: text("court_id")
      .notNull()
      .references(() => court.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    startAt: timestamp("start_at").notNull(),
    endAt: timestamp("end_at").notNull(),
    status: courtBookingStatus("status").notNull().default("confirmed"),
    purpose: text("purpose"),
    bookedAsClub: boolean("booked_as_club").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("court_booking_userId_idx").on(table.userId),
    index("court_booking_startAt_idx").on(table.startAt),
    index("court_booking_courtId_startAt_idx").on(table.courtId, table.startAt),
  ],
);

export const courtBookingParticipant = pgTable(
  "court_booking_participant",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    bookingId: text("booking_id")
      .notNull()
      .references(() => courtBooking.id, { onDelete: "cascade" }),
    slotIndex: integer("slot_index").notNull(),
    userId: text("user_id").references(() => user.id),
    guestName: text("guest_name"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("court_booking_participant_bookingId_slotIndex_uidx").on(
      table.bookingId,
      table.slotIndex,
    ),
  ],
);

export const courtSettings = pgTable(
  "court_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    openingHour: integer("opening_hour").notNull().default(8),
    closingHour: integer("closing_hour").notNull().default(22),
    maxBookingsPerWeekWeekday: integer("max_bookings_per_week_weekday"),
    maxBookingsPerWeekWeekend: integer("max_bookings_per_week_weekend"),
    bookingWindowDays: integer("booking_window_days"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("court_settings_organizationId_uidx").on(table.organizationId)],
);
