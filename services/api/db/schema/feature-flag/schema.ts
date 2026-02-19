import { pgTable, text, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";
import { organization } from "../auth/schema";

export const featureFlag = pgTable(
  "feature_flag",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    enabled: boolean("enabled").default(false).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("feature_flag_key_uidx").on(table.key)],
);

export const organizationFeatureFlag = pgTable(
  "organization_feature_flag",
  {
    id: text("id").primaryKey(),
    featureFlagId: text("feature_flag_id")
      .notNull()
      .references(() => featureFlag.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [uniqueIndex("org_feature_flag_uidx").on(table.featureFlagId, table.organizationId)],
);
