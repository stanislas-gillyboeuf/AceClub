import { Context } from "hono";
import { z } from "zod";
import { and, eq, ilike } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, user } from "../../../db/schema";
import { searchMembersValidator } from "../validators";

export const searchMembers = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof searchMembersValidator>;

  const rows = await db
    .select({ userId: user.id, name: user.name, avatarUrl: user.image })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .where(and(eq(member.organizationId, query.organizationId), ilike(user.name, `%${query.query}%`)))
    .limit(10);

  return c.json(rows.filter((row) => row.userId !== currentUser.id));
};
