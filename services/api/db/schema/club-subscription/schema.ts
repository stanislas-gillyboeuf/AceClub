import { boolean, index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

export const subscriptionStatus = pgEnum("subscription_status", ["active", "cancelled"]);

export const subscriptionType = pgTable(
  "subscription_type",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    priceCents: integer("price_cents"),
    // Null = no fixed duration — the assignment's endDate is set manually instead.
    durationDays: integer("duration_days"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("subscription_type_organizationId_idx").on(table.organizationId)],
);

export const memberSubscription = pgTable(
  "member_subscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    subscriptionTypeId: text("subscription_type_id")
      .notNull()
      .references(() => subscriptionType.id, { onDelete: "cascade" }),
    startDate: timestamp("start_date").notNull(),
    // Null = no fixed end (manual/ongoing). "Expired" is computed at display time by
    // comparing this to now when status is still "active" — no cron job needed for v1.
    endDate: timestamp("end_date"),
    amountDueCents: integer("amount_due_cents").notNull().default(0),
    status: subscriptionStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("member_subscription_organizationId_userId_idx").on(table.organizationId, table.userId),
  ],
);
