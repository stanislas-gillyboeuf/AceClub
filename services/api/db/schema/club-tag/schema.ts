import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

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

/** Assigns one of a club's custom tags to a real member — referenced by the pricing engine's
 * `tag` condition (via server/pricing/lib/member-profile-adapter.ts). */
export const clubMemberTag = pgTable(
  "club_member_tag",
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
    tagId: text("tag_id")
      .notNull()
      .references(() => clubTag.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("club_member_tag_org_user_tag_uidx").on(
      table.organizationId,
      table.userId,
      table.tagId,
    ),
    index("club_member_tag_organizationId_userId_idx").on(table.organizationId, table.userId),
  ],
);
