import { index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization } from "../auth/schema";
import { SportType } from "../user-preference/schema";

/**
 * A club's own custom skill-level category (e.g. "Groupe compétition"), offered alongside
 * the built-in FFT/padel scales — see server/club-level/lib/builtin-levels.ts.
 */
export const clubLevelCategory = pgTable(
  "club_level_category",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    sport: SportType("sport").notNull(),
    name: text("name").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("club_level_category_org_sport_name_uidx").on(
      table.organizationId,
      table.sport,
      table.name,
    ),
    index("club_level_category_organizationId_idx").on(table.organizationId),
  ],
);
