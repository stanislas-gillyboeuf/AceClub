import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { organization, member } from "../../../db/schema/auth/schema";
import { eq, sql, ilike } from "drizzle-orm";
import { listOrganizationsValidator } from "../validators";
import { z } from "zod";

export const listOrganizations = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<
    typeof listOrganizationsValidator
  >;

  const limit = validated.limit ?? 20;
  const offset = validated.offset ?? 0;

  const conditions = [];

  if (validated.searchValue) {
    conditions.push(ilike(organization.name, `%${validated.searchValue}%`));
  }

  const whereClause =
    conditions.length > 0 ? conditions[0] : undefined;

  const [orgs, countResult] = await Promise.all([
    db
      .select({
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        logo: organization.logo,
        createdAt: organization.createdAt,
        metadata: organization.metadata,
        pin: organization.pin,
        pinEnabled: organization.pinEnabled,
        memberCount: sql<number>`cast(count(${member.id}) as int)`,
      })
      .from(organization)
      .leftJoin(member, eq(organization.id, member.organizationId))
      .where(whereClause)
      .groupBy(organization.id)
      .orderBy(organization.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(organization)
      .where(whereClause),
  ]);

  return c.json({
    organizations: orgs,
    total: countResult[0]?.count ?? 0,
  });
};
