import { Context } from "hono";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import type { HonoContext } from "../../../types/hono";
import { db } from "../../../db";
import { clubTag } from "../../../db/schema";
import { assertClubFullAdmin } from "../../../middleware/club-admin";
import { deleteTagValidator } from "../validators";

// A rule referencing this tag's id keeps that id in its JSONB conditions — the tag simply stops
// matching any member going forward. No FK from tarifRule.conditions to clubTag, so no cleanup needed.
export const deleteTag = async (c: Context<HonoContext>) => {
  const currentUser = c.get("user")!;
  // @ts-ignore
  const validated = c.req.valid("json") as z.infer<typeof deleteTagValidator>;

  const isFullAdmin = await assertClubFullAdmin(currentUser.id, validated.organizationId);
  if (!isFullAdmin) {
    return c.json({ error: "Forbidden", message: "Full admin access required" }, 403);
  }

  await db
    .delete(clubTag)
    .where(and(eq(clubTag.id, validated.tagId), eq(clubTag.organizationId, validated.organizationId)));

  return c.json({ success: true });
};
