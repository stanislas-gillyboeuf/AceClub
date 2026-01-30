import { relations } from "drizzle-orm";
import { badge, userBadge, title, userTitle } from "./schema";
import { user } from "../auth/schema";

export const badgeRelations = relations(badge, ({ many }) => ({
  userBadges: many(userBadge),
}));

export const userBadgeRelations = relations(userBadge, ({ one }) => ({
  user: one(user, {
    fields: [userBadge.userId],
    references: [user.id],
  }),
  badge: one(badge, {
    fields: [userBadge.badgeId],
    references: [badge.id],
  }),
}));

export const titleRelations = relations(title, ({ many }) => ({
  userTitles: many(userTitle),
}));

export const userTitleRelations = relations(userTitle, ({ one }) => ({
  user: one(user, {
    fields: [userTitle.userId],
    references: [user.id],
  }),
  title: one(title, {
    fields: [userTitle.titleId],
    references: [title.id],
  }),
}));
