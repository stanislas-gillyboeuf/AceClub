import { boolean, index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const courtSurface = pgEnum("court_surface", ["clay", "hard", "grass", "carpet"]);
export const courtBookingStatus = pgEnum("court_booking_status", ["confirmed", "cancelled"]);
export const courtAccessPolicy = pgEnum("court_access_policy", ["members_only", "open"]);

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
    surface: courtSurface("surface"),
    indoor: boolean("indoor").notNull().default(false),
    isActive: boolean("is_active").notNull().default(true),
    accessPolicy: courtAccessPolicy("access_policy").notNull().default("members_only"),
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
