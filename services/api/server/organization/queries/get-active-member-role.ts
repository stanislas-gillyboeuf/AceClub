import { Context } from "hono";
import { and, eq } from "drizzle-orm";
import { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, organization } from "../../../db/schema/auth/schema";

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
      onboardingCompleted: organization.onboardingCompleted,
    })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(and(eq(member.organizationId, organizationId), eq(member.userId, user.id)))
    .limit(1);

  if (!memberRecord) {
    return c.json(null);
  }

  return c.json(memberRecord);
};
