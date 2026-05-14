import {
  pgTable,
  text,
  timestamp,
  boolean,
  index,
  pgEnum,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "../auth/schema";
import { ulid } from "ulid";

export const NOTIFICATION_TYPES = [
  "match_request_accepted",
  "invitation_accepted",
  "new_match_request",
  "match_reminder",
  "challenge_assigned",
  "streak_warning",
  "new_message",
  "match_liked",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const notificationTypeEnum = pgEnum("notification_type", NOTIFICATION_TYPES);

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
    type: notificationTypeEnum("type").notNull(),
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

// Templates personnalisables par type — un par type, avec N variantes random
export const notificationTemplate = pgTable(
  "notification_template",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    type: notificationTypeEnum("type").notNull(),
    description: text("description").notNull(),
    availableVariables: jsonb("available_variables").$type<string[]>().notNull().default([]),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("notification_template_type_idx").on(table.type)],
);

export const notificationTemplateVariant = pgTable(
  "notification_template_variant",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    templateId: text("template_id")
      .notNull()
      .references(() => notificationTemplate.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("notification_variant_template_idx").on(table.templateId),
    index("notification_variant_template_active_idx").on(table.templateId, table.isActive),
  ],
);

export type NotificationAudience = { type: "all" } | { type: "user_ids"; userIds: string[] };

// Planifications créées par l'admin — exécutées par trigger.dev (schedule dynamique)
export const notificationSchedule = pgTable(
  "notification_schedule",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    templateId: text("template_id")
      .notNull()
      .references(() => notificationTemplate.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    cronExpression: text("cron_expression").notNull(),
    timezone: text("timezone").default("UTC").notNull(),
    audience: jsonb("audience").$type<NotificationAudience>().notNull(),
    defaultVariables: jsonb("default_variables")
      .$type<Record<string, string>>()
      .notNull()
      .default({}),
    triggerScheduleId: text("trigger_schedule_id"),
    isActive: boolean("is_active").default(true).notNull(),
    lastRunAt: timestamp("last_run_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("notification_schedule_template_idx").on(table.templateId),
    index("notification_schedule_active_idx").on(table.isActive),
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

export const notificationTemplateRelations = relations(notificationTemplate, ({ many }) => ({
  variants: many(notificationTemplateVariant),
  schedules: many(notificationSchedule),
}));

export const notificationTemplateVariantRelations = relations(
  notificationTemplateVariant,
  ({ one }) => ({
    template: one(notificationTemplate, {
      fields: [notificationTemplateVariant.templateId],
      references: [notificationTemplate.id],
    }),
  }),
);

export const notificationScheduleRelations = relations(notificationSchedule, ({ one }) => ({
  template: one(notificationTemplate, {
    fields: [notificationSchedule.templateId],
    references: [notificationTemplate.id],
  }),
}));
