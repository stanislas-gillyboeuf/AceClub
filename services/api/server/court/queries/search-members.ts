import { Context } from "hono";
import { z } from "zod";
import { and, eq, ilike } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { member, user } from "../../../db/schema";
import { isOrgMember } from "../../../middleware/org-member";
import { searchMembersValidator } from "../validators";

export const searchMembers = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const query = c.req.valid("query") as z.infer<typeof searchMembersValidator>;

  if (!(await isOrgMember(currentUser.id, query.organizationId))) {
    return c.json({ error: "Forbidden", message: "You are not a member of this club" }, 403);
  }

  const rows = await db
    .select({ userId: user.id, name: user.name, avatarUrl: user.image })
    .from(member)
    .innerJoin(user, eq(user.id, member.userId))
    .where(and(eq(member.organizationId, query.organizationId), ilike(user.name, `%${query.query}%`)))
    .limit(10);

  return c.json(rows.filter((row) => row.userId !== currentUser.id));
};
