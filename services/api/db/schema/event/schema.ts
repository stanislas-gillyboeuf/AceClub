import { index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const eventStatus = pgEnum("event_status", [
  "open",
  "closed",
  "completed",
  "cancelled",
  "archived",
  "pending",
]);

export const eventVisibility = pgEnum("event_visibility", ["public", "private"]);

export const eventParticipantStatus = pgEnum("event_participant_status", [
  "registered",
  "waitlisted",
  "cancelled",
]);

export const event = pgTable(
  "event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    name: text("name").notNull(),
    description: text("description"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    address: text("address"),
    maxParticipants: integer("max_participants"),
    visibility: eventVisibility("visibility").notNull().default("public"),
    status: eventStatus("status").notNull().default("pending"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("event_organizationId_idx").on(table.organizationId),
    index("event_startDate_idx").on(table.startDate),
    index("event_status_idx").on(table.status),
  ],
);

export const eventParticipant = pgTable(
  "event_participant",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    eventId: text("event_id")
      .notNull()
      .references(() => event.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    status: eventParticipantStatus("status").notNull().default("registered"),
    registeredAt: timestamp("registered_at").defaultNow().notNull(),
  },
  (table) => [
    index("event_participant_eventId_idx").on(table.eventId),
    index("event_participant_userId_idx").on(table.userId),
    uniqueIndex("event_participant_eventId_userId_idx").on(table.eventId, table.userId),
  ],
);
