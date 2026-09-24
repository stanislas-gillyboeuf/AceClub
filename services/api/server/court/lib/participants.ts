import { and, eq, inArray } from "drizzle-orm";
import { db } from "../../../db";
import { member } from "../../../db/schema";

// Registered participants other than the caller must belong to the court's club: the caller's own
// access is already gated by canAccessCourt, and guests have no userId (guestName only).
export async function participantsAreClubMembers(
  organizationId: string,
  callerUserId: string,
  userIds: Array<string | null | undefined>,
): Promise<boolean> {
  const others = [...new Set(userIds.filter((id): id is string => !!id && id !== callerUserId))];
  if (others.length === 0) return true;
  const rows = await db
    .select({ userId: member.userId })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), inArray(member.userId, others)));
  return rows.length === others.length;
}
