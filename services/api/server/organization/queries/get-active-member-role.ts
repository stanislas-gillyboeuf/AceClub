import { Context } from "hono";
import { and, eq } from "drizzle-orm";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member } from "../../../db/schema/auth/schema";

export const getActiveMemberRole = async (c: Context<HonoContext>) => {
  const user = c.get("user");
  const session = c.get("session");
  const organizationId = session?.activeOrganizationId;

  if (!user || !organizationId) {
    return c.json(null);
  }

  const [memberRecord] = await db
    .select({
      role: member.role,
      restrictedDashboardAccess: member.restrictedDashboardAccess,
    })
    .from(member)
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, user.id)))
    .limit(1);

  if (!memberRecord) {
    return c.json(null);
  }

  return c.json(memberRecord);
};
