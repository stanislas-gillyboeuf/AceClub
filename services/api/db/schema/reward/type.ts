import { badge, userBadge, title, userTitle } from "./schema";

export type Badge = typeof badge.$inferSelect;
export type NewBadge = typeof badge.$inferInsert;

export type UserBadge = typeof userBadge.$inferSelect;
export type NewUserBadge = typeof userBadge.$inferInsert;

export type Title = typeof title.$inferSelect;
export type NewTitle = typeof title.$inferInsert;

export type UserTitle = typeof userTitle.$inferSelect;
export type NewUserTitle = typeof userTitle.$inferInsert;
