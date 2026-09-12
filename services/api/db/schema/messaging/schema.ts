import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const broadcastChannel = pgEnum("broadcast_channel", ["email", "push", "both"]);

/** Send log only — segments are resolved live at send time, nothing about the audience is persisted. */
export const broadcastMessage = pgTable(
  "broadcast_message",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    senderId: text("sender_id")
      .notNull()
      .references(() => user.id),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    channel: broadcastChannel("channel").notNull(),
    segment: text("segment").notNull(),
    recipientCount: integer("recipient_count").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("broadcast_message_organizationId_idx").on(table.organizationId)],
);
