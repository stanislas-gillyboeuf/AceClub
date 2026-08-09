import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const courtSurface = pgEnum("court_surface", ["clay", "hard", "grass", "carpet"]);

export const courtLocation = pgEnum("court_location", ["indoor", "outdoor"]);

export const courtBookingStatus = pgEnum("court_booking_status", ["confirmed", "cancelled"]);

export const court = pgTable(
  "court",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    surface: courtSurface("surface").notNull().default("hard"),
    location: courtLocation("location").notNull().default("outdoor"),
    pricePerHour: integer("price_per_hour"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("court_organizationId_idx").on(table.organizationId),
    index("court_isActive_idx").on(table.isActive),
  ],
);

export const courtBooking = pgTable(
  "court_booking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    courtId: text("court_id")
      .notNull()
      .references(() => court.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    status: courtBookingStatus("status").notNull().default("confirmed"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("court_booking_courtId_idx").on(table.courtId),
    index("court_booking_userId_idx").on(table.userId),
    index("court_booking_startTime_idx").on(table.startTime),
    index("court_booking_courtId_startTime_idx").on(table.courtId, table.startTime),
  ],
);
