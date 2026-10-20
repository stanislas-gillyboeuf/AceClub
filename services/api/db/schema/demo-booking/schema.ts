import { pgTable, text, timestamp, integer, uniqueIndex, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { ulid } from "ulid";

/** Single owner, single row (id always "singleton") — no multi-tenant booking rules. */
export const demoBookingSettings = pgTable("demo_booking_settings", {
  id: text("id").primaryKey().default("singleton"),
  demoDurationMinutes: integer("demo_duration_minutes").notNull().default(20),
  bufferBeforeMinutes: integer("buffer_before_minutes").notNull().default(10),
  bufferAfterMinutes: integer("buffer_after_minutes").notNull().default(10),
  minNoticeHours: integer("min_notice_hours").notNull().default(8),
  horizonDays: integer("horizon_days").notNull().default(21),
  maxPerDay: integer("max_per_day").notNull().default(3),
  referenceTimezone: text("reference_timezone").notNull().default("Europe/Paris"),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

/** Weekly recurring availability window, interpreted in demoBookingSettings.referenceTimezone. */
export const demoAvailabilityRule = pgTable(
  "demo_availability_rule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday .. 6 = Saturday
    startTime: text("start_time").notNull(), // "HH:mm"
    endTime: text("end_time").notNull(), // "HH:mm"
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("demo_availability_rule_dayOfWeek_idx").on(table.dayOfWeek)],
);

/** Admin-set manual block — either a whole day (date set, startAt/endAt null) or a precise range. */
export const demoManualBlock = pgTable(
  "demo_manual_block",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    date: text("date"), // "YYYY-MM-DD" in referenceTimezone, whole-day block
    startAt: timestamp("start_at", { withTimezone: true }),
    endAt: timestamp("end_at", { withTimezone: true }),
    reason: text("reason"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("demo_manual_block_date_idx").on(table.date)],
);

export const demoBookingRole = ["president", "manager", "coach", "other"] as const;
export type DemoBookingRole = (typeof demoBookingRole)[number];

export const demoBookingStatus = ["confirmed", "cancelled"] as const;
export type DemoBookingStatus = (typeof demoBookingStatus)[number];

export const demoBooking = pgTable(
  "demo_booking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("confirmed"), // demoBookingStatus
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    clubName: text("club_name").notNull(),
    phone: text("phone"),
    role: text("role").notNull(), // demoBookingRole
    note: text("note"),
    utmSource: text("utm_source"),
    cancelToken: text("cancel_token").notNull(),
    googleEventId: text("google_event_id"),
    googleMeetLink: text("google_meet_link"),
    reminderDayBeforeSentAt: timestamp("reminder_day_before_sent_at", { withTimezone: true }),
    reminderHourBeforeSentAt: timestamp("reminder_hour_before_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("demo_booking_cancelToken_uidx").on(table.cancelToken),
    // Double-booking guard: only one confirmed booking may ever hold a given start time.
    uniqueIndex("demo_booking_startAt_confirmed_uidx")
      .on(table.startAt)
      .where(sql`${table.status} = 'confirmed'`),
    index("demo_booking_startAt_idx").on(table.startAt),
  ],
);

/** Single owner, single row (id always "singleton"). */
export const googleCalendarConnection = pgTable("google_calendar_connection", {
  id: text("id").primaryKey().default("singleton"),
  encryptedRefreshToken: text("encrypted_refresh_token").notNull(),
  calendarId: text("calendar_id").notNull().default("primary"),
  connectedByUserId: text("connected_by_user_id"),
  status: text("status").notNull().default("connected"), // "connected" | "error"
  lastErrorMessage: text("last_error_message"),
  lastErrorAt: timestamp("last_error_at", { withTimezone: true }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
