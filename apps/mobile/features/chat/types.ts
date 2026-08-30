import type { ReplyTo, ReactionGroup, MatchRequestCardInfo } from "@/types/conversation";

export type MessageSendStatus = "sending" | "sent" | "read" | "failed";

export type GroupPosition = "first" | "middle" | "last" | "single";

export interface ChatMessage {
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
  isFromMe: boolean;
  sendStatus: MessageSendStatus;
  replyToId?: string | null;
  replyTo?: ReplyTo | null;
  reactions?: ReactionGroup[];
  matchRequestId?: string | null;
  matchRequest?: MatchRequestCardInfo | null;
}
