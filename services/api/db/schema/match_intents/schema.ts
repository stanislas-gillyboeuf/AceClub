import { integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "../auth/schema";
import { ulid } from "ulid";

export const matchIntentStatus = pgEnum("match_intent_status", ["pending", "accepted", "rejected"]);
export const swipeAction = pgEnum("swipe_action", ["like", "pass"]);

export const matchIntent = pgTable("match_intent", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  userId: text("user_id").references(() => user.id),
  date: timestamp("date"),
  time: timestamp("time"),
  duration: integer("duration").default(60),
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
