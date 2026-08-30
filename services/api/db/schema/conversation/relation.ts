import { relations } from "drizzle-orm";
import { conversation, conversationParticipant, message, messageReaction } from "./schema";
import { user } from "../auth/schema";
import { matchRequest } from "../match_intents/schema";

export const conversationRelations = relations(conversation, ({ many }) => ({
  participants: many(conversationParticipant),
  messages: many(message),
}));

export const conversationParticipantRelations = relations(conversationParticipant, ({ one }) => ({
  conversation: one(conversation, {
    fields: [conversationParticipant.conversationId],
    references: [conversation.id],
  }),
  user: one(user, {
    fields: [conversationParticipant.userId],
    references: [user.id],
  }),
}));

export const messageRelations = relations(message, ({ one, many }) => ({
  conversation: one(conversation, {
    fields: [message.conversationId],
    references: [conversation.id],
  }),
  sender: one(user, {
    fields: [message.senderId],
    references: [user.id],
  }),
  replyTo: one(message, {
    fields: [message.replyToId],
    references: [message.id],
    relationName: "messageReplies",
  }),
  replies: many(message, { relationName: "messageReplies" }),
  reactions: many(messageReaction),
  matchRequest: one(matchRequest, {
    fields: [message.matchRequestId],
    references: [matchRequest.id],
  }),
}));

export const messageReactionRelations = relations(messageReaction, ({ one }) => ({
  message: one(message, {
    fields: [messageReaction.messageId],
    references: [message.id],
  }),
  user: one(user, {
    fields: [messageReaction.userId],
    references: [user.id],
  }),
}));
