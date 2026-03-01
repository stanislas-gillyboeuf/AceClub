import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const eventStatus = pgEnum("event_status", [
  "draft",
  "presale",
  "on_sale",
  "completed",
  "full",
  "cancelled",
  "archived",
]);

export const eventVisibility = pgEnum("event_visibility", ["public", "organization"]);

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
    coverImage: text("cover_image"),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    address: text("address"),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    maxParticipants: integer("max_participants"),
    isFree: boolean("is_free").notNull().default(true),
    price: integer("price"),
    paymentLink: text("payment_link"),
    visibility: eventVisibility("visibility").notNull().default("public"),
    status: eventStatus("status").notNull().default("draft"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    organizationId: text("organization_id")
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
    index("event_visibility_idx").on(table.visibility),
    index("event_createdAt_idx").on(table.createdAt),
    index("event_latitude_longitude_idx").on(table.latitude, table.longitude),
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
