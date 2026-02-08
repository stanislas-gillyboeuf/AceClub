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

export const ChallengeType = pgEnum("challenge_type", ["quantitative", "social", "performance"]);

export const ChallengeDifficulty = pgEnum("challenge_difficulty", ["easy", "medium", "hard"]);

export const UserChallengeStatus = pgEnum("user_challenge_status", [
  "active",
  "completed",
  "expired",
]);

export const challengeTemplate = pgTable(
  "challenge_template",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    code: text("code").notNull().unique(),
    type: ChallengeType("type").notNull(),
    difficulty: ChallengeDifficulty("difficulty").notNull(),
    titleFr: text("title_fr").notNull(),
    titleEn: text("title_en").notNull(),
    descriptionFr: text("description_fr").notNull(),
    descriptionEn: text("description_en").notNull(),
    targetValue: integer("target_value").notNull(),
    acesReward: integer("aces_reward").notNull(),
    minLevel: integer("min_level").notNull().default(1),
    maxLevel: integer("max_level"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("challenge_template_type_idx").on(table.type),
    index("challenge_template_minLevel_idx").on(table.minLevel),
  ],
);

export const userChallenge = pgTable(
  "user_challenge",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    templateId: text("template_id")
      .notNull()
      .references(() => challengeTemplate.id),
    weekNumber: integer("week_number").notNull(),
    year: integer("year").notNull(),
    status: UserChallengeStatus("status").notNull().default("active"),
    currentProgress: integer("current_progress").notNull().default(0),
    targetValue: integer("target_value").notNull(),
    completedAt: timestamp("completed_at"),
    acesAwarded: integer("aces_awarded"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (table) => [
    index("user_challenge_userId_idx").on(table.userId),
    index("user_challenge_weekYear_idx").on(table.weekNumber, table.year),
    index("user_challenge_status_idx").on(table.status),
    uniqueIndex("user_challenge_userId_templateId_week_unique").on(
      table.userId,
      table.templateId,
      table.weekNumber,
      table.year,
    ),
  ],
);
