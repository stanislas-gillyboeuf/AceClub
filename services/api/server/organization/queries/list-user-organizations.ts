import { Context } from "hono";
import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { member, organization } from "../../../db/schema/auth/schema";
import { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { listUserOrganizationsValidator } from "../validators";

export const listUserOrganizations = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const { userId } = c.req.valid("query") as z.infer<typeof listUserOrganizationsValidator>;

  const userMembers = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      metadata: organization.metadata,
      address: organization.address,
      latitude: organization.latitude,
      longitude: organization.longitude,
    })
    .from(member)
    .innerJoin(organization, eq(member.organizationId, organization.id))
    .where(eq(member.userId, userId));

  // Filter out hidden organizations
  const filtered = userMembers.filter((org) => {
    if (!org.metadata) return true;
    try {
      const meta = typeof org.metadata === "string" ? JSON.parse(org.metadata) : org.metadata;
      return !meta.hidden;
    } catch {
      return true;
    }
  });

  return c.json(filtered);
};
