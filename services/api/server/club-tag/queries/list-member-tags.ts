import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubMemberTag } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { isMemberOfOrg, notFound } from "../../../lib/club-access";
import { listMemberTagsValidator } from "../validators";

export const listMemberTags = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("query") as z.infer<typeof listMemberTagsValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  if (!(await isMemberOfOrg(validated.userId, validated.organizationId))) return notFound(c);

  const rows = await db
    .select({ tagId: clubMemberTag.tagId })
    .from(clubMemberTag)
    .where(
      and(eq(clubMemberTag.organizationId, validated.organizationId), eq(clubMemberTag.userId, validated.userId)),
    );

  return c.json({ tagIds: rows.map((r) => r.tagId) });
};
