import { pgTable, text, timestamp, boolean, index, pgEnum, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user, organization } from "../auth/schema";
import { ulid } from "ulid";

export const NotificationType = pgEnum("notification_type", [
  "match_request_accepted",
  "invitation_accepted",
  "new_match_request",
  "match_reminder",
  "challenge_assigned",
  "streak_warning",
  "new_message",
  "match_liked",
  "club_announcement",
  "booking_reminder",
  "class_reminder",
  "slot_suggestion",
  "coach_message",
  // A system message about a match/partner request (received/accepted/rejected) — split out
  // from `new_message` so a club can mute real chat without also muting match-request updates.
  "match_request_update",
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

// Per-club toggles for which notifications it sends to its members — one row per
// organization, no row yet = every column behaves as `true` (see lib/notification-gate.ts),
// same "no row = defaults" convention as `court_settings`.
export const organizationNotificationSettings = pgTable(
  "organization_notification_settings",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    // Défis
    streakWarning: boolean("streak_warning").default(true).notNull(),
    challengeAssigned: boolean("challenge_assigned").default(true).notNull(),

    // Matchs/Matching
    matchRequestUpdate: boolean("match_request_update").default(true).notNull(),
    matchLiked: boolean("match_liked").default(true).notNull(),

    // Messagerie
    newMessage: boolean("new_message").default(true).notNull(),

    // Réservations/Cours
    bookingReminder: boolean("booking_reminder").default(true).notNull(),
    classReminder: boolean("class_reminder").default(true).notNull(),
    coachMessage: boolean("coach_message").default(true).notNull(),

    // Cotisations
    cotisationRequestEmail: boolean("cotisation_request_email").default(true).notNull(),
    cotisationReminderEmail: boolean("cotisation_reminder_email").default(true).notNull(),

    // Actus du club
    invitationAccepted: boolean("invitation_accepted").default(true).notNull(),
    clubAnnouncement: boolean("club_announcement").default(true).notNull(),
    memberAlertDigestEmail: boolean("member_alert_digest_email").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("org_notification_settings_organizationId_uidx").on(table.organizationId),
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
