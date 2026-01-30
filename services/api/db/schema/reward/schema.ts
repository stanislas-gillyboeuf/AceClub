import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  integer,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "../auth/schema";
import { ulid } from "ulid";

export const BadgeCategory = pgEnum("badge_category", [
  "level",
  "achievement",
  "milestone",
  "special",
]);

export const badge = pgTable("badge", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  code: text("code").notNull().unique(),
  category: BadgeCategory("category").notNull(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionFr: text("description_fr").notNull(),
  descriptionEn: text("description_en").notNull(),
  iconName: text("icon_name").notNull(),
  requiredLevel: integer("required_level"),
  isActive: boolean("is_active").default(true).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userBadge = pgTable(
  "user_badge",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    badgeId: text("badge_id")
      .notNull()
      .references(() => badge.id),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
    notifiedAt: timestamp("notified_at"),
  },
  (table) => [
    index("user_badge_userId_idx").on(table.userId),
    uniqueIndex("user_badge_userId_badgeId_unique").on(table.userId, table.badgeId),
  ],
);

export const title = pgTable("title", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => ulid()),
  code: text("code").notNull().unique(),
  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  requiredLevel: integer("required_level").notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userTitle = pgTable(
  "user_title",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    titleId: text("title_id")
      .notNull()
      .references(() => title.id),
    equippedAt: timestamp("equipped_at").defaultNow().notNull(),
  },
  (table) => [index("user_title_userId_idx").on(table.userId)],
);
