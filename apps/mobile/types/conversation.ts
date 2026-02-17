export type ConversationType = "direct" | "group" | "match";
export type MessageType = "text" | "image" | "audio" | "system";

export interface ParticipantTitle {
  code: string;
  nameFr: string;
  nameEn: string;
}

export interface ParticipantBadge {
  code: string;
  imageUrl: string;
  nameFr: string;
  nameEn: string;
}

export interface ParticipantUser {
  id: string;
  name: string;
  image?: string | null;
  level: number;
  totalAces: number;
  title?: ParticipantTitle | null;
  badges: ParticipantBadge[];
  currentStreak: number;
  longestStreak: number;
  globalRank?: number | null;
}

export interface ConversationParticipant {
  id: string;
  user: ParticipantUser;
}

export interface ReplyTo {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: string;
}

export interface ReactionGroup {
  emoji: string;
  count: number;
  users: { id: string; name: string }[];
  hasReacted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: string;
  isEncrypted: boolean;
  clientMessageId?: string | null;
  attachmentUrl?: string | null;
  attachmentDuration?: number | null;
  attachmentWidth?: number | null;
  attachmentHeight?: number | null;
  createdAt: string;
  sender?: { id: string; name: string; image?: string | null } | null;
  replyToId?: string | null;
  replyTo?: ReplyTo | null;
  reactions?: ReactionGroup[];
}

export interface Conversation {
  id: string;
  name?: string | null;
  type: string;
  lastMessageAt?: string | null;
  lastMessagePreview?: string | null;
  lastMessageSenderId?: string | null;
  createdAt: string;
  unreadCount: number;
  isMuted: boolean;
  encryptionKey?: string | null;
  otherParticipants: ConversationParticipant[];
}

export interface SendMessageRequest {
  content: string;
  clientMessageId: string;
  isEncrypted?: boolean;
  type?: string;
  attachmentUrl?: string | null;
  attachmentDuration?: number | null;
  attachmentWidth?: number | null;
  attachmentHeight?: number | null;
  replyToId?: string;
  plaintextPreview?: string;
}

export interface UploadAttachmentResponse {
  attachmentUrl: string;
}

export interface FindOrCreateConversationResponse {
  conversationId: string;
  created: boolean;
}
