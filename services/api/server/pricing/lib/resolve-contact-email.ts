import { alias } from "drizzle-orm/pg-core";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { member, user, clubMemberProfile, household } from "../../../db/schema";
import { pickContactEmail } from "./contact-email";

export { NO_CONTACT_EMAIL_REASON, pickContactEmail, type ContactEmailSources } from "./contact-email";

/** Batch version: one pass of queries, scoped to `organizationId` (a member of another club is
 * never resolved). Members absent from the club map to null. */
export async function resolveContactEmails(
  organizationId: string,
  userIds: string[],
): Promise<Map<string, string | null>> {
  const result = new Map<string, string | null>();
  if (userIds.length === 0) return result;

  const payer = alias(user, "household_payer");
  const rows = await db
    .select({
      userId: member.userId,
      ownEmail: user.email,
      householdContactEmail: household.contactEmail,
      payerEmail: payer.email,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .leftJoin(
      clubMemberProfile,
      and(eq(clubMemberProfile.userId, member.userId), eq(clubMemberProfile.organizationId, member.organizationId)),
    )
    .leftJoin(
      household,
      and(eq(household.id, clubMemberProfile.householdId), eq(household.organizationId, member.organizationId)),
    )
    .leftJoin(payer, eq(payer.id, household.payerUserId))
    .where(and(eq(member.organizationId, organizationId), inArray(member.userId, userIds)));

  for (const row of rows) {
    result.set(row.userId, pickContactEmail(row));
  }
  for (const id of userIds) {
    if (!result.has(id)) result.set(id, null);
  }
  return result;
}

export async function resolveContactEmail(organizationId: string, userId: string): Promise<string | null> {
  const map = await resolveContactEmails(organizationId, [userId]);
  return map.get(userId) ?? null;
}
