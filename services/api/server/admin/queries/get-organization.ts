import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organization, member } from "../../../db/schema/auth/schema";
import { eq, sql } from "drizzle-orm";

export const getOrganization = async (c: Context<HonoContext>) => {
  const organizationId = c.req.param("organizationId");

  const [org] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      metadata: organization.metadata,
      pin: organization.pin,
      pinEnabled: organization.pinEnabled,
      address: organization.address,
      memberCount: sql<number>`cast(count(${member.id}) as int)`,
    })
    .from(organization)
    .leftJoin(member, eq(organization.id, member.organizationId))
    .where(eq(organization.id, organizationId))
    .groupBy(organization.id)
    .limit(1);

  if (!org) {
    return c.json({ error: "NotFound", message: "Organization not found" }, 404);
  }

  return c.json({ organization: org });
};
