import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { challengeTemplate } from "../../../db/schema/challenge/schema";
import { eq, and, sql, type SQL } from "drizzle-orm";
import { listChallengeTemplatesValidator } from "../validators";
import { z } from "zod";

export const listChallengeTemplates = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof listChallengeTemplatesValidator>;
  const limit = query.limit ?? 50;
  const offset = query.offset ?? 0;

  const conditions: SQL[] = [];
  if (query.type) conditions.push(eq(challengeTemplate.type, query.type));
  if (query.difficulty) conditions.push(eq(challengeTemplate.difficulty, query.difficulty));
  if (query.isActive !== undefined) conditions.push(eq(challengeTemplate.isActive, query.isActive));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [templates, countResult] = await Promise.all([
    db
      .select()
      .from(challengeTemplate)
      .where(where)
      .orderBy(challengeTemplate.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(challengeTemplate)
      .where(where),
  ]);

  return c.json({
    templates,
    total: Number(countResult[0]?.count ?? 0),
    limit,
    offset,
  });
};
