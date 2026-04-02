import { pgTable, text, timestamp, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

export const GameConfigCategory = pgEnum("game_config_category", [
  "aces_rewards",
  "level_formula",
  "streak_multiplier",
]);

export const gameConfig = pgTable(
  "game_config",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    category: GameConfigCategory("category").notNull(),
    key: text("key").notNull(),
    value: text("value").notNull(),
    description: text("description"),
    updatedBy: text("updated_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("game_config_category_key_uidx").on(table.category, table.key)],
);
