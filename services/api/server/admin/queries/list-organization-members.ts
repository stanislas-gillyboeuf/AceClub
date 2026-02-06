import { Context } from "hono";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, user } from "../../../db/schema/auth/schema";
import { eq, sql } from "drizzle-orm";
import { listOrganizationMembersValidator } from "../validators";
import { z } from "zod";

export const listOrganizationMembers = async (c: Context<HonoContext>) => {
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<
    typeof listOrganizationMembersValidator
  >;

  const limit = validated.limit ?? 20;
  const offset = validated.offset ?? 0;

  const [members, countResult] = await Promise.all([
    db
      .select({
        id: member.id,
        role: member.role,
        createdAt: member.createdAt,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userImage: user.image,
        userBanned: user.banned,
      })
      .from(member)
      .innerJoin(user, eq(member.userId, user.id))
      .where(eq(member.organizationId, validated.organizationId))
      .orderBy(member.createdAt)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(member)
      .where(eq(member.organizationId, validated.organizationId)),
  ]);

  return c.json({
    members,
    total: countResult[0]?.count ?? 0,
  });
};
