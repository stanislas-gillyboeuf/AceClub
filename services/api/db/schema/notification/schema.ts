import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";
import { ulid } from "ulid";

export const NotificationType = pgEnum("notification_type", [
  "match_request_accepted",
  "invitation_accepted",
  "new_match_request",
  "match_reminder",
  "challenge_assigned",
  "streak_warning",
]);

export const DevicePlatform = pgEnum("device_platform", ["ios", "android"]);

// Table pour stocker les device tokens APNs
export const deviceToken = pgTable(
  "device_token",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    platform: DevicePlatform("platform").default("ios").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    lastUsedAt: timestamp("last_used_at"),
  },
  (table) => [
    index("device_token_userId_idx").on(table.userId),
    index("device_token_token_idx").on(table.token),
  ],
);

// Table pour l'historique des notifications
export const notification = pgTable(
  "notification",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: NotificationType("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    data: text("data"), // JSON stringified payload
    referenceId: text("reference_id"), // ID du match, invitation, etc.
    referenceType: text("reference_type"), // match, invitation, etc.
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at"),
    sentAt: timestamp("sent_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_userId_idx").on(table.userId),
    index("notification_userId_isRead_idx").on(table.userId, table.isRead),
    index("notification_createdAt_idx").on(table.createdAt),
  ],
);

// Relations
export const deviceTokenRelations = relations(deviceToken, ({ one }) => ({
  user: one(user, {
    fields: [deviceToken.userId],
    references: [user.id],
  }),
}));

export const notificationRelations = relations(notification, ({ one }) => ({
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
  }),
}));
