import { relations } from "drizzle-orm";
import { user } from "../auth/schema";
import { userBlock, userReport } from "./schema";

export const userBlockRelations = relations(userBlock, ({ one }) => ({
  blocker: one(user, { fields: [userBlock.blockerUserId], references: [user.id] }),
  blocked: one(user, { fields: [userBlock.blockedUserId], references: [user.id] }),
}));

export const userReportRelations = relations(userReport, ({ one }) => ({
  reporter: one(user, { fields: [userReport.reporterUserId], references: [user.id] }),
  reported: one(user, { fields: [userReport.reportedUserId], references: [user.id] }),
  reviewedBy: one(user, { fields: [userReport.reviewedByUserId], references: [user.id] }),
}));
