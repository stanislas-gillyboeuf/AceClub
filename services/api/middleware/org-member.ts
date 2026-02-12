import { db } from "../db";
import { member } from "../db/schema/auth/schema";
import { and, eq } from "drizzle-orm";

export async function assertOrgAdmin(userId: string, organizationId: string): Promise<boolean> {
  const [memberRecord] = await db
    .select()
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, userId)))
    .limit(1);

  if (!memberRecord || !["owner", "admin"].includes(memberRecord.role)) {
    return false;
  }

  return true;
}
