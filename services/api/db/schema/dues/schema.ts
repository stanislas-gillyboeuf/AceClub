import { boolean, index, integer, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const duesAssignmentStatus = pgEnum("dues_assignment_status", ["pending", "paid", "waived"]);

export const duesType = pgTable(
  "dues_type",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    amountCents: integer("amount_cents").notNull(),
    dueDate: timestamp("due_date"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("dues_type_organizationId_idx").on(table.organizationId)],
);

export const duesAssignment = pgTable(
  "dues_assignment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    duesTypeId: text("dues_type_id")
      .notNull()
      .references(() => duesType.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    status: duesAssignmentStatus("status").notNull().default("pending"),
    paidAt: timestamp("paid_at"),
    paidMethod: text("paid_method"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("dues_assignment_duesTypeId_userId_uidx").on(table.duesTypeId, table.userId),
    index("dues_assignment_organizationId_idx").on(table.organizationId),
    index("dues_assignment_status_idx").on(table.status),
  ],
);

export const duesReminderLog = pgTable(
  "dues_reminder_log",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    duesAssignmentId: text("dues_assignment_id")
      .notNull()
      .references(() => duesAssignment.id, { onDelete: "cascade" }),
    sentAt: timestamp("sent_at").defaultNow().notNull(),
    sentByUserId: text("sent_by_user_id")
      .notNull()
      .references(() => user.id),
  },
  (table) => [index("dues_reminder_log_duesAssignmentId_idx").on(table.duesAssignmentId)],
);
