import type { UserProfile } from "./user";

export type ConversationType = "match" | "group" | "direct";

export interface ConversationParticipant {
  id: string;
  user: UserProfile;
}

export interface MessageSender {
  id: string;
  name: string;
  image: string | null;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
  clientMessageId: string | null;
  isFromMe: boolean;
}

export interface Conversation {
  id: string;
  name: string | null;
  type: ConversationType;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  lastMessageSenderId: string | null;
  createdAt: string;
  unreadCount: number;
  isMuted: boolean;
  otherParticipants: ConversationParticipant[];
}

export interface FindOrCreateResult {
  conversationId: string;
  created: boolean;
}
