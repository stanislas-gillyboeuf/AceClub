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
import { organization, user } from "../auth/schema";
import { matchRequest } from "../match_intents/schema";
import { course } from "../course/schema";
import { ulid } from "ulid";

export const ConversationType = pgEnum("conversation_type", ["match", "group", "direct"]);
export const MessageType = pgEnum("message_type", ["text", "voice", "image", "match_request"]);
// A "direct" conversation between two players with no prior link (no shared club, match, or
// existing active conversation) starts "pending_request": the initiator may send one message,
// the recipient must accept (or reject) before it becomes a normal conversation. Every other
// conversation — including all pre-existing rows — is "active" and never transitions.
export const ConversationStatus = pgEnum("conversation_status", [
  "active",
  "pending_request",
  "rejected",
]);

export const conversation = pgTable(
  "conversation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    // Name for group conversations (null for 1:1 match conversations)
    name: text("name"),
    type: ConversationType("type").notNull().default("match"),
    status: ConversationStatus("status").notNull().default("active"),
    // Who created the conversation via find-or-create — only meaningful while status is
    // "pending_request", to tell the initiator (limited to one message) from the recipient
    // (whose reply implicitly accepts the request).
    initiatedByUserId: text("initiated_by_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    // Set once a request notification has been sent, so a blocked second message never
    // re-notifies the recipient.
    requestNotifiedAt: timestamp("request_notified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    // Denormalized fields for efficient list queries
    lastMessageAt: timestamp("last_message_at"),
    lastMessagePreview: text("last_message_preview"),
    lastMessageSenderId: text("last_message_sender_id"),
    // Server-side encryption key (AES-256, base64-encoded)
    encryptionKey: text("encryption_key"),
    // Set only for the one auto-managed group tied to a course (membership synced from
    // courseEnrollment — see server/course/lib/course-group-sync.ts). Null for every other
    // conversation, including manually-created groups.
    courseId: text("course_id").references(() => course.id, { onDelete: "set null" }),
    // Group-only: only an admin participant may post while this is true.
    announcementsOnly: boolean("announcements_only").notNull().default(false),
    // Group-only: hidden from the dashboard's active list and read-only for members, but the
    // conversation and its history stay intact.
    isArchived: boolean("is_archived").notNull().default(false),
    // Group-only. No FK — same convention as message.replyToId (self-referential within this
    // file would otherwise force an awkward declaration order).
    pinnedMessageId: text("pinned_message_id"),
    // Group-only: the club this group belongs to (copied from course.organizationId for a
    // course group, given explicitly at creation for a manual one) — lets the dashboard list
    // "this club's groups" directly instead of joining through courseId. Null for match/direct.
    organizationId: text("organization_id").references(() => organization.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("conversation_lastMessageAt_idx").on(table.lastMessageAt),
    uniqueIndex("conversation_courseId_uidx").on(table.courseId),
    index("conversation_organizationId_idx").on(table.organizationId),
  ],
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
    // Group-only: can pin/unpin, delete any message, toggle announcementsOnly. The coach for a
    // course group, or the creator for a manual group. Meaningless on match/direct conversations.
    isAdmin: boolean("is_admin").notNull().default(false),
    // Soft delete (only for this participant, other keeps their history)
    isDeleted: boolean("is_deleted").notNull().default(false),
    deletedAt: timestamp("deleted_at"),
    // True when THIS removal came from the participant choosing to leave (delete-conversation),
    // as opposed to course-group-sync removing them because they're no longer enrolled. A course
    // group's sync never re-adds someone flagged here — only an explicit re-add by the coach/club
    // (add-group-participant) clears it, matching "quitte un groupe de cours, ne peut le
    // rejoindre que via le coach ou le club".
    leftManually: boolean("left_manually").notNull().default(false),
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
    // For type "match_request": the request this message renders/actions on.
    // Status is read live from match_request, never duplicated here.
    matchRequestId: text("match_request_id").references(() => matchRequest.id),
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
