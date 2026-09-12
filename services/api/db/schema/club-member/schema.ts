import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

/**
 * Per-club profile data for a member — a user can have a different license
 * number/phone per club, matching the multi-org membership model already in
 * place for `member`/`user_preference`.
 */
export const clubMemberProfile = pgTable(
  "club_member_profile",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    licenseNumber: text("license_number"),
    licenseValidUntil: timestamp("license_valid_until"),
    phoneOverride: text("phone_override"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex("club_member_profile_userId_organizationId_uidx").on(
      table.userId,
      table.organizationId,
    ),
    index("club_member_profile_organizationId_idx").on(table.organizationId),
  ],
);
