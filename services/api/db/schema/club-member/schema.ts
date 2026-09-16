import { index, pgTable, text, timestamp, uniqueIndex, boolean } from "drizzle-orm/pg-core";
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
    medicalCertificateValidUntil: timestamp("medical_certificate_valid_until"),
    phoneOverride: text("phone_override"),
    city: text("city"),
    isVip: boolean("is_vip").notNull().default(false),
    // Superseded by clubMemberNote (timestamped, authored, append-only) but kept — dropping
    // a column is a destructive migration and any pre-existing content stays intact.
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

/** Timestamped, authored staff note on a member — append-only, no edit/delete in v1. */
export const clubMemberNote = pgTable(
  "club_member_note",
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
    authorUserId: text("author_user_id")
      .notNull()
      .references(() => user.id),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("club_member_note_organizationId_userId_idx").on(table.organizationId, table.userId),
  ],
);
