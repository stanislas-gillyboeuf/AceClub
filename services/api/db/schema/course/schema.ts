import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";
import { court, courtBooking } from "../court/schema";

export const courseStatus = pgEnum("course_status", ["active", "cancelled"]);
export const courseAttendanceStatus = pgEnum("course_attendance_status", ["present", "absent"]);

/**
 * A recurring class definition (e.g. "Cours enfants avec Marc, mardi 18h"). Occurrences are
 * NOT computed on the fly — they are generated as real `court_booking` rows (kind='course',
 * courseId=this row's id) at creation time, so each session can be cancelled individually.
 */
export const course = pgTable(
  "course",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    coachUserId: text("coach_user_id")
      .notNull()
      .references(() => user.id),
    courtId: text("court_id")
      .notNull()
      .references(() => court.id),
    name: text("name").notNull(),
    weekday: integer("weekday").notNull(), // 0 (Sunday) - 6 (Saturday), matches Date#getDay()
    startTime: text("start_time").notNull(), // "HH:mm"
    durationMinutes: integer("duration_minutes").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    status: courseStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("course_organizationId_idx").on(table.organizationId),
    index("course_coachUserId_idx").on(table.coachUserId),
  ],
);

/** The roster — persistent across all occurrences of a course, distinct from the per-slot
 * `court_booking_participant` used by classic member bookings. */
export const courseEnrollment = pgTable(
  "course_enrollment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("course_enrollment_courseId_userId_uidx").on(table.courseId, table.userId),
    index("course_enrollment_userId_idx").on(table.userId),
  ],
);

/** One row per (occurrence, enrolled student) — marked by the assigned coach (or an admin)
 * after/at a session. Absence of a row means "not yet marked", not "absent". */
export const courseAttendance = pgTable(
  "course_attendance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    bookingId: text("booking_id")
      .notNull()
      .references(() => courtBooking.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    status: courseAttendanceStatus("status").notNull(),
    markedByUserId: text("marked_by_user_id")
      .notNull()
      .references(() => user.id),
    markedAt: timestamp("marked_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("course_attendance_bookingId_userId_uidx").on(table.bookingId, table.userId),
    index("course_attendance_userId_idx").on(table.userId),
  ],
);
