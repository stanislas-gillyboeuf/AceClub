import { conversation, conversationParticipant, message, messageReaction } from "./schema";

export type Conversation = typeof conversation.$inferSelect;
export type NewConversation = typeof conversation.$inferInsert;

export type ConversationParticipant = typeof conversationParticipant.$inferSelect;
export type NewConversationParticipant = typeof conversationParticipant.$inferInsert;

export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;

export type MessageReaction = typeof messageReaction.$inferSelect;
export type NewMessageReaction = typeof messageReaction.$inferInsert;
