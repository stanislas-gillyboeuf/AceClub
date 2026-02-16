import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  boolean,
  index,
  uniqueIndex,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "../auth/schema";
import { ulid } from "ulid";

export const ConversationType = pgEnum("conversation_type", ["match", "group", "direct"]);
export const MessageType = pgEnum("message_type", ["text", "voice", "image"]);

export const conversation = pgTable(
  "conversation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    // Name for group conversations (null for 1:1 match conversations)
    name: text("name"),
    type: ConversationType("type").notNull().default("match"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    // Denormalized fields for efficient list queries
    lastMessageAt: timestamp("last_message_at"),
    lastMessagePreview: text("last_message_preview"),
    lastMessageSenderId: text("last_message_sender_id"),
  },
  (table) => [index("conversation_lastMessageAt_idx").on(table.lastMessageAt)],
);

export const conversationParticipant = pgTable(
  "conversation_participant",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    // Reading status
    lastReadAt: timestamp("last_read_at"),
    unreadCount: integer("unread_count").notNull().default(0),
    // Preferences
    isMuted: boolean("is_muted").notNull().default(false),
    // Soft delete (only for this participant, other keeps their history)
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    // Timestamps
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
  },
  (table) => [
    index("conversation_participant_conversationId_idx").on(table.conversationId),
    index("conversation_participant_userId_idx").on(table.userId),
    uniqueIndex("conversation_participant_unique").on(table.conversationId, table.userId),
  ],
);

export const message = pgTable(
  "message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversation.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull().default(""),
    // Message type and attachment fields
    type: MessageType("type").notNull().default("text"),
    attachmentUrl: text("attachment_url"),
    attachmentDuration: integer("attachment_duration"),
    attachmentWidth: integer("attachment_width"),
    attachmentHeight: integer("attachment_height"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    // Soft delete
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    // Client-generated ID for optimistic updates and deduplication
    clientMessageId: text("client_message_id"),
    // E2EE: whether the message content is encrypted
    isEncrypted: boolean("is_encrypted").notNull().default(false),
    // Reply to another message
    replyToId: text("reply_to_id"),
  },
  (table) => [
    index("message_conversationId_idx").on(table.conversationId),
    index("message_senderId_idx").on(table.senderId),
    index("message_conversationId_createdAt_idx").on(table.conversationId, table.createdAt),
    index("message_clientMessageId_idx").on(table.clientMessageId),
    index("message_replyToId_idx").on(table.replyToId),
  ],
);

export const messageReaction = pgTable(
  "message_reaction",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    messageId: text("message_id")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    emoji: text("emoji").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("message_reaction_messageId_idx").on(table.messageId),
    uniqueIndex("message_reaction_unique").on(table.messageId, table.userId, table.emoji),
  ],
);
