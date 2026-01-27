import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { ilike, sql } from "drizzle-orm";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { searchOrganizationsValidator } from "../validators";

export const searchOrganizations = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("query") as z.infer<typeof searchOrganizationsValidator>;

    const query = validated.query?.trim();
    const whereClause = query ? ilike(organization.name, `%${query}%`) : undefined;

    const organizationsQuery = whereClause
      ? db
          .select({ id: organization.id, name: organization.name, slug: organization.slug, logo: organization.logo })
          .from(organization)
          .where(whereClause)
      : db
          .select({ id: organization.id, name: organization.name, slug: organization.slug, logo: organization.logo })
          .from(organization);

    const totalQuery = whereClause
      ? db
          .select({ count: sql<number>`count(*)` })
          .from(organization)
          .where(whereClause)
      : db.select({ count: sql<number>`count(*)` }).from(organization);

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

