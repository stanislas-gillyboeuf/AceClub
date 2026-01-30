import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "../auth/schema";
import { ulid } from "ulid";

export const XpTransactionType = pgEnum("xp_transaction_type", [
  "match_participation",
  "match_victory",
  "challenge_completed",
  "streak_bonus",
  "level_up_bonus",
  "badge_bonus",
]);

export const userLevel = pgTable(
  "user_level",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    totalXp: integer("total_xp").notNull().default(0),
    currentLevel: integer("current_level").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_level_userId_idx").on(table.userId),
    index("user_level_totalXp_idx").on(table.totalXp),
  ],
);

export const xpTransaction = pgTable(
  "xp_transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: XpTransactionType("type").notNull(),
    amount: integer("amount").notNull(),
    referenceId: text("reference_id"),
    referenceType: text("reference_type"),
    description: text("description"),
    multiplier: real("multiplier").default(1.0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("xp_transaction_userId_idx").on(table.userId),
    index("xp_transaction_createdAt_idx").on(table.createdAt),
  ],
);
