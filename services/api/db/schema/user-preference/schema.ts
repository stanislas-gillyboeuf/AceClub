import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, pgEnum, index, boolean } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { user } from "../auth/schema";
import { organization } from "../auth/schema";

export const SportType = pgEnum("sport_type", ["tennis", "padel"]);

export const userPreference = pgTable(
  "user_preference",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    sport: SportType("sport").notNull(),
    skillLevel: text("skill_level").notNull(),
    // Set by a club admin confirming a self-reported level (or one they set directly) is
    // accurate — see server/club-level/mutations/set-member-level.ts. Primary sport only in
    // v1; the secondary sport isn't verifiable, to keep the surface small.
    skillLevelVerified: boolean("skill_level_verified").notNull().default(false),
    skillLevelVerifiedByUserId: text("skill_level_verified_by_user_id").references(() => user.id),
    skillLevelVerifiedAt: timestamp("skill_level_verified_at"),
    /** Optional second sport for players who play both tennis and padel. */
    secondarySport: SportType("secondary_sport"),
    secondarySkillLevel: text("secondary_skill_level"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_preference_userId_idx").on(table.userId),
    index("user_preference_organizationId_idx").on(table.organizationId),
  ],
);

export const userPreferenceRelations = relations(userPreference, ({ one }) => ({
  user: one(user, {
    fields: [userPreference.userId],
    references: [user.id],
  }),
  organization: one(organization, {
    fields: [userPreference.organizationId],
    references: [organization.id],
  }),
}));
