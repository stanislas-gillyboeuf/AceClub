import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { member } from "../db/schema/auth/schema";
import { assertOrgAdmin } from "./org-member";

/** Eligible for the club-admin dashboard at all — owner/admin, same check as the court domain. */
export async function assertClubAdmin(userId: string, organizationId: string): Promise<boolean> {
  return assertOrgAdmin(userId, organizationId);
}

/**
 * Full admin — the "restricted dashboard access" tier is retired for now, so this is
 * currently equivalent to assertClubAdmin. Kept as a separate name so the financial/
 * messaging/roles gates it guards are easy to find if that tier comes back.
 */
export async function assertClubFullAdmin(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  return assertClubAdmin(userId, organizationId);
}

/** Coach — a distinct role from owner/admin, scoped to their own courses only. */
export async function assertCoach(userId: string, organizationId: string): Promise<boolean> {
  const [memberRecord] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1);

  return memberRecord?.role === "coach";
}
