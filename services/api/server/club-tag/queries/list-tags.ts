import { Context } from "hono";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubTag } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { listTagsValidator } from "../validators";

export const listTags = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listTagsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  const tags = await db
    .select({ id: clubTag.id, name: clubTag.name, sortOrder: clubTag.sortOrder })
    .from(clubTag)
    .where(eq(clubTag.organizationId, validated.organizationId))
    .orderBy(asc(clubTag.sortOrder), asc(clubTag.name));

  return c.json({ tags });
};
