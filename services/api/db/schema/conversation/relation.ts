import { relations } from "drizzle-orm";
import { conversation, conversationParticipant, message } from "./schema";
import { user } from "../auth/schema";
import { match } from "../match/schema";

export const conversationRelations = relations(conversation, ({ one, many }) => ({
  match: one(match, {
    fields: [conversation.matchId],
    references: [match.id],
  }),
  participants: many(conversationParticipant),
  messages: many(message),
}));

export const conversationParticipantRelations = relations(
  conversationParticipant,
  ({ one }) => ({
    conversation: one(conversation, {
      fields: [conversationParticipant.conversationId],
      references: [conversation.id],
    }),
    user: one(user, {
      fields: [conversationParticipant.userId],
      references: [user.id],
    }),
  })
);

export const messageRelations = relations(message, ({ one }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
}));
