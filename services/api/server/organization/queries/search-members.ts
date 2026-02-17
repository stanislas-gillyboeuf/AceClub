import type { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, user } from "../../../db/schema/auth/schema";
import { eq, and, ilike, ne, sql } from "drizzle-orm";

export const searchMembers = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user");
  if (!currentUser) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // @ts-ignore
  const validated = c.req.valid("query");
  const { organizationId, search, limit, offset } = validated as {
    organizationId: string;
    search?: string;
    limit: number;
    offset: number;
  };

  // Build conditions
  const conditions = [
    eq(member.organizationId, organizationId),
    ne(member.userId, currentUser.id),
  ];

  if (search && search.trim().length > 0) {
    conditions.push(ilike(user.name, `%${search.trim()}%`));
  }

  // Count total matching members
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)` })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(and(...conditions));

  // Fetch paginated results
  const members = await db
    .select({
      memberId: member.id,
      userId: user.id,
      name: user.name,
      image: user.image,
      role: member.role,
      joinedAt: member.createdAt,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(and(...conditions))
    .orderBy(user.name)
    .limit(limit)
    .offset(offset);

  return c.json({
    data: members.map((m) => ({
      memberId: m.memberId,
      user: {
        id: m.userId,
        name: m.name,
        image: m.image,
      },
      role: m.role,
      joinedAt: m.joinedAt?.toISOString() ?? null,
    })),
    pagination: {
      total: Number(count),
      limit,
      offset,
      hasMore: offset + limit < Number(count),
    },
  });
};
