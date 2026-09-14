import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization } from "../auth/schema";

/**
 * A club-wide closure period (school holidays, etc). Course occurrence generation skips any
 * date falling inside one of these — the club sets them once, every course created or
 * regenerated afterwards automatically excludes them through its end date.
 */
export const vacationPeriod = pgTable(
  "vacation_period",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("vacation_period_organizationId_idx").on(table.organizationId)],
);
