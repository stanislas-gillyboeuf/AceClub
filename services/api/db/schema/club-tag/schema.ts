import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization } from "../auth/schema";

/**
 * A club's own custom member status/tag (e.g. "Étudiant", "Membre du bureau"). Assigned to
 * members and referenced by id (not name) from pricing rule conditions, so a rename never
 * breaks a rule — see server/pricing/lib/engine/conditions.ts.
 */
export const clubTag = pgTable(
  "club_tag",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("club_tag_org_name_uidx").on(table.organizationId, table.name),
    index("club_tag_organizationId_idx").on(table.organizationId),
  ],
);
