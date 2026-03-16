import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { z } from "zod";
import { and, ilike, sql, or, not, desc } from "drizzle-orm";
import { db } from "../../../db";
import { organization } from "../../../db/schema/auth/schema";
import { searchOrganizationsValidator } from "../validators";

const baseFields = {
  id: organization.id,
  name: organization.name,
  slug: organization.slug,
  logo: organization.logo,
  pinEnabled: organization.pinEnabled,
};

const notHidden = or(
  sql`${organization.metadata} IS NULL`,
  not(sql`${organization.metadata} LIKE '%"hidden":true%'`),
);

export const searchOrganizations = async (c: Context<HonoContext>) => {
  try {
    // @ts-ignore
    const validated = c.req.valid("query") as z.infer<typeof searchOrganizationsValidator>;

    const query = validated.query?.trim();

    if (!query) {
      const [rows, [countRow]] = await Promise.all([
        db
          .select(baseFields)
          .from(organization)
          .where(notHidden)
          .orderBy(organization.name)
          .limit(validated.limit)
          .offset(validated.offset),
        db
          .select({ count: sql<number>`count(*)` })
          .from(organization)
          .where(notHidden),
      ]);

      const total = Number(countRow?.count ?? 0);
      return c.json({ organizations: rows, total, hasMore: validated.offset + rows.length < total });
    }

    // Fuzzy search using pg_trgm similarity + ilike fallback
    // word_similarity checks if query is similar to any word in the name
    const similarityScore = sql<number>`greatest(
      similarity(lower(${organization.name}), lower(${query})),
      word_similarity(lower(${query}), lower(${organization.name}))
    )`;

    const whereClause = and(
      or(
        sql`${similarityScore} > 0.15`,
        ilike(organization.name, `%${query}%`),
      ),
      notHidden,
    );

    const rows = await db
      .select({ ...baseFields, score: similarityScore })
      .from(organization)
      .where(whereClause)
      .orderBy(desc(similarityScore))
      .limit(validated.limit)
      .offset(validated.offset);

    // Skip count query when first page has fewer results than limit
    let total: number;
    let hasMore: boolean;
    if (validated.offset === 0 && rows.length < validated.limit) {
      total = rows.length;
      hasMore = false;
    } else {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(organization)
        .where(whereClause);
      total = Number(countRow?.count ?? 0);
      hasMore = validated.offset + rows.length < total;
    }

    // Strip internal score field from response
    const organizations = rows.map(({ score, ...org }) => org);

    return c.json({ organizations, total, hasMore });
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
