import { index, pgEnum, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { user } from "../auth/schema";

/**
 * Player-to-player relationships — blocking and reporting. Independent of any club: two players
 * can block/report each other whether or not they share a club, since these are cross-club by
 * design (see services/api/lib/block.ts, applied wherever two players interact directly).
 */
export const userBlock = pgTable(
  "user_block",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    blockerUserId: text("blocker_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    blockedUserId: text("blocked_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_block_blocker_blocked_uidx").on(table.blockerUserId, table.blockedUserId),
    index("user_block_blockerUserId_idx").on(table.blockerUserId),
    index("user_block_blockedUserId_idx").on(table.blockedUserId),
  ],
);

export const userReportStatus = pgEnum("user_report_status", ["open", "reviewed", "dismissed"]);

export const userReport = pgTable(
  "user_report",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    reporterUserId: text("reporter_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reportedUserId: text("reported_user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    reason: text("reason").notNull(),
    // Free-form pointer to what prompted the report, e.g. "match:<id>", "conversation:<id>",
    // "profile" — not a foreign key, since the referenced thing may be deleted later.
    context: text("context"),
    status: userReportStatus("status").notNull().default("open"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    reviewedAt: timestamp("reviewed_at"),
    reviewedByUserId: text("reviewed_by_user_id").references(() => user.id),
  },
  (table) => [
    index("user_report_reportedUserId_idx").on(table.reportedUserId),
    index("user_report_status_idx").on(table.status),
  ],
);
