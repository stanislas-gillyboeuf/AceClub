import { index, integer, pgTable, text, timestamp, uniqueIndex, boolean } from "drizzle-orm/pg-core";
import { ulid } from "ulid";
import { organization, user } from "../auth/schema";

/**
 * A family/household within one club. Ranks for the "family discount" rules are COMPUTED from the
 * household's members (server/pricing/lib/household-rank.ts), not typed in. `payerUserId` is the
 * member who pays for the household; `contactEmail` is where the club writes to when a child has
 * no email of their own.
 */
export const household = pgTable(
  "household",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => ulid()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    payerUserId: text("payer_user_id").references(() => user.id, { onDelete: "set null" }),
    contactEmail: text("contact_email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("household_organizationId_idx").on(table.organizationId)],
);

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
    // Pricing-engine inputs (server/pricing/lib/member-profile-adapter.ts). Nullable with no
    // default — null means "not yet entered by an admin", not "false"/"none", so the engine can
    // tell the two apart and surface a clear "missing data" state instead of guessing.
    licensedElsewhere: boolean("licensed_elsewhere"),
    // Manual OVERRIDE of the computed family rank (1st, 2nd, 3rd...). null = automatic: the rank is
    // computed from `householdId` in server/pricing/lib/household-rank.ts.
    householdRank: integer("household_rank"),
    householdId: text("household_id").references(() => household.id, { onDelete: "set null" }),
    communeInsee: text("commune_insee"),
    communeName: text("commune_name"), // kept alongside the code so the UI never has to re-resolve it
    // Club-level override of user.date_of_birth ("YYYY-MM-DD"). Takes priority in the pricing
    // adapter so an admin can fix a wrong/legacy value without touching the user's own account.
    dateOfBirth: text("date_of_birth"),
    // Whether this member pays a cotisation. null = not set: follow the role (only "member" pays,
    // see server/club-member/lib/adherent.ts) — an admin/coach can be flagged as an adherent.
    isAdherent: boolean("is_adherent"),
    // Explicit "new member" (pays the entry fee) vs "existing". null = not set: the pricing adapter
    // falls back to "joined after the season started" (server/pricing/lib/resolve-is-new.ts).
    isNewMember: boolean("is_new_member"),
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
    index("club_member_profile_householdId_idx").on(table.householdId),
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
