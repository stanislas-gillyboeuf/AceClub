import { db } from "../db";
import { member } from "../db/schema/auth/schema";
import { and, eq } from "drizzle-orm";
import { assertOrgAdmin } from "./org-member";

/** Eligible for the club-admin dashboard at all — owner/admin, same check as the court domain. */
export async function assertClubAdmin(userId: string, organizationId: string): Promise<boolean> {
  return assertOrgAdmin(userId, organizationId);
}

/** Full admin — eligible AND not flagged restricted (financial/messaging/roles data). */
export async function assertClubFullAdmin(
  userId: string,
  organizationId: string,
): Promise<boolean> {
  const [memberRecord] = await db
    .select({ role: member.role, restrictedDashboardAccess: member.restrictedDashboardAccess })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1);

  if (!memberRecord || !["owner", "admin"].includes(memberRecord.role)) {
    return false;
  }

  return !memberRecord.restrictedDashboardAccess;
}
