import { boolean, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";
import { ulid } from "ulid";

export const matchIntentStatus = pgEnum("match_intent_status", ["pending", "accepted", "rejected"]);
export const matchIntentType = pgEnum("match_intent_type", ["match", "training"]);
export const swipeAction = pgEnum("swipe_action", ["like", "pass"]);
export const matchRequestStatus = pgEnum("match_request_status", [
  "pending",
  "accepted",
  "rejected",
]);

export const matchIntent = pgTable("match_intent", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  date: timestamp("date"),
  time: timestamp("time"),
  isFlexibleDate: boolean("is_flexible_date").notNull().default(false),
  duration: integer("duration").default(60),
  type: matchIntentType("type").default("match"),
  description: text("description"),
  status: matchIntentStatus("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const matchIntentSwipe = pgTable(
  "match_intent_swipe",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    matchIntentId: text("match_intent_id")
      .notNull()
      .references(() => matchIntent.id),
    swiperUserId: text("swiper_user_id")
      .notNull()
      .references(() => user.id),
    action: swipeAction("action").notNull(),
    swipedAt: timestamp("swiped_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("match_intent_swipe_unique").on(table.matchIntentId, table.swiperUserId)],
);

export const matchRequest = pgTable("match_request", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  matchIntentId: text("match_intent_id")
    .notNull()
    .references(() => matchIntent.id),
  requesterId: text("requester_id")
    .notNull()
    .references(() => user.id),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => user.id),
  /** Which padel teammate slot (0-2) this request targets. Null for a regular tennis partner request. */
  slotIndex: integer("slot_index"),
  status: matchRequestStatus("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  respondedAt: timestamp("responded_at"),
});

/** Confirmed padel roster for an intent — pre-filled by the creator and/or filled via accepted requests. */
export const matchIntentTeammate = pgTable(
  "match_intent_teammate",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    matchIntentId: text("match_intent_id")
      .notNull()
      .references(() => matchIntent.id, { onDelete: "cascade" }),
    slotIndex: integer("slot_index").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("match_intent_teammate_unique").on(table.matchIntentId, table.slotIndex)],
);
