import { conversation, conversationParticipant, message } from "./schema";

export type Conversation = typeof conversation.$inferSelect;
export type NewConversation = typeof conversation.$inferInsert;

export type ConversationParticipant = typeof conversationParticipant.$inferSelect;
export type NewConversationParticipant = typeof conversationParticipant.$inferInsert;

export type Message = typeof message.$inferSelect;
export type NewMessage = typeof message.$inferInsert;
