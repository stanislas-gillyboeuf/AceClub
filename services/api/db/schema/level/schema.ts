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

export const AcesTransactionType = pgEnum("aces_transaction_type", [
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
    totalAces: integer("total_aces").notNull().default(0),
    currentLevel: integer("current_level").notNull().default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_level_userId_idx").on(table.userId),
    index("user_level_totalAces_idx").on(table.totalAces),
  ],
);

export const acesTransaction = pgTable(
  "aces_transaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: AcesTransactionType("type").notNull(),
    amount: integer("amount").notNull(),
    referenceId: text("reference_id"),
    referenceType: text("reference_type"),
    description: text("description"),
    multiplier: real("multiplier").default(1.0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("aces_transaction_userId_idx").on(table.userId),
    index("aces_transaction_createdAt_idx").on(table.createdAt),
  ],
);
