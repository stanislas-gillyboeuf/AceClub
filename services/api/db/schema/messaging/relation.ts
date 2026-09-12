import { relations } from "drizzle-orm";
import { broadcastMessage } from "./schema";
import { organization, user } from "../auth/schema";

export const broadcastMessageRelations = relations(broadcastMessage, ({ one }) => ({
  organization: one(organization, {
    fields: [broadcastMessage.organizationId],
    references: [organization.id],
  }),
  sender: one(user, {
    fields: [broadcastMessage.senderId],
    references: [user.id],
  }),
}));
