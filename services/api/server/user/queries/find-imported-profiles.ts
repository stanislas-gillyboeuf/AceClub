import { Context } from "hono";
import { and, eq, sql } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { user, organization } from "../../../db/schema/auth/schema";
import { clubMemberProfile, household } from "../../../db/schema/club-member/schema";

/**
 * Looks up CSV-imported ("ghost") member profiles whose email matches the CALLER's own verified
 * email — never an arbitrary address the client passes in, so this can't be used to probe whether
 * some other email exists in the system. Two ways a profile can match:
 *  - Direct: the ghost's own `user.email` is the real one from the import (no sharing/ambiguity).
 *  - Household: a parent/child import where only `household.contactEmail` kept the real address
 *    (the child ghosts got a fabricated technical email) — every profile in that household matches.
 */
export const findImportedProfiles = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;

  if (!currentUser.emailVerified) {
    return c.json({ error: "Forbidden", message: "Email not verified" }, 403);
  }

  const targetEmail = currentUser.email.trim().toLowerCase();

  const fields = {
    userId: clubMemberProfile.userId,
    name: user.name,
    licenseNumber: clubMemberProfile.licenseNumber,
    organizationId: clubMemberProfile.organizationId,
    organizationName: organization.name,
    dateOfBirth: clubMemberProfile.dateOfBirth,
  };

  const [directMatches, householdMatches] = await Promise.all([
    db
      .select(fields)
      .from(user)
      .innerJoin(clubMemberProfile, eq(clubMemberProfile.userId, user.id))
      .innerJoin(organization, eq(organization.id, clubMemberProfile.organizationId))
      .where(and(eq(user.is_ghost, true), eq(sql`lower(${user.email})`, targetEmail))),
    db
      .select(fields)
      .from(household)
      .innerJoin(clubMemberProfile, eq(clubMemberProfile.householdId, household.id))
      .innerJoin(user, eq(user.id, clubMemberProfile.userId))
      .innerJoin(organization, eq(organization.id, clubMemberProfile.organizationId))
      .where(
        and(eq(user.is_ghost, true), eq(sql`lower(${household.contactEmail})`, targetEmail)),
      ),
  ]);

  const byUserId = new Map<string, (typeof directMatches)[number]>();
  for (const row of [...directMatches, ...householdMatches]) {
    byUserId.set(row.userId, row);
  }

  return c.json({ profiles: [...byUserId.values()] });
};
