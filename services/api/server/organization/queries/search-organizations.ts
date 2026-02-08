import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { and, ilike, sql, or, not } from "drizzle-orm";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { searchOrganizationsValidator } from "../validators";

export const searchOrganizations = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("query") as z.infer<typeof searchOrganizationsValidator>;

    const query = validated.query?.trim();
    const notHidden = or(
      sql`${organization.metadata} IS NULL`,
      not(sql`${organization.metadata} LIKE '%"hidden":true%'`),
    );
    const whereClause = query
      ? and(ilike(organization.name, `%${query}%`), notHidden)
      : notHidden;

    const selectFields = {
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      pinEnabled: organization.pinEnabled,
    };

    const organizationsQuery = db
      .select(selectFields)
      .from(organization)
      .where(whereClause);

    const totalQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(organization)
      .where(whereClause);

    const [rows, [countRow]] = await Promise.all([
      organizationsQuery.orderBy(organization.name).limit(validated.limit).offset(validated.offset),
      totalQuery,
    ]);

    const total = Number(countRow?.count ?? 0);
    const hasMore = validated.offset + rows.length < total;

    return c.json({
      organizations: rows,
      total,
      hasMore,
    });
  } catch (error) {
    const errorMessage = (error as Error).message;
    return c.json(
      {
        error: "Internal server error",
        message: errorMessage,
      },
      500,
    );
  }
};
